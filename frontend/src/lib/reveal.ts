/**
 * There is no loader screen: the page shows at once. `html.revealed` is added once the app
 * has rendered and the heading font is ready (at most MAX_MS), so the hero's intro (copy
 * rising in, the 3D shoe spinning up) plays in the right font. The 3D scene waits for it via
 * `onRevealed`.
 */
const MAX_MS = 700;

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

export function startReveal() {
  const fontReady = document.fonts
    ? document.fonts.load('800 1em "Archivo"').then(() => undefined)
    : Promise.resolve();
  void fontReady.then(markRevealed, markRevealed);
  window.setTimeout(markRevealed, MAX_MS);
}
