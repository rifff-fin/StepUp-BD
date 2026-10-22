import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * A procedural sneaker built from plain Three.js geometry (no model file, no logos).
 *
 * Frame: length along x (heel at -1.6, toe at +1.6), y up (sole bottom at 0), z across.
 * Every part is placed on one shared description of the shoe:
 *   footWidth(t)        half-width of the footprint, t = 0 heel … 1 toe
 *   midTop(t)           height of the midsole top (heel lift + toe spring)
 *   upperPoint(t, s)    the upper as a surface: s = 0 left edge, 0.5 top, 1 right edge
 * so the overlays, stripe, laces and collar sit exactly on the upper.
 */

const L = 3.2;
const X0 = -L / 2;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smooth curve through [t, value] points (cubic Hermite, Catmull-Rom style tangents). */
function spline(points: [number, number][]) {
  const n = points.length;
  const tangents = points.map((_, i) => {
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(n - 1, i + 1)];
    return (b[1] - a[1]) / (b[0] - a[0]);
  });
  return (t: number) => {
    if (t <= points[0][0]) return points[0][1];
    if (t >= points[n - 1][0]) return points[n - 1][1];
    let i = 1;
    while (t > points[i][0]) i++;
    const [t0, v0] = points[i - 1];
    const [t1, v1] = points[i];
    const h = t1 - t0;
    const u = (t - t0) / h;
    const u2 = u * u;
    const u3 = u2 * u;
    return (
      (2 * u3 - 3 * u2 + 1) * v0 +
      (u3 - 2 * u2 + u) * h * tangents[i - 1] +
      (-2 * u3 + 3 * u2) * v1 +
      (u3 - u2) * h * tangents[i]
    );
  };
}

// ---------------------------------------------------------------- shoe description

const baseWidth = spline([
  [0, 0.42],
  [0.15, 0.45],
  [0.42, 0.44],
  [0.7, 0.56],
  [0.86, 0.53],
  [1, 0.42],
]);

/** Half-width of the footprint, rounded off at the heel and toe. */
export function footWidth(t: number) {
  const fromHeel = t * L;
  const fromToe = (1 - t) * L;
  const heelR = 0.42;
  const toeR = 0.5;
  let round = 1;
  if (fromHeel < heelR) {
    const k = (heelR - fromHeel) / heelR;
    round = Math.sqrt(Math.max(0, 1 - k * k));
  }
  if (fromToe < toeR) {
    const k = (toeR - fromToe) / toeR;
    round = Math.min(round, Math.sqrt(Math.max(0, 1 - k * k)));
  }
  return baseWidth(clamp01(t)) * round;
}

/** The sole curves up at the toe (toe spring) and a little at the heel. */
const spring = (t: number) =>
  0.22 * smoothstep(0.62, 1, t) ** 2 + 0.05 * smoothstep(0.25, 0, t) ** 2;

/** Extra midsole height at the heel. */
const heelLift = (t: number) => 0.1 * (1 - smoothstep(0.25, 0.7, t));

const tOfX = (x: number) => clamp01((x - X0) / L);

const OUTSOLE = { base: 0, depth: 0.06, bevel: 0.02, size: 0.025 };
const FOXING = { base: 0.095, depth: 0.02, bevel: 0.005, size: 0.03 };
const MIDSOLE = { base: 0.12, depth: 0.11, bevel: 0.035, size: 0.035 };
const MIDSOLE_TOP = MIDSOLE.base + MIDSOLE.depth + 2 * MIDSOLE.bevel;

/** Height of the midsole top along the shoe. */
export const midTop = (t: number) => MIDSOLE_TOP + heelLift(t) + spring(t);

/** Height of the upper above its base, heel to toe. */
const upperHeight = spline([
  [0, 0.76],
  [0.06, 0.83],
  [0.18, 0.82],
  [0.3, 0.77],
  [0.4, 0.76],
  [0.52, 0.66],
  [0.66, 0.52],
  [0.8, 0.39],
  [0.92, 0.29],
  [1, 0.15],
]);

// The foot opening: an ellipse in (t, s) around the heel half of the top
const COLLAR = { t: 0.185, rt: 0.15, rs: 0.17, depth: 0.5 };
const SUPER = 2 / 2.6; // superellipse exponent: boxy sides, rounded top

/**
 * A point on the upper. Writes into `out` and returns how deep it lies in the foot
 * opening (0 = outside, 1 = inside), used to darken the lining.
 */
export function upperPoint(t: number, s: number, out: THREE.Vector3) {
  const tc = clamp01(t);
  const sc = clamp01(s);
  const base = midTop(tc) - 0.03;
  const w = footWidth(tc) * 0.93;
  const h = upperHeight(tc);
  const phi = Math.PI * sc;
  const c = Math.cos(phi);
  const ey = Math.pow(Math.sin(phi), SUPER);
  const ez = Math.sign(c) * Math.pow(Math.abs(c), SUPER);

  const dt = (tc - COLLAR.t) / COLLAR.rt;
  const ds = (sc - 0.5) / COLLAR.rs;
  const dip = 1 - smoothstep(0.62, 1, Math.sqrt(dt * dt + ds * ds));

  const y = h * ey - dip * COLLAR.depth * h;
  const z = -w * ez * (1 - 0.22 * ey * ey); // narrower towards the top
  out.set(X0 + tc * L, base + y, z);
  return dip;
}

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _p = new THREE.Vector3();

/** Outward unit normal of the upper at (t, s). */
export function upperNormal(t: number, s: number, out: THREE.Vector3) {
  const e = 1e-3;
  upperPoint(t + e, s, _a);
  upperPoint(t - e, s, _b);
  const dT = _a.sub(_b).clone();
  upperPoint(t, s + e, _a);
  upperPoint(t, s - e, _b);
  const dS = _a.sub(_b);
  out.crossVectors(dT, dS).normalize();

  // Point away from the shoe's centre line
  upperPoint(t, s, _p);
  const tc = clamp01(t);
  const centre = new THREE.Vector3(
    THREE.MathUtils.clamp(_p.x, X0 + 0.45, X0 + L - 0.55),
    midTop(tc) + 0.3 * upperHeight(tc),
    0,
  );
  if (out.dot(_p.sub(centre)) < 0) out.negate();
  return out;
}

// ---------------------------------------------------------------- builders

/** Footprint outline (top view) as a THREE.Shape in (x, z). */
function footShape(widthScale: number, segments = 72) {
  const pts: THREE.Vector2[] = [];
  const tAt = (i: number) => (1 - Math.cos((Math.PI * i) / segments)) / 2;
  for (let i = 0; i <= segments; i++) {
    const t = tAt(i);
    pts.push(new THREE.Vector2(X0 + t * L, footWidth(t) * widthScale));
  }
  for (let i = segments - 1; i >= 1; i--) {
    const t = tAt(i);
    pts.push(new THREE.Vector2(X0 + t * L, -footWidth(t) * widthScale));
  }
  return new THREE.Shape(pts);
}

/** Smooth normals across shared corners (ExtrudeGeometry's are per face). */
function smoothed(geo: THREE.BufferGeometry) {
  geo.deleteAttribute('normal');
  geo.deleteAttribute('uv');
  const merged = mergeVertices(geo, 1e-4);
  merged.computeVertexNormals();
  geo.dispose();
  return merged;
}

/** One sole layer: the footprint extruded upwards, bent with the toe spring. */
function soleLayer(
  layer: { base: number; depth: number; bevel: number; size: number },
  widthScale: number,
  liftHeel: boolean,
) {
  const geo = new THREE.ExtrudeGeometry(footShape(widthScale), {
    depth: layer.depth,
    bevelEnabled: true,
    bevelThickness: layer.bevel,
    bevelSize: layer.size,
    bevelSegments: layer.bevel > 0.01 ? 4 : 1,
    curveSegments: 1,
    steps: 1,
  });
  geo.rotateX(-Math.PI / 2); // extrusion now points up
  geo.translate(0, layer.base + layer.bevel, 0);

  const mid = layer.base + layer.bevel + layer.depth / 2;
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = tOfX(pos.getX(i));
    let y = pos.getY(i);
    if (liftHeel && y > mid) y += heelLift(t);
    pos.setY(i, y + spring(t));
  }
  return smoothed(geo);
}

type ParamMap = (u: number, v: number) => [number, number];

/** A grid patch on the upper surface, optionally floated off it (overlays, stripe). */
function surfacePatch(map: ParamMap, segU: number, segV: number, offset = 0, lining = false) {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();

  for (let j = 0; j <= segV; j++) {
    for (let i = 0; i <= segU; i++) {
      const [t, s] = map(i / segU, j / segV);
      const dip = upperPoint(t, s, p);
      if (offset) p.addScaledVector(upperNormal(t, s, n), offset);
      positions.push(p.x, p.y, p.z);
      if (lining) {
        const shade = 1 - 0.94 * smoothstep(0.05, 0.35, dip); // dark inside the opening
        colors.push(shade, shade, shade);
      }
    }
  }
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      const a = j * (segU + 1) + i;
      const b = a + 1;
      const c = a + segU + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  if (lining) geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Mirror a left-side patch to the right side (s -> 1 - s). */
const mirrored =
  (map: ParamMap): ParamMap =>
  (u, v) => {
    const [t, s] = map(u, v);
    return [t, 1 - s];
  };

/** A tube following points that hover just above the upper. */
function tubeOnUpper(
  params: [number, number][],
  lift: (k: number) => number,
  radius: number,
  closed: boolean,
) {
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  const pts = params.map(([t, s], k) => {
    upperPoint(t, s, p);
    upperNormal(t, s, n);
    return p.clone().addScaledVector(n, lift(k / Math.max(1, params.length - 1)));
  });
  const curve = new THREE.CatmullRomCurve3(pts, closed, 'centripetal');
  return new THREE.TubeGeometry(curve, closed ? 160 : 24, radius, closed ? 12 : 6, closed);
}

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, 0);
  s.lineTo(w / 2 - r, 0);
  s.quadraticCurveTo(w / 2, 0, w / 2, r);
  s.lineTo(w / 2, h - r);
  s.quadraticCurveTo(w / 2, h, w / 2 - r, h);
  s.lineTo(-w / 2 + r, h);
  s.quadraticCurveTo(-w / 2, h, -w / 2, h - r);
  s.lineTo(-w / 2, r);
  s.quadraticCurveTo(-w / 2, 0, -w / 2 + r, 0);
  return s;
}

/** The tongue: a padded, arched tab rising up and back out of the instep. */
function buildTongue() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.19, 0);
  shape.lineTo(0.19, 0);
  shape.lineTo(0.18, 0.28);
  shape.quadraticCurveTo(0.17, 0.44, 0, 0.44);
  shape.quadraticCurveTo(-0.17, 0.44, -0.18, 0.28);
  shape.closePath();

  const tongue = new THREE.ExtrudeGeometry(shape, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3,
    curveSegments: 12,
  });
  tongue.translate(0, 0, -0.025);
  const pos = tongue.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, pos.getZ(i) - 1.1 * x * x); // arch across the foot
  }

  const tag = new THREE.BoxGeometry(0.13, 0.085, 0.012);
  tag.translate(0, 0.31, 0.052);

  // Orient: length up and back, front face towards the toe
  const up = new THREE.Vector3(-0.42, 0.91, 0).normalize();
  const front = new THREE.Vector3(up.y, -up.x, 0); // perpendicular, pointing forward/up
  const across = new THREE.Vector3().crossVectors(up, front);
  const basis = new THREE.Matrix4().makeBasis(across, up, front);
  const root = new THREE.Vector3();
  upperPoint(0.4, 0.5, root);
  root.y -= 0.12;
  basis.setPosition(root);

  tongue.applyMatrix4(basis);
  tag.applyMatrix4(basis);
  return { tongue: smoothed(tongue), tag };
}

function buildHeelTab() {
  const top = new THREE.Vector3();
  upperPoint(0, 0.5, top);
  const tab = new THREE.ExtrudeGeometry(roundedRect(0.16, 0.26, 0.06), {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 8,
  });
  tab.rotateY(Math.PI / 2); // face backwards (thickness along x)
  tab.rotateZ(0.12); // then lean the top back a little
  tab.translate(X0 - 0.045, top.y - 0.17, 0);
  return smoothed(tab);
}

// ---------------------------------------------------------------- the whole shoe

export interface ShoeGeometry {
  outsole: THREE.BufferGeometry;
  foxing: THREE.BufferGeometry;
  midsole: THREE.BufferGeometry;
  upper: THREE.BufferGeometry;
  overlays: THREE.BufferGeometry;
  stripes: THREE.BufferGeometry;
  collar: THREE.BufferGeometry;
  laces: THREE.BufferGeometry;
  eyelets: THREE.BufferGeometry;
  tongue: THREE.BufferGeometry;
  tongueTag: THREE.BufferGeometry;
  heelTab: THREE.BufferGeometry;
}

function build(): ShoeGeometry {
  const cosT = (u: number) => (1 - Math.cos(Math.PI * u)) / 2; // denser at the ends

  // Upper with the darkened foot opening
  const upper = surfacePatch((u, v) => [cosT(u), v], 140, 96, 0, true);

  // Overlay panels (one material): toe cap, heel counter, mudguard, eyestays
  const toeCap: ParamMap = (u, v) => {
    const t0 = 0.78 + 0.05 * Math.sin(Math.PI * v);
    return [lerp(t0, 1, u), v];
  };
  const heelLeft: ParamMap = (u, v) => [u * (0.32 - 0.12 * v), v * 0.27];
  const mudLeft: ParamMap = (u, v) => [lerp(0.22, 0.86, u), v * 0.085];
  const eyestayLeft: ParamMap = (u, v) => [lerp(0.38, 0.76, u), 0.335 + v * 0.065];
  const overlays = mergeGeometries([
    surfacePatch(toeCap, 28, 64, 0.011),
    surfacePatch(heelLeft, 28, 16, 0.013),
    surfacePatch(mirrored(heelLeft), 28, 16, 0.013),
    surfacePatch(mudLeft, 64, 6, 0.009),
    surfacePatch(mirrored(mudLeft), 64, 6, 0.009),
    surfacePatch(eyestayLeft, 40, 4, 0.012),
    surfacePatch(mirrored(eyestayLeft), 40, 4, 0.012),
  ]);

  // Side stripe: a generic tapered S-wave (not any brand's mark)
  const stripeLeft: ParamMap = (u, v) => {
    const centre = 0.205 + 0.065 * Math.sin(2 * Math.PI * u);
    const half = 0.043 * Math.pow(Math.sin(Math.PI * u), 0.7) + 0.006;
    return [0.14 + 0.6 * u, centre + (2 * v - 1) * half];
  };
  const stripes = mergeGeometries([
    surfacePatch(stripeLeft, 72, 6, 0.017),
    surfacePatch(mirrored(stripeLeft), 72, 6, 0.017),
  ]);

  // Padded collar around the foot opening
  const ring: [number, number][] = [];
  for (let k = 0; k < 64; k++) {
    const a = (k / 64) * Math.PI * 2;
    ring.push([COLLAR.t + 0.97 * COLLAR.rt * Math.cos(a), 0.5 + 0.97 * COLLAR.rs * Math.sin(a)]);
  }
  const collar = tubeOnUpper(ring, () => 0.008, 0.048, true);

  // Criss-cross laces and eyelets
  const laceParts: THREE.BufferGeometry[] = [];
  const eyeletParts: THREE.BufferGeometry[] = [];
  const dummy = new THREE.Object3D();
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < 6; i++) {
    const t = 0.45 + i * 0.052;
    const [tA, tB] = i % 2 ? [t + 0.035, t] : [t, t + 0.035];
    const path: [number, number][] = [];
    for (let k = 0; k <= 8; k++) path.push([lerp(tA, tB, k / 8), lerp(0.37, 0.63, k / 8)]);
    laceParts.push(tubeOnUpper(path, (k) => 0.028 + 0.012 * Math.sin(Math.PI * k), 0.022, false));

    for (const [et, es] of [
      [tA, 0.37],
      [tB, 0.63],
    ]) {
      upperPoint(et, es, p);
      upperNormal(et, es, n);
      const eyelet = new THREE.TorusGeometry(0.032, 0.011, 8, 16);
      dummy.position.copy(p).addScaledVector(n, 0.014);
      dummy.lookAt(p.clone().addScaledVector(n, 1));
      dummy.updateMatrix();
      eyelet.applyMatrix4(dummy.matrix);
      eyeletParts.push(eyelet);
    }
  }

  const { tongue, tag } = buildTongue();

  return {
    outsole: soleLayer(OUTSOLE, 1, false),
    foxing: soleLayer(FOXING, 1, false),
    midsole: soleLayer(MIDSOLE, 0.985, true),
    upper,
    overlays,
    stripes,
    collar,
    laces: mergeGeometries(laceParts),
    eyelets: mergeGeometries(eyeletParts),
    tongue,
    tongueTag: tag,
    heelTab: buildHeelTab(),
  };
}

let cached: ShoeGeometry | null = null;

/** The shoe's geometry, built once and shared by every scene that shows it. */
export function getShoeGeometry() {
  cached ??= build();
  return cached;
}

/** Height of the finished shoe, for centring it in a scene. */
export const SHOE_HEIGHT = 1.42;
