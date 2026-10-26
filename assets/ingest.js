/**
 * ingest.js — take any common 3D file and end at a GLB with an identity.
 *
 * The store hosts static files, so there is no server to run Blender on (checked: the VM has
 * no blender binary). Conversion therefore happens here, in the maker's browser, with three.js
 * loaders and GLTFExporter — and the output is a GLB whose CID is computed before it leaves
 * the page. GLB passes through untouched; FBX and OBJ are converted.
 *
 *   .glb / .gltf  → no conversion, hashed as-is
 *   .fbx          → FBXLoader (binary or ascii) → GLTFExporter
 *   .obj          → OBJLoader → GLTFExporter
 *
 * A URL can be ingested instead of a file (?url=…), which is how the Forge and the vault's own
 * assets can be pulled in without a server-side fetcher.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { cidOfBytes, sha256Hex } from '/assets/provenance.js';

const $ = (id) => document.getElementById(id);
const say = (msg, cls = '') => {
	const el = $('state');
	el.textContent = msg;
	el.className = 'state ' + cls;
};

const kb = (n) => (n >= 1048576 ? (n / 1048576).toFixed(2) + ' MB' : (n / 1024).toFixed(1) + ' KB');
const extOf = (name) => (name.split('.').pop() || '').toLowerCase();

let last = null; // { name, glb, cid, sha256, converted, originalBytes }

function download(blob, name) {
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = name;
	a.click();
}

/** Load any supported format and return a THREE.Object3D. */
async function loadAny(name, bytes) {
	const ext = extOf(name);
	if (ext === 'glb' || ext === 'gltf') {
		const loader = new GLTFLoader();
		const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
		const gltf = await loader.parseAsync(buf, '');
		return { object: gltf.scene, converted: false };
	}
	if (ext === 'obj') {
		const text = new TextDecoder().decode(bytes);
		return { object: new OBJLoader().parse(text), converted: true };
	}
	if (ext === 'fbx') {
		const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
		return { object: new FBXLoader().parse(buf, ''), converted: true };
	}
	throw new Error(`unsupported format .${ext} — expected glb, gltf, fbx or obj`);
}

/** Export a scene to a binary GLB. */
async function toGLB(object) {
	const scene = new THREE.Scene();
	scene.add(object);
	const exporter = new GLTFExporter();
	const buf = await exporter.parseAsync(scene, { binary: true, onlyVisible: false });
	return new Uint8Array(buf);
}

function stats(object) {
	let tris = 0;
	let meshes = 0;
	let materials = new Set();
	object.traverse((o) => {
		if (!o.isMesh) return;
		meshes++;
		const g = o.geometry;
		tris += g.index ? g.index.count / 3 : (g.attributes.position?.count ?? 0) / 3;
		(materials.add(o.material?.name || 'unnamed'));
	});
	const box = new THREE.Box3().setFromObject(object);
	const size = box.getSize(new THREE.Vector3());
	return { meshes, tris: Math.round(tris), materials: [...materials], size: [size.x, size.y, size.z].map((v) => +v.toFixed(3)) };
}

async function ingest(name, bytes) {
	say(`reading ${name} — ${kb(bytes.length)}…`);
	const { object, converted } = await loadAny(name, bytes);
	const info = stats(object);
	const glb = converted ? await toGLB(object) : bytes;
	const [cid, sha256] = await Promise.all([cidOfBytes(glb), sha256Hex(glb)]);

	last = { name: name.replace(/\.[^.]+$/, '') + '.glb', glb, cid, sha256, converted, originalBytes: bytes.length };

	$('out').style.display = 'block';
	$('fmt').textContent = converted ? `${extOf(name).toUpperCase()} → GLB` : 'GLB (no conversion)';
	$('size').textContent = converted ? `${kb(bytes.length)} → ${kb(glb.length)}` : kb(glb.length);
	$('mesh').textContent = `${info.meshes} meshes · ${info.tris.toLocaleString()} tris · ${info.materials.length} materials`;
	$('dims').textContent = info.size.join(' × ');
	$('cid').textContent = cid;
	$('sha').textContent = sha256;
	say(converted ? `converted and hashed in the browser — ${kb(glb.length)} GLB` : 'GLB accepted unchanged', 'ok');

	// ?echo=1 exposes the produced bytes so an outside tool can verify the claimed identity
	if (new URLSearchParams(location.search).has('echo')) {
		let bin = '';
		for (const b of glb) bin += String.fromCharCode(b);
		const pre = document.createElement('pre');
		pre.id = 'echo';
		pre.style.display = 'none';
		pre.textContent = btoa(bin);
		document.body.appendChild(pre);
	}
}

async function onFile(e) {
	const f = e.target.files?.[0];
	if (!f) return;
	try {
		await ingest(f.name, new Uint8Array(await f.arrayBuffer()));
	} catch (err) {
		say(err.message, 'bad');
	}
}

async function fromUrl(url) {
	try {
		say('fetching ' + url + '…');
		const res = await fetch(url);
		if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
		const bytes = new Uint8Array(await res.arrayBuffer());
		await ingest(new URL(url, location.href).pathname.split('/').pop() || 'asset.bin', bytes);
	} catch (err) {
		say(err.message, 'bad');
	}
}

$('file').addEventListener('change', onFile);
$('go').addEventListener('click', () => {
	const u = $('url').value.trim();
	if (u) fromUrl(u);
});
$('save').addEventListener('click', () => {
	if (!last) return;
	download(new Blob([last.glb], { type: 'model/gltf-binary' }), last.name);
	say('saved ' + last.name, 'ok');
});
$('copy').addEventListener('click', async () => {
	if (!last) return;
	const rec = { file: last.name, bytes: last.glb.length, cid: last.cid, sha256: last.sha256, convertedBy: 'browser/three.js' };
	try {
		await navigator.clipboard.writeText(JSON.stringify(rec, null, 2));
		say('manifest copied', 'ok');
	} catch {
		say('clipboard blocked', 'bad');
	}
});

// ?url=… makes the tool testable without a file dialog, and lets one surface ingest another's assets
const q = new URLSearchParams(location.search).get('url');
if (q) fromUrl(q);
