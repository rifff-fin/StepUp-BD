import { useId } from 'react';
import type { Palette, Silhouette } from '../../types';

/**
 * Drawn side-view sneaker (SVG), coloured from a product's palette. Stands in for product
 * photos: swap for <img> once real photography exists (see README). No brand logos: the
 * side stripe is a generic wave.
 */
interface Shape {
  upper: string;
  heel: string;
  toe: string;
  stripe: string;
  collar: string;
  tab: string;
  tag: string;
  midsole: string;
  outsole: string;
  laces: { from: [number, number]; to: [number, number]; count: number };
  accent?: string; // optional midsole line
}

const LOW_SOLE = {
  midsole: 'M18,80 L120,88 L216,90 Q230,91 229,99 Q226,106 210,106 L30,106 Q17,106 17,93 Z',
  outsole: 'M16,98 L228,96 Q232,110 214,114 L30,114 Q16,114 16,98 Z',
};
const TOE = 'M172,65 C196,71 214,79 220,87 Q223,93 214,94 L166,92 C164,80 166,71 172,65 Z';
const STRIPE =
  'M40,74 C70,58 100,88 132,72 C150,63 164,69 176,77 C162,73 150,70 133,79 C101,95 70,68 40,74 Z';

const SHAPES: Record<Silhouette, Shape> = {
  low: {
    ...LOW_SOLE,
    upper:
      'M22,84 C17,68 19,52 27,41 Q34,34 45,36 C57,40 64,46 75,46 L85,44 C87,34 91,26 100,24 Q108,23 110,30 L112,36 C130,46 152,58 176,66 C198,72 214,79 220,87 Q223,93 214,94 L120,92 Z',
    heel: 'M22,84 C17,68 18,56 23,47 C38,52 50,64 58,90 Z',
    toe: TOE,
    stripe: STRIPE,
    collar: 'M27,41 Q34,34 45,36 C57,40 64,46 75,46 L85,44',
    tab: 'M27,42 L16,40 Q11,30 18,27 L31,36 Z',
    tag: 'M95,30 L105,28 L106,34 L96,36 Z',
    laces: { from: [114, 40], to: [168, 63], count: 6 },
  },
  high: {
    ...LOW_SOLE,
    upper:
      'M22,84 C15,62 15,36 21,18 Q30,10 43,13 C53,17 61,25 71,29 L83,27 C85,17 89,9 99,7 Q107,7 108,14 L110,22 C128,40 152,57 176,66 C198,72 214,79 220,87 Q223,93 214,94 L120,92 Z',
    heel: 'M22,84 C16,64 16,50 19,38 C38,46 52,62 58,90 Z',
    toe: TOE,
    stripe: STRIPE,
    collar: 'M21,18 Q30,10 43,13 C53,17 61,25 71,29 L83,27',
    tab: 'M21,20 L10,18 Q5,8 12,5 L25,13 Z',
    tag: 'M93,13 L103,11 L104,17 L94,19 Z',
    laces: { from: [112, 26], to: [168, 63], count: 8 },
  },
  runner: {
    midsole: 'M17,70 L120,86 L216,90 Q230,91 229,99 Q226,106 210,106 L30,106 Q15,105 15,88 Z',
    outsole: 'M16,94 L228,96 Q232,110 214,114 L30,114 Q14,112 16,94 Z',
    upper:
      'M22,74 C18,60 22,48 30,42 Q38,37 47,41 C59,47 67,50 77,48 L87,44 C91,36 97,30 105,30 Q111,30 112,36 L114,42 C134,51 158,61 184,69 C206,75 219,81 222,88 Q224,93 214,93 L120,90 Z',
    heel: 'M22,74 C18,62 20,52 26,46 C40,52 50,62 56,84 Z',
    toe: 'M180,68 C204,75 219,81 222,88 Q224,93 214,93 L174,91 C172,81 174,73 180,68 Z',
    stripe:
      'M44,70 C74,56 104,84 136,70 C154,62 168,68 182,76 C166,72 154,70 137,77 C105,91 74,64 44,70 Z',
    collar: 'M30,42 Q38,37 47,41 C59,47 67,50 77,48 L87,44',
    tab: 'M30,43 L20,42 Q15,34 21,30 L33,37 Z',
    tag: 'M98,35 L107,33 L108,38 L99,40 Z',
    laces: { from: [116, 44], to: [172, 65], count: 6 },
    accent: 'M24,95 C60,89 100,101 140,96 S200,97 222,98',
  },
};

/** Short strokes across the instep, from heel side to toe side. */
function laceTicks({ from, to, count }: Shape['laces']) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  const dir = [dx / len, dy / len];
  const up = [dir[1], -dir[0]];
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    const px = from[0] + dx * t;
    const py = from[1] + dy * t;
    const x1 = px - up[0] - dir[0] * 4;
    const y1 = py - up[1] - dir[1] * 4;
    const x2 = px + up[0] * 5 + dir[0] * 2;
    const y2 = py + up[1] * 5 + dir[1] * 2;
    return `M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}`;
  }).join(' ');
}

interface Props {
  palette: Palette;
  silhouette?: Silhouette;
  /** Accessible name; omit for decorative copies (then aria-hidden). */
  label?: string;
  className?: string;
}

export function ShoeArt({ palette: p, silhouette = 'low', label, className }: Props) {
  const shape = SHAPES[silhouette] ?? SHAPES.low;
  const id = `shade-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <svg
      viewBox="0 0 240 132"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".24" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".3" />
        </linearGradient>
      </defs>
      <ellipse cx="122" cy="122" rx="104" ry="6" fill="#000" opacity=".45" />
      <path d={shape.upper} fill={p.upper} />
      <path d={shape.heel} fill={p.overlay} />
      <path d={shape.toe} fill={p.overlay} />
      <path d={shape.stripe} fill={p.stripe} />
      <path d={shape.upper} fill={`url(#${id})`} />
      <path
        d={shape.collar}
        fill="none"
        stroke={p.collar}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={laceTicks(shape.laces)}
        fill="none"
        stroke={p.laces}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path d={shape.tab} fill={p.tab} />
      <path d={shape.tag} fill={p.tab} />
      <path d={shape.midsole} fill={p.midsole} />
      <path d={shape.midsole} fill={`url(#${id})`} opacity=".7" />
      {shape.accent && (
        <path d={shape.accent} fill="none" stroke={p.stripe} strokeWidth="2.5" opacity=".9" />
      )}
      <path d={shape.outsole} fill={p.outsole} />
    </svg>
  );
}
