import { readPref, writePref } from './storage';

/**
 * Motion preference. 'auto' follows the OS (prefers-reduced-motion); the footer's Motion
 * switch can force it on or off. The current state lives on <html data-reduced> (set before
 * first paint by index.html), which CSS and JS both read.
 */
export type MotionPref = 'auto' | 'on' | 'off';

const KEY = 'stepup:motion';
const QUERY = '(prefers-reduced-motion: reduce)';
const listeners = new Set<() => void>();

export const getMotionPref = (): MotionPref => {
  const pref = readPref(KEY);
  return pref === 'on' || pref === 'off' ? pref : 'auto';
};

const computeReduced = () => {
  const pref = getMotionPref();
  return pref === 'off' || (pref === 'auto' && window.matchMedia(QUERY).matches);
};

function apply() {
  document.documentElement.toggleAttribute('data-reduced', computeReduced());
  listeners.forEach((fn) => fn());
}

export const isReducedMotion = () => document.documentElement.hasAttribute('data-reduced');

export function setMotionPref(pref: MotionPref) {
  writePref(KEY, pref);
  apply();
}

export function subscribeMotion(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// Follow live OS changes while the preference is 'auto'
window.matchMedia(QUERY).addEventListener('change', apply);
