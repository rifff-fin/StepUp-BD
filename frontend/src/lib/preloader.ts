import { isReducedMotion } from './motion';

/**
 * The intro loader is static HTML in index.html, so it shows with the first frame. Once the
 * app has rendered and the display font is ready (at least MIN_MS, at most MAX_MS after
 * navigation start) it lifts; with reduced motion it simply goes. The hero's intro (title
 * rise, 3D spin-in) waits for the lift via `onRevealed`.
 */
const MIN_MS = 1200;
const MAX_MS = 2600;

let revealed = false;
const waiting = new Set<() => void>();

function markRevealed() {
  if (revealed) return;
  revealed = true;
  document.documentElement.classList.add('revealed');
  waiting.forEach((cb) => cb());
  waiting.clear();
}

/** Run `cb` once the page is revealed (at once if it already is). Returns an unsubscribe. */
export function onRevealed(cb: () => void) {
  if (revealed) {
    cb();
    return () => {};
  }
  waiting.add(cb);
  return () => {
    waiting.delete(cb);
  };
}

export function runPreloader() {
  const el = document.getElementById('preloader');
  const html = document.documentElement;
  if (!el) {
    html.classList.remove('preloading');
    markRevealed();
    return;
  }

  let done = false;
  const lift = () => {
    if (done) return;
    done = true;
    el.classList.add('done');
    html.classList.remove('preloading');
    markRevealed();
    window.setTimeout(() => el.remove(), 1100);
  };

  if (isReducedMotion()) {
    lift();
    return;
  }

  const elapsed = performance.now();
  const fontReady = document.fonts
    ? document.fonts.load('1em "Bebas Neue"').then(() => undefined)
    : Promise.resolve();
  const minWait = new Promise((resolve) =>
    window.setTimeout(resolve, Math.max(0, MIN_MS - elapsed)),
  );

  void Promise.all([fontReady, minWait]).then(lift, lift);
  window.setTimeout(lift, Math.max(0, MAX_MS - elapsed));
}
