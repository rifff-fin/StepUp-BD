import { isReducedMotion } from './motion';

/**
 * The intro loader is static HTML in index.html, so it shows with the first frame. Once the
 * app has rendered and the display font is ready (at least MIN_MS, at most MAX_MS after
 * navigation start) it lifts; with reduced motion it simply goes.
 */
const MIN_MS = 1200;
const MAX_MS = 2600;

export function runPreloader() {
  const el = document.getElementById('preloader');
  const html = document.documentElement;
  if (!el) {
    html.classList.remove('preloading');
    return;
  }

  let done = false;
  const lift = () => {
    if (done) return;
    done = true;
    el.classList.add('done');
    html.classList.remove('preloading');
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
