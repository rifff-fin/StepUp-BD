import Lenis from 'lenis';
import { isReducedMotion, subscribeMotion } from './motion';

/**
 * Smooth scrolling (Lenis) for mouse wheels; touch stays native. Off with reduced motion.
 * Scrollable overlays carry `data-lenis-prevent` so they scroll on their own.
 */
let lenis: Lenis | null = null;

const navOffset = () =>
  -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68) - 8;

function start() {
  if (lenis || isReducedMotion()) return;
  lenis = new Lenis({ autoRaf: true, lerp: 0.11, anchors: { offset: navOffset() } });
}

function stop() {
  lenis?.destroy();
  lenis = null;
}

export function initSmoothScroll() {
  start();
  return subscribeMotion(() => (isReducedMotion() ? stop() : start()));
}

/** Pause page scrolling while an overlay is open (and resume after). */
export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
}

/** Scroll to an element id ("shop" or "#shop"), smoothly when allowed. */
export function scrollToId(id: string) {
  const target = document.getElementById(id.replace(/^#/, ''));
  if (!target) return;
  if (lenis) {
    lenis.scrollTo(target, { offset: navOffset() });
  } else {
    target.scrollIntoView({ behavior: isReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }
}
