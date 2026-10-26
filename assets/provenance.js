/**
 * provenance.js — browser-side roots and content IDs.
 *
 * The same bytes must produce the same root here as in wishing_tree.py, sigil-store.js,
 * DreamballAnchor.sol and the validator page. This module is the fourth implementation, so it is
 * written to be *provably* identical: `scripts/verify_provenance_js.mjs` in the es-dive repo
 * compares its output to Python's on fixed fixtures, including the odd-count fold.
 *
 *   import { FACETS, rootOf, cidOfBytes, sha256Hex } from '/assets/provenance.js';
 *   const root = await rootOf({ who, what, when, why, where, how }, [{ facet:'what', name, sha256 }]);
 *
 * Convention (wishing_tree v1):
 *   canon(o)   JSON, sorted keys, no whitespace, UTF-8, no ASCII escaping
 *   leaf       sha256(0x00 || canon({v:1, facet, value, attachments:[{name,sha256}]}))
 *   node       sha256(0x01 || left || right)
 *   fold       pairwise; an odd trailing node is promoted unchanged
 */

export const FACETS = ['who', 'what', 'when', 'why', 'where', 'how'];

const enc = new TextEncoder();

function sortDeep(v) {
	if (Array.isArray(v)) return v.map(sortDeep);
	if (v && typeof v === 'object') {
		const out = {};
		for (const k of Object.keys(v).sort()) out[k] = sortDeep(v[k]);
		return out;
	}
	return v;
}

/** Canonical JSON bytes. Keeps non-ASCII literal, matching Python's ensure_ascii=False. */
export function canon(obj) {
	return enc.encode(JSON.stringify(sortDeep(obj)));
}

export async function sha256Bytes(data) {
	const buf = data instanceof Uint8Array ? data : enc.encode(String(data));
	return new Uint8Array(await crypto.subtle.digest('SHA-256', buf));
}

export async function sha256Hex(data) {
	return [...(await sha256Bytes(data))].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hLeaf(obj) {
	// sha256(0x00 || canon) — one hash. Hashing canon first and then hashing that would be
	// sha256(0x00 || sha256(canon)), which is a different tree entirely.
	const c = canon(obj);
	const out = new Uint8Array(1 + c.length);
	out[0] = 0x00;
	out.set(c, 1);
	return sha256Bytes(out);
}

async function hNode(a, b) {
	const out = new Uint8Array(1 + a.length + b.length);
	out[0] = 0x01;
	out.set(a, 1);
	out.set(b, 1 + a.length);
	return sha256Bytes(out);
}

function hex(bytes) {
	return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Pairwise Merkle. An odd trailing node is promoted unchanged — same rule as Python. */
async function merkle(leaves) {
	let level = leaves.slice();
	while (level.length > 1) {
		const next = [];
		for (let i = 0; i < level.length; i += 2) {
			next.push(i + 1 === level.length ? level[i] : await hNode(level[i], level[i + 1]));
		}
		level = next;
	}
	return level[0];
}

/**
 * Root over the six tributaries. Attachments bind to a facet, so swapping a file changes the
 * root; an attachment with no facet belongs to 'what'.
 */
export async function rootOf(facets, attachments = []) {
	const leaves = [];
	for (const f of FACETS) {
		const att = attachments
			.filter((a) => (a.facet || 'what') === f)
			.map((a) => ({ name: a.name, sha256: a.sha256 }));
		leaves.push(await hLeaf({ v: 1, facet: f, value: String(facets?.[f] ?? '').trim(), attachments: att }));
	}
	return '0x' + hex(await merkle(leaves));
}

const B32 = 'abcdefghijklmnopqrstuvwxyz234567';

function base32(bytes) {
	let bits = 0;
	let value = 0;
	let out = '';
	for (const b of bytes) {
		value = (value << 8) | b;
		bits += 8;
		while (bits >= 5) {
			out += B32[(value >>> (bits - 5)) & 31];
			bits -= 5;
		}
	}
	if (bits > 0) out += B32[(value << (5 - bits)) & 31];
	return out;
}

/** CIDv1, raw codec, sha2-256 — the same multihash shape IPFS uses. */
export async function cidOfBytes(bytes) {
	const digest = await sha256Bytes(bytes);
	const pre = new Uint8Array([0x01, 0x55, 0x12, 0x20, ...digest]);
	return 'b' + base32(pre);
}

/** A drop-in replacement for the server's signature: same root, computed where the maker is. */
export async function describe(facets, files = []) {
	const attachments = [];
	for (const f of files) {
		attachments.push({
			facet: f.facet || 'what',
			name: f.name,
			bytes: f.bytes,
			sha256: await sha256Hex(f.data),
			cid: await cidOfBytes(f.data)
		});
	}
	return { root: await rootOf(facets, attachments), attachments };
}
