import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { site } from '../../content/copy';
import { getMotionPref, isReducedMotion, setMotionPref, subscribeMotion } from '../../lib/motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/** "Skip to content" for keyboard users. */
export function SkipLink() {
  return (
    <a className="skip-link" href="#main">
      Skip to content
    </a>
  );
}

/** Floating WhatsApp chat button. */
export function WhatsAppButton() {
  const href = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`;
  // Appears once the hero is scrolled past, so it never covers the hero's buttons and stats
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <a
      className={`wa-fab ${shown ? 'show' : ''}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with StepUp BD on WhatsApp"
    >
      <FaWhatsapp aria-hidden="true" />
    </a>
  );
}

/**
 * Motion on/off. Defaults to the OS setting; the choice is remembered. (Windows with
 * "Animation effects" off reports reduced motion: this switch brings the full site back.)
 */
export function MotionSwitch() {
  const reduced = useSyncExternalStore(subscribeMotion, isReducedMotion, () => false);
  return (
    <button
      type="button"
      role="switch"
      className="motion-switch"
      aria-checked={!reduced}
      onClick={() => setMotionPref(reduced ? 'on' : 'off')}
      title={getMotionPref() === 'auto' ? 'Following your system setting' : undefined}
    >
      Motion <i aria-hidden="true" />
    </button>
  );
}

/** A soft red glow (and ring) that follows the mouse. Desktop with a fine pointer only. */
export function CursorGlow() {
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const glow = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!finePointer) return;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const glowPos = { ...target };
    const ringPos = { ...target };
    let frame = 0;
    let visible = false;

    const loop = () => {
      const k = isReducedMotion() ? 1 : 0.12;
      glowPos.x += (target.x - glowPos.x) * k;
      glowPos.y += (target.y - glowPos.y) * k;
      ringPos.x += (target.x - ringPos.x) * Math.min(1, k * 2.5);
      ringPos.y += (target.y - ringPos.y) * Math.min(1, k * 2.5);
      if (glow.current)
        glow.current.style.transform = `translate3d(${glowPos.x}px, ${glowPos.y}px, 0)`;
      if (ring.current)
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      frame = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      target.x = event.clientX;
      target.y = event.clientY;
      if (!visible) {
        visible = true;
        glow.current?.classList.add('on');
        ring.current?.classList.add('on');
      }
      const interactive = (event.target as Element | null)?.closest?.(
        'a, button, [role="button"], input, select, textarea, label',
      );
      ring.current?.classList.toggle('hover', !!interactive);
    };
    const onLeave = () => {
      visible = false;
      glow.current?.classList.remove('on');
      ring.current?.classList.remove('on');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [finePointer]);

  if (!finePointer) return null;
  return (
    <>
      <div className="cursor-glow" ref={glow} aria-hidden="true" />
      <div className="cursor-ring" ref={ring} aria-hidden="true">
        <i />
      </div>
    </>
  );
}
