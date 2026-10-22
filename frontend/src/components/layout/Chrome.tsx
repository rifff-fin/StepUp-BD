import { useEffect, useState, useSyncExternalStore } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { site } from '../../content/copy';
import { getMotionPref, isReducedMotion, setMotionPref, subscribeMotion } from '../../lib/motion';

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
