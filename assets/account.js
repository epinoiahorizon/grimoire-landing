/**
 * Epinoia account layer — two roles, one key.
 *
 * The store already kept buyers in localStorage (`eh_registered_buyers_dir`). This adds what the
 * creator side needs and the current build cannot express:
 *
 *   - roles: an account can be a buyer, a creator, or both
 *   - identity: every creator mints an Ed25519 did:key held in this browser (non-extractable),
 *     so a listing can be signed by its maker and checked by anyone
 *   - ownership: products carry `owner` (the account id) and `signature` (did + base64 sig)
 *
 * Static hosting means none of this is a security boundary against the site owner — it is a
 * boundary against *later edits*: a published listing's signature breaks if the price or story is
 * changed afterwards. Say that out loud in the UI rather than implying more.
 */
(function () {
	'use strict';

	const ACCOUNT_KEY = 'eh_sanctum_buyer_account';
	const DIR_KEY = 'eh_registered_buyers_dir';
	const PRODUCTS_KEY = 'epinoia_custom_products_v3';
	const ORDERS_KEY = 'eh_vault_orders';
	const DID_KEY = 'epinoia_account_did';
	const DB = 'epinoia-account';
	const STORE = 'keys';

	// ---------------------------------------------------------------- base58 / did:key
	const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
	const MAP = new Map([...ALPHABET].map((c, i) => [c, i]));

	function b58encode(bytes) {
		bytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
		let zeros = 0;
		while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
		const digits = [0];
		for (let i = zeros; i < bytes.length; i++) {
			let carry = bytes[i];
			for (let j = 0; j < digits.length; j++) {
				carry += digits[j] << 8;
				digits[j] = carry % 58;
				carry = (carry / 58) | 0;
			}
			while (carry) {
				digits.push(carry % 58);
				carry = (carry / 58) | 0;
			}
		}
		let out = '1'.repeat(zeros);
		for (let i = digits.length - 1; i >= 0; i--) out += ALPHABET[digits[i]];
		return out;
	}

	function b58decode(str) {
		let zeros = 0;
		while (zeros < str.length && str[zeros] === '1') zeros++;
		const bytes = [];
		for (let i = zeros; i < str.length; i++) {
			const v = MAP.get(str[i]);
			if (v === undefined) throw new Error('bad base58');
			let carry = v;
			for (let j = 0; j < bytes.length; j++) {
				carry += bytes[j] * 58;
				bytes[j] = carry & 0xff;
				carry >>= 8;
			}
			while (carry) {
				bytes.push(carry & 0xff);
				carry >>= 8;
			}
		}
		const body = bytes.reverse();
		const out = new Uint8Array(zeros + body.length);
		out.set(body, zeros);
		return out;
	}

	function didFromRaw(raw) {
		const prefixed = new Uint8Array(2 + raw.length);
		prefixed[0] = 0xed;
		prefixed[1] = 0x01;
		prefixed.set(raw, 2);
		return 'did:key:z' + b58encode(prefixed);
	}

	// ---------------------------------------------------------------- canonical json
	function canon(v) {
		if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
		if (v && typeof v === 'object') {
			return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
		}
		return JSON.stringify(v);
	}

	const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
	const enc = new TextEncoder();

	async function digestOf(obj) {
		// same leaf convention as the Wishing Tree: sha256(0x00 || canonical json)
		const payload = new Uint8Array([0, ...enc.encode(canon(obj))]);
		return await crypto.subtle.digest('SHA-256', payload);
	}

	// ---------------------------------------------------------------- key storage
	function idb() {
		return new Promise((res, rej) => {
			const r = indexedDB.open(DB, 1);
			r.onupgradeneeded = () => r.result.createObjectStore(STORE);
			r.onsuccess = () => res(r.result);
			r.onerror = () => rej(r.error);
		});
	}

	async function loadStoredKey() {
		const db = await idb();
		return await new Promise((res) => {
			const tx = db.transaction(STORE, 'readonly');
			const q = tx.objectStore(STORE).get('account');
			q.onsuccess = () => res(q.result || null);
			q.onerror = () => res(null);
		});
	}

	async function saveKey(kp, did) {
		const db = await idb();
		await new Promise((res, rej) => {
			const tx = db.transaction(STORE, 'readwrite');
			tx.objectStore(STORE).put({ ...kp, did }, 'account');
			tx.oncomplete = res;
			tx.onerror = () => rej(tx.error);
		});
	}

	/**
	 * Mint the account key. extractable must be true to export the raw public key — WebCrypto ties
	 * extractability to the pair — so the private key is exported once and re-imported as
	 * non-extractable. The raw private bytes exist for two statements and are never stored.
	 */
	async function mintKey() {
		const tmp = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
		const rawPub = await crypto.subtle.exportKey('raw', tmp.publicKey);
		const pkcs8 = await crypto.subtle.exportKey('pkcs8', tmp.privateKey);
		const privateKey = await crypto.subtle.importKey('pkcs8', pkcs8, { name: 'Ed25519' }, false, ['sign']);
		const publicKey = await crypto.subtle.importKey('raw', rawPub, { name: 'Ed25519' }, true, ['verify']);
		const did = didFromRaw(new Uint8Array(rawPub));
		return { kp: { privateKey, publicKey }, did };
	}

	// One key per page, always. Without this, an environment where IndexedDB never settles mints a
	// fresh identity on every call — and every listing signed a moment earlier becomes unverifiable.
	let sessionKey = null;

	async function getKey(create) {
		if (sessionKey) return sessionKey;
		let stored = null;
		try {
			stored = await Promise.race([
				loadStoredKey(),
				new Promise((res) => setTimeout(() => res('TIMEOUT'), 2500))
			]);
		} catch {
			stored = null;
		}
		if (stored && stored !== 'TIMEOUT') {
			sessionKey = stored;
			return sessionKey;
		}
		if (!create) return null;
		const { kp, did } = await mintKey();
		// IndexedDB never settles in some environments (private mode, a fresh headless profile).
		// Saving must not be able to block minting — the key is usable either way.
		try {
			await Promise.race([saveKey(kp, did), new Promise((res) => setTimeout(res, 1500))]);
		} catch {
			/* ephemeral: still valid for this page, just not remembered */
		}
		sessionKey = { ...kp, did, ephemeral: true };
		return sessionKey;
	}

	// ---------------------------------------------------------------- accounts
	function readJSON(key, fallback) {
		try {
			return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
		} catch {
			return fallback;
		}
	}

	function current() {
		try {
			return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || 'null');
		} catch {
			return null;
		}
	}

	function save(account) {
		localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
		const dir = readJSON(DIR_KEY, {});
		if (account && account.email) dir[account.email.toLowerCase()] = account;
		localStorage.setItem(DIR_KEY, JSON.stringify(dir));
		return account;
	}

	function signOut() {
		localStorage.removeItem(ACCOUNT_KEY);
	}

	const roles = (a) => (a && Array.isArray(a.roles) ? a.roles : a ? ['buyer'] : []);
	const isCreator = (a) => roles(a).includes('creator');

	/** Promote the signed-in account to creator and give it a key. Idempotent. */
	async function becomeCreator(handle) {
		const a = current();
		if (!a) throw new Error('sign in first');
		const key = await getKey(true);
		// An account keeps the DID it was created with. If this browser no longer holds that key we
		// must not quietly adopt a new identity — the old listings would stop verifying and nobody
		// would know why. Keep the identity, record the loss, and let the UI say so.
		const keyLost = !!(a.did && a.did !== key.did);
		const next = {
			...a,
			roles: [...new Set([...roles(a), 'creator'])],
			handle: handle || a.handle || (a.name || 'maker').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24),
			did: a.did || key.did,
			signingDid: key.did,
			keyLost
		};
		return save(next);
	}

	async function sign(obj) {
		const key = await getKey(true);
		const d = await digestOf(obj);
		const sig = await crypto.subtle.sign({ name: 'Ed25519' }, key.privateKey, new Uint8Array(d));
		return { did: key.did, algorithm: 'Ed25519', digest: hex(d), signature: btoa(String.fromCharCode(...new Uint8Array(sig))) };
	}

	async function verify(obj, proof) {
		try {
			const raw = b58decode(String(proof.did).replace(/^did:key:z/, '')).subarray(2);
			const pub = await crypto.subtle.importKey('raw', raw, { name: 'Ed25519' }, false, ['verify']);
			const d = await digestOf(obj);
			if (proof.digest && hex(d) !== proof.digest) return false;
			const sig = Uint8Array.from(atob(proof.signature), (c) => c.charCodeAt(0));
			return await crypto.subtle.verify({ name: 'Ed25519' }, pub, sig, new Uint8Array(d));
		} catch {
			return false;
		}
	}

	// ---------------------------------------------------------------- products
	/**
	 * The products this account owns. Falls back to base products from store.js (which have no
	 * owner) so a fresh creator sees an empty shelf with an explanation rather than an error.
	 */
	function myProducts() {
		const a = current();
		if (!a) return [];
		const custom = readJSON(PRODUCTS_KEY, []);
		return custom.filter((p) => p && p.owner && p.owner === a.id);
	}

	function myOrders() {
		const a = current();
		if (!a) return [];
		const all = readJSON(ORDERS_KEY, []);
		return all.filter((o) => !o.email || (a.email && o.email.toLowerCase() === a.email.toLowerCase()));
	}

	function withRole(a) {
		return { ...a, roles: roles(a), isCreator: isCreator(a) };
	}

	window.EpinoiaAccount = {
		current: () => withRole(current()),
		save,
		signOut,
		becomeCreator,
		sign,
		verify,
		getKey: (create) => getKey(!!create),
		myProducts,
		myOrders,
		isCreator: () => isCreator(current()),
		canon,
		didFromRaw,
		b58encode,
		b58decode
	};
})();
