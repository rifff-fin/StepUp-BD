import { useEffect } from 'react';

/**
 * Scroll reveals: every `[data-reveal]` element (now or added later) gets `.in` the first
 * time it scrolls into view. Stagger with `style={{ '--d': n }}`.
 *
 * `.in` is added straight to the DOM, so put `data-reveal` only on elements whose
 * className React never changes (a wrapper), or React would wipe it on re-render.
 */
export function useRevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    );

    const scan = (root: ParentNode) =>
      root.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => io.observe(el));

    scan(document);
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches('[data-reveal]')) io.observe(node);
          scan(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
