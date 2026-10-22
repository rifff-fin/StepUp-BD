import type { Palette } from '../types';

/** The hero shoe's colourways (the switcher under the 3D shoe). */
export interface Colorway {
  id: string;
  label: string;
  swatch: [string, string]; // the two halves of the switcher dot
  palette: Palette;
}

export const HERO_COLORWAYS: Colorway[] = [
  {
    id: 'red-black',
    label: 'Red / Black',
    swatch: ['#E10600', '#111111'],
    palette: {
      upper: '#D10A0A',
      overlay: '#121212',
      stripe: '#F4F4F4',
      midsole: '#F2F2F2',
      outsole: '#121212',
      laces: '#F4F4F4',
      tab: '#E10600',
      collar: '#121212',
    },
  },
  {
    id: 'white-red',
    label: 'White / Red',
    swatch: ['#F4F4F4', '#E10600'],
    palette: {
      upper: '#F3F3F3',
      overlay: '#E10600',
      stripe: '#E10600',
      midsole: '#FFFFFF',
      outsole: '#B30000',
      laces: '#FFFFFF',
      tab: '#E10600',
      collar: '#E10600',
    },
  },
  {
    id: 'all-black',
    label: 'All Black',
    swatch: ['#1A1A1A', '#000000'],
    palette: {
      upper: '#161616',
      overlay: '#0B0B0B',
      stripe: '#2E2E2E',
      midsole: '#141414',
      outsole: '#0A0A0A',
      laces: '#1C1C1C',
      tab: '#E10600',
      collar: '#0B0B0B',
    },
  },
];
