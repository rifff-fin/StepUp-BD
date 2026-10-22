// Temporary tool (not shipped): splits the AJ1 pair, finds the texture's UV islands, lets
// the QA script pick islands on screen, recolours them to Bred and exports a single shoe.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight('#ffffff', '#444444', 2.2));
const key = new THREE.DirectionalLight('#ffffff', 2);
key.position.set(3, 5, 4);
scene.add(key);
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 100);
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

type Island = { id: number; tris: number[]; area: number };
const lab: Record<string, unknown> = {};
(window as unknown as { lab: typeof lab }).lab = lab;

let shoe: THREE.Mesh;
let lace: THREE.Mesh;
let root: THREE.Group;
let islandOfTri: Int32Array;
let islands: Island[] = [];
let baseImage: HTMLCanvasElement;

function render() {
  renderer.render(scene, camera);
}

/** Keep only the triangles whose centroid lies on one side of the pair (shoe A or B). */
function keepSide(mesh: THREE.Mesh, axis: 'x' | 'y' | 'z', side: 1 | -1, split: number) {
  const g = mesh.geometry;
  const pos = g.attributes.position;
  const index = g.index!;
  const kept: number[] = [];
  for (let t = 0; t < index.count; t += 3) {
    let c = 0;
    for (let k = 0; k < 3; k++) {
      const i = index.getX(t + k);
      c += axis === 'x' ? pos.getX(i) : axis === 'y' ? pos.getY(i) : pos.getZ(i);
    }
    if ((c / 3 - split) * side > 0) kept.push(index.getX(t), index.getX(t + 1), index.getX(t + 2));
  }
  const next = g.clone();
  next.setIndex(kept);
  next.computeBoundingBox();
  next.computeBoundingSphere();
  mesh.geometry = next;
}

/** UV islands = triangles connected through shared vertex indices (glTF splits seams). */
function computeIslands(mesh: THREE.Mesh) {
  const index = mesh.geometry.index!;
  const n = mesh.geometry.attributes.position.count;
  const parent = new Int32Array(n).map((_, i) => i);
  const find = (a: number): number => {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]];
      a = parent[a];
    }
    return a;
  };
  for (let t = 0; t < index.count; t += 3) {
    const a = find(index.getX(t));
    parent[find(index.getX(t + 1))] = a;
    parent[find(index.getX(t + 2))] = a;
  }
  const uv = mesh.geometry.attributes.uv;
  const map = new Map<number, Island>();
  islandOfTri = new Int32Array(index.count / 3);
  for (let t = 0; t < index.count; t += 3) {
    const r = find(index.getX(t));
    let isl = map.get(r);
    if (!isl) {
      isl = { id: map.size, tris: [], area: 0 };
      map.set(r, isl);
    }
    isl.tris.push(t / 3);
    islandOfTri[t / 3] = isl.id;
    const [a, b, c] = [index.getX(t), index.getX(t + 1), index.getX(t + 2)];
    isl.area +=
      Math.abs(
        (uv.getX(b) - uv.getX(a)) * (uv.getY(c) - uv.getY(a)) -
          (uv.getX(c) - uv.getX(a)) * (uv.getY(b) - uv.getY(a)),
      ) / 2;
  }
  islands = [...map.values()];
}

/** Draws every triangle of `filter` islands into a 2D canvas in UV space. */
function drawIslands(
  ctx: CanvasRenderingContext2D,
  size: number,
  style: (isl: Island) => string | null,
) {
  const index = shoe.geometry.index!;
  const uv = shoe.geometry.attributes.uv;
  for (const isl of islands) {
    const fill = style(isl);
    if (!fill) continue;
    ctx.fillStyle = fill;
    ctx.strokeStyle = fill;
    ctx.lineWidth = 2; // bleed past edges so seams don't show the old colour
    ctx.beginPath();
    for (const tri of isl.tris) {
      for (let k = 0; k < 3; k++) {
        const i = index.getX(tri * 3 + k);
        const x = uv.getX(i) * size;
        const y = uv.getY(i) * size; // glTF UV origin is top-left, like canvas
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();
  }
}

const hue = (id: number) => `hsl(${(id * 137.508) % 360} 85% 55%)`;

function setMap(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.flipY = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = shoe.material as THREE.MeshStandardMaterial;
  mat.map = tex;
  mat.needsUpdate = true;
  render();
}

lab.load = async (url: string, axis: 'x' | 'y' | 'z', side: 1 | -1) => {
  const gltf = await new GLTFLoader().loadAsync(url);
  root = gltf.scene;
  scene.add(root);
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    if (m.name.includes('lace')) lace = m;
    else shoe = m;
  });
  // split point: middle of the pair along the chosen axis (geometry space)
  shoe.geometry.computeBoundingBox();
  const bb = shoe.geometry.boundingBox!;
  const split = (bb.min[axis] + bb.max[axis]) / 2;
  keepSide(shoe, axis, side, split);
  keepSide(lace, axis, side, split);
  computeIslands(shoe);
  const img = (shoe.material as THREE.MeshStandardMaterial).map!.image as ImageBitmap;
  baseImage = document.createElement('canvas');
  baseImage.width = img.width;
  baseImage.height = img.height;
  baseImage.getContext('2d')!.drawImage(img, 0, 0);
  lab.view(0);
  return { islands: islands.length, bbox: bb, texture: [img.width, img.height] };
};

/** Frames the kept shoe from an angle (degrees around the vertical axis). */
/** World-space box of the triangles actually kept (the buffer still holds both shoes). */
function keptBox() {
  const g = shoe.geometry;
  const pos = g.attributes.position;
  const index = g.index!;
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  shoe.updateMatrixWorld(true);
  for (let i = 0; i < index.count; i++) {
    v.fromBufferAttribute(pos, index.getX(i)).applyMatrix4(shoe.matrixWorld);
    box.expandByPoint(v);
  }
  return box;
}

lab.view = (deg: number, elevation = 0.25, dist = 1.6) => {
  const box = keptBox();
  const centre = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length();
  const a = THREE.MathUtils.degToRad(deg);
  camera.position.set(
    centre.x + Math.sin(a) * size * dist,
    centre.y + size * elevation,
    centre.z + Math.cos(a) * size * dist,
  );
  camera.lookAt(centre);
  render();
  return box;
};

lab.debug = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, 1024, 1024);
  drawIslands(ctx, 1024, (isl) => hue(isl.id));
  setMap(c);
};

lab.original = () => setMap(baseImage);

/** Island under a screen point (for identifying parts). */
lab.pick = (x: number, y: number) => {
  const ray = new THREE.Raycaster();
  ray.setFromCamera(
    new THREE.Vector2((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1),
    camera,
  );
  const hit = ray.intersectObject(shoe)[0];
  if (!hit || hit.faceIndex == null) return null;
  const isl = islands[islandOfTri[hit.faceIndex]];
  let colour = '';
  if (hit.uv) {
    const px = baseImage
      .getContext('2d')!
      .getImageData(
        Math.floor(hit.uv.x * baseImage.width),
        Math.floor(hit.uv.y * baseImage.height),
        1,
        1,
      ).data;
    colour = '#' + [px[0], px[1], px[2]].map((c) => c.toString(16).padStart(2, '0')).join('');
  }
  return { island: isl.id, area: +isl.area.toFixed(4), colour };
};

lab.islandList = () =>
  islands.map((i) => ({ id: i.id, tris: i.tris.length, area: +i.area.toFixed(4) }));

/** Highlights islands (others grey) to verify a classification. */
lab.highlight = (colours: Record<string, string>) => {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(baseImage, 0, 0, 1024, 1024);
  drawIslands(ctx, 1024, (isl) => colours[String(isl.id)] ?? null);
  setMap(c);
};

/** World-space box of one island's triangles. */
function islandBox(id: number) {
  const g = shoe.geometry;
  const pos = g.attributes.position;
  const index = g.index!;
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  for (const tri of islands[id].tris) {
    for (let k = 0; k < 3; k++) {
      box.expandByPoint(
        v.fromBufferAttribute(pos, index.getX(tri * 3 + k)).applyMatrix4(shoe.matrixWorld),
      );
    }
  }
  return box;
}
lab.islandBox = (id: number) => {
  const b = islandBox(id);
  return {
    min: b.min.toArray().map((n) => +n.toFixed(4)),
    max: b.max.toArray().map((n) => +n.toFixed(4)),
  };
};

/** Moves the island's triangles whose centroid is beyond `threshold` on `axis` to a new island. */
lab.splitIsland = (id: number, axis: 'x' | 'y' | 'z', threshold: number, above = true) => {
  const g = shoe.geometry;
  const pos = g.attributes.position;
  const index = g.index!;
  const v = new THREE.Vector3();
  const next: Island = { id: islands.length, tris: [], area: 0 };
  const keep: number[] = [];
  for (const tri of islands[id].tris) {
    let c = 0;
    for (let k = 0; k < 3; k++) {
      v.fromBufferAttribute(pos, index.getX(tri * 3 + k)).applyMatrix4(shoe.matrixWorld);
      c += v[axis];
    }
    if (c / 3 > threshold === above) {
      next.tris.push(tri);
      islandOfTri[tri] = next.id;
    } else keep.push(tri);
  }
  islands[id].tris = keep;
  islands.push(next);
  return { newId: next.id, moved: next.tris.length, kept: keep.length };
};

type Spec = {
  ids: number[];
  colour: string;
  mode: 'all' | 'light' | 'dark';
  cut?: number;
  grain?: number;
};

/**
 * Recolours islands, keeping the leather grain: each texel's brightness relative to the
 * average of the texels being recoloured scales the target colour.
 *   mode 'light' recolours only light texels (keeps dark logos/stitching),
 *   mode 'dark' only dark texels (e.g. the outsole inside the sole island).
 */
lab.recolor = (specs: Spec[]) => {
  const W = baseImage.width;
  const H = baseImage.height;
  const src = baseImage.getContext('2d')!.getImageData(0, 0, W, H);
  // an island can have several specs (e.g. dark texels -> red, light texels -> black)
  const specOf = new Map<number, number[]>();
  specs.forEach((sp, i) => sp.ids.forEach((id) => specOf.set(id, [...(specOf.get(id) ?? []), i])));

  const idCanvas = document.createElement('canvas');
  idCanvas.width = W;
  idCanvas.height = H;
  const ictx = idCanvas.getContext('2d')!;
  ictx.fillStyle = '#000';
  ictx.fillRect(0, 0, W, H);
  drawIslands(ictx, W, (isl) => {
    const v = isl.id + 1;
    return specOf.has(isl.id) ? `rgb(${v & 255}, ${(v >> 8) & 255}, 7)` : null;
  });
  const ids = ictx.getImageData(0, 0, W, H).data;
  const lum = (p: number) =>
    0.2126 * src.data[p] + 0.7152 * src.data[p + 1] + 0.0722 * src.data[p + 2];
  const selected = (sp: Spec, l: number) =>
    sp.mode === 'all' || (sp.mode === 'light' ? l > (sp.cut ?? 90) : l <= (sp.cut ?? 90));
  const specAt = (p: number) => {
    if (ids[p + 2] !== 7) return -1;
    const id = ids[p] + (ids[p + 1] << 8) - 1;
    const l = lum(p);
    return (specOf.get(id) ?? []).find((i) => selected(specs[i], l)) ?? -1;
  };

  const sums = specs.map(() => [0, 0]);
  for (let p = 0; p < src.data.length; p += 4) {
    const i = specAt(p);
    if (i < 0) continue;
    const l = lum(p);
    sums[i][0] += l;
    sums[i][1] += 1;
  }
  const out = new ImageData(new Uint8ClampedArray(src.data), W, H);
  const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const targets = specs.map((sp) => rgb(sp.colour));
  for (let p = 0; p < src.data.length; p += 4) {
    const i = specAt(p);
    if (i < 0) continue;
    const l = lum(p);
    const sp = specs[i];
    const mean = sums[i][0] / Math.max(1, sums[i][1]);
    // grain from absolute brightness differences: dark leather stays even, light leather
    // keeps its stitching and creases (the normal map adds the surface grain)
    const g = Math.min(1.35, Math.max(0.6, 1 + ((l - mean) / 128) * (sp.grain ?? 0.5)));
    out.data[p] = targets[i][0] * g;
    out.data[p + 1] = targets[i][1] * g;
    out.data[p + 2] = targets[i][2] * g;
  }
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  c.getContext('2d')!.putImageData(out, 0, 0);
  setMap(c);
  lab.recolored = c;
  return { specs: specs.length };
};

/** Leather look: rougher, softer reflections (the source material reads as plastic). */
lab.matte = (roughness: number, envIntensity: number) => {
  const mat = shoe.material as THREE.MeshStandardMaterial;
  mat.roughness = roughness;
  mat.envMapIntensity = envIntensity;
  mat.needsUpdate = true;
  render();
  return { metalness: mat.metalness, hasRoughMap: !!mat.roughnessMap, hasNormal: !!mat.normalMap };
};

/** Exports the single recoloured shoe (toe along +x, sole on y = 0) as a GLB (base64). */
lab.exportGlb = async (rotateY: number) => {
  const mat = shoe.material as THREE.MeshStandardMaterial;
  const canvas = lab.recolored as HTMLCanvasElement;
  // a plain image texture so the exporter writes it as JPEG
  const img = new Image();
  img.src = canvas.toDataURL('image/jpeg', 0.9);
  await img.decode();
  const tex = new THREE.Texture(img);
  tex.flipY = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  mat.map = tex;

  const out = new THREE.Group();
  root.updateMatrixWorld(true);
  // keep only the vertices the remaining triangles use (the buffer still holds both shoes)
  const compact = (src: THREE.BufferGeometry) => {
    const index = src.index!;
    const remap = new Map<number, number>();
    const order: number[] = [];
    const newIndex: number[] = [];
    for (let i = 0; i < index.count; i++) {
      const v = index.getX(i);
      if (!remap.has(v)) {
        remap.set(v, order.length);
        order.push(v);
      }
      newIndex.push(remap.get(v)!);
    }
    const out = new THREE.BufferGeometry();
    for (const [name, attr] of Object.entries(src.attributes)) {
      const a = attr as THREE.BufferAttribute;
      const arr = new Float32Array(order.length * a.itemSize);
      order.forEach((v, j) => {
        for (let k = 0; k < a.itemSize; k++) arr[j * a.itemSize + k] = a.getComponent(v, k);
      });
      out.setAttribute(name, new THREE.BufferAttribute(arr, a.itemSize));
    }
    out.setIndex(newIndex);
    return out;
  };
  for (const m of [shoe, lace]) {
    const g = compact(m.geometry);
    g.applyMatrix4(m.matrixWorld);
    g.rotateY(rotateY);
    const mesh = new THREE.Mesh(g, m.material);
    mesh.name = m.name;
    out.add(mesh);
  }
  const box = new THREE.Box3();
  out.children.forEach((c) => {
    const mesh = c as THREE.Mesh;
    const pos = mesh.geometry.attributes.position;
    const idx = mesh.geometry.index!;
    const v = new THREE.Vector3();
    for (let i = 0; i < idx.count; i++) box.expandByPoint(v.fromBufferAttribute(pos, idx.getX(i)));
  });
  out.children.forEach((c) => {
    const mesh = c as THREE.Mesh;
    mesh.geometry.translate(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
  });
  const buffer = (await new GLTFExporter().parseAsync(out, { binary: true })) as ArrayBuffer;
  const bytes = new Uint8Array(buffer);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
};

/** The current recoloured base map as a JPEG (base64), for the colourway texture files. */
lab.exportMap = () => {
  const canvas = lab.recolored as HTMLCanvasElement;
  return canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
};

/** Plain background for product shots. */
lab.background = (hex: string) => {
  scene.background = new THREE.Color(hex);
  render();
};
