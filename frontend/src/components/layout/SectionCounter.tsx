import { useEffect, useState } from 'react';
import { hero } from '../../content/copy';
import { scrollToId } from '../../lib/lenis';

/**
 * The vertical "01 / 04" counter on the right edge of the home page (desktop): which part of
 * the page you are in (Home, Details, Trending, Shop), with a dot per part to jump to it.
 * It reads on both the dark hero and the light shop (`mix-blend-mode: difference`).
 */
export function SectionCounter() {
  const [active, setActive] = useState(0);
  const sections = hero.sections;

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.5;
      let index = 0;
      sections.forEach((section, i) => {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= line) index = i;
      });
      setActive(index);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [sections]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <nav className="section-counter" aria-label="Page sections">
      <p aria-hidden="true">
        {pad(active + 1)} / {pad(sections.length)}
      </p>
      <span className="section-track" aria-hidden="true" />
      <ol>
        {sections.map((section, i) => (
          <li key={section.id}>
            <button
              type="button"
              aria-label={section.label}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => scrollToId(section.id)}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
}
