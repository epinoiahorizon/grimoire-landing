/**
 * studio.js — the composer's behaviour.
 *
 * Everything here runs in the maker's browser: the six tributaries, the file hashes, the root,
 * the CIDs. No upload, no account, no server call — a maker can see an object's identity before
 * anyone else does, which is the whole argument for computing provenance at the edge.
 *
 * A known-answer self-test runs on load (SELFTEST below, produced by wishing_tree.py). If the
 * browser's crypto or this module's canonicalisation drifts from the Python signer, the badge
 * turns red and says so, in the open, rather than printing a root nobody checked.
 */
import { FACETS, rootOf, cidOfBytes, sha256Hex } from '/assets/provenance.js';

const SELFTEST_FACETS = { who: 'a', what: 'b', when: 'c', why: 'd', where: 'e', how: 'f' };
const SELFTEST = '0xd6ba2579bb95ffdc39628a2af60fd669da5afe9af6ccca7aaf1777c275dc6221';

const $ = (id) => document.getElementById(id);
const state = (msg, cls = '') => {
	const el = $('state');
	el.textContent = msg;
	el.className = 'state ' + cls;
};

let vessel = null; // {name, mime, bytes, data, sha256, cid}
let poster = null;

const slug = (s) =>
	(s || 'relic').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'relic';

function facetsNow() {
	const f = {};
	for (const k of FACETS) f[k] = ($(k)?.value ?? '').trim();
	return f;
}

function attachmentsNow() {
	const a = [];
	if (vessel) a.push({ facet: 'what', name: vessel.name, sha256: vessel.sha256 });
	if (poster) a.push({ facet: 'how', name: poster.name, sha256: poster.sha256 });
	return a;
}

async function refresh() {
	const facets = facetsNow();
	const filled = FACETS.filter((k) => facets[k].length > 0).length;
	$('facetCount').textContent = `${filled}/6`;
	$('trib').textContent = `${filled}/6 complete`;

	const ready = filled === FACETS.length && $('title').value.trim().length > 0;
	$('btnJson').disabled = !ready;
	$('btnPayload').disabled = !ready;

	if (!filled) {
		$('root').textContent = '—';
		return;
	}
	const root = await rootOf(facets, attachmentsNow());
	$('root').textContent = root;
	$('btnJson').dataset.root = root;
}

async function onVessel(e) {
	const file = e.target.files?.[0];
	if (!file) return;
	const data = new Uint8Array(await file.arrayBuffer());
	const [sha256, cid] = await Promise.all([sha256Hex(data), cidOfBytes(data)]);
	vessel = { name: file.name, mime: file.type || 'model/gltf-binary', bytes: data.length, data, sha256, cid };
	$('vesselMeta').textContent = `${file.name} · ${(data.length / 1048576).toFixed(2)} MB`;
	$('vcid').textContent = cid;
	$('vsha').textContent = sha256.slice(0, 32) + '…';
	const url = URL.createObjectURL(new Blob([data], { type: vessel.mime }));
	const mv = $('mv');
	mv.src = url;
	mv.style.display = 'block';
	await refresh();
}

async function onPoster(e) {
	const file = e.target.files?.[0];
	if (!file) return;
	const data = new Uint8Array(await file.arrayBuffer());
	poster = { name: file.name, mime: file.type || 'image/png', bytes: data.length, data, sha256: await sha256Hex(data) };
	$('posterMeta').textContent = `${file.name} · ${(data.length / 1024).toFixed(0)} KB`;
	await refresh();
}

function productRecord(root) {
	const facets = facetsNow();
	const cat = $('category').value;
	const labels = { jewelry: 'Handmade Pendant', studio3d: '3D Studio', sovereign: 'Merlin Pass' };
	return {
		id: slug($('title').value),
		title: $('title').value.trim(),
		category: cat,
		categoryLabel: labels[cat],
		price: Number($('price').value || 0),
		badge: 'COMPOSED · ' + (facets.when || 'undated'),
		shortDesc: $('shortDesc').value.trim(),
		fullDesc: $('shortDesc').value.trim(),
		modelUrl: vessel ? `/assets/models/${vessel.name}` : '',
		has3D: Boolean(vessel),
		specs: { Media: vessel ? vessel.name : 'none', Poster: poster ? poster.name : 'none' },
		provenance: {
			schemaVersion: 1,
			facets,
			missing: FACETS.filter((k) => !facets[k]),
			root,
			model: vessel ? { url: `/assets/models/${vessel.name}`, sha256: vessel.sha256, bytes: vessel.bytes, cid: vessel.cid } : null,
			poster: poster ? { sha256: poster.sha256, bytes: poster.bytes } : null,
			convention: 'wishing_tree v1: leaf=sha256(0x00||canonical_json), node=sha256(0x01||l||r), pairwise fold with odd-node promotion'
		}
	};
}

function bazaarPayload(root) {
	return {
		title: $('title').value.trim(),
		description: $('shortDesc').value.trim(),
		facets: facetsNow(),
		root,
		media: attachmentsNow().map((a) => ({ ...a, url: a.name === vessel?.name ? `/assets/models/${a.name}` : undefined })),
		note: 'Upload the .glb at the Bazaar Studio (/studio) to host it, then paste the returned URL into assets/models/.'
	};
}

function show(title, text) {
	$('dlgTitle').textContent = title;
	$('dlgBody').textContent = text;
	$('dlg').showModal();
}

async function download() {
	const rec = productRecord($('btnJson').dataset.root);
	const blob = new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' });
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = `${rec.id}.json`;
	a.click();
	state('product JSON downloaded — commit it to assets/products/', 'ok');
}

async function copyPayload() {
	const text = JSON.stringify(bazaarPayload($('btnJson').dataset.root), null, 2);
	show('Bazaar payload', text);
	try {
		await navigator.clipboard.writeText(text);
		state('payload copied', 'ok');
	} catch {
		state('copy blocked by the browser — select from the dialog', 'bad');
	}
}

async function selfTest() {
	try {
		const got = await rootOf(SELFTEST_FACETS, []);
		const ok = got === SELFTEST;
		state(ok ? `self-test ok — browser crypto matches the python signer (${got.slice(0, 18)}…)` : `self-test FAILED — got ${got.slice(0, 18)}…, expected ${SELFTEST.slice(0, 18)}…`, ok ? 'ok' : 'bad');
		return ok;
	} catch (e) {
		state('self-test crashed: ' + e.message, 'bad');
		return false;
	}
}

for (const k of FACETS) $(k)?.addEventListener('input', () => refresh());
$('title').addEventListener('input', () => refresh());
$('vessel').addEventListener('change', onVessel);
$('poster').addEventListener('change', onPoster);
$('btnJson').addEventListener('click', download);
$('btnPayload').addEventListener('click', copyPayload);
$('dlgClose').addEventListener('click', () => $('dlg').close());
$('dlgCopy').addEventListener('click', async () => {
	try {
		await navigator.clipboard.writeText($('dlgBody').textContent);
	} catch {}
});

async function demo() {
	if (!location.search.includes('demo')) return;
	$('title').value = 'Solstice Crystal Talisman Pendant';
	$('shortDesc').value = 'Hand-forged 925 silver pendant holding a raw double-terminated quartz crystal, bindrunes cut by hand.';
	$('who').value = 'Epinoia Horizon Atelier';
	$('what').value = 'Solstice Crystal Talisman Pendant, 925 sterling silver, raw quartz';
	$('when').value = '2026-10-24';
	$('why').value = 'a talisman for alignment at the turning of the season';
	$('where').value = 'Epinoia Horizon Vault';
	$('how').value = 'lost-wax casting, hand engraving, oxidised antique finish';
	await refresh();
}

selfTest();
demo().then(refresh);
