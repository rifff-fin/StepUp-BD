import type { Palette } from '../types';

/**
 * The hero shoe's colourways (the switcher under the 3D shoe).
 * `texture` is the base-colour map for the real AJ1 model (null = the Bred map inside the
 * .glb); `palette` colours the procedural fallback shoe and the SVG placeholder.
 */
export interface Colorway {
  id: string;
  label: string;
  swatch: [string, string]; // the two halves of the switcher dot
  texture: string | null;
  palette: Palette;
}

export const HERO_COLORWAYS: Colorway[] = [
  {
    id: 'red-black',
    label: 'Bred',
    swatch: ['#B01220', '#111111'],
    texture: null,
    palette: {
      upper: '#121212',
      overlay: '#B01220',
      stripe: '#121212',
      midsole: '#F2F2F2',
      outsole: '#B01220',
      laces: '#121212',
      tab: '#B01220',
      collar: '#121212',
    },
  },
  {
    id: 'white-red',
    label: 'White / Red',
    swatch: ['#F4F4F4', '#B01220'],
    texture: '/models/aj1-white-red.webp',
    palette: {
      upper: '#F3F3F3',
      overlay: '#B01220',
      stripe: '#121212',
      midsole: '#FFFFFF',
      outsole: '#B01220',
      laces: '#121212',
      tab: '#B01220',
      collar: '#121212',
    },
  },
  {
    id: 'all-black',
    label: 'All Black',
    swatch: ['#1A1A1A', '#000000'],
    texture: '/models/aj1-all-black.webp',
    palette: {
      upper: '#161616',
      overlay: '#0B0B0B',
      stripe: '#2E2E2E',
      midsole: '#141414',
      outsole: '#0A0A0A',
      laces: '#1C1C1C',
      tab: '#2B2B2B',
      collar: '#0B0B0B',
    },
  },
];

/** The hero opens on White / Red (the client's pick); the quick-view viewer stays on the Bred. */
export const DEFAULT_HERO_COLORWAY =
  HERO_COLORWAYS.find((c) => c.id === 'white-red') ?? HERO_COLORWAYS[0];
