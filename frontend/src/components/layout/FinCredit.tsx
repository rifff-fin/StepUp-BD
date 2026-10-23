import { useEffect, useRef, useState } from 'react';
import { FiArrowUpRight, FiX } from 'react-icons/fi';
import { site } from '../../content/copy';

/**
 * "Built by Fin Projukti": a small glass pill in the bottom-left corner that opens a card
 * inviting visitors to contact Fin Projukti for a site like this one.
 */
export function FinCredit() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on Escape or a click outside
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <div className={`fin-credit ${open ? 'open' : ''}`} ref={ref}>
      {open && (
        <div className="fin-card glass" id="fin-card" role="dialog" aria-label={site.credit.title}>
          <button
            type="button"
            className="fin-close"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            <FiX />
          </button>
          <p className="fin-title">{site.credit.title}</p>
          <p className="fin-text">{site.credit.text}</p>
          <a
            className="btn btn-primary btn-sm"
            href={site.builtBy.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {site.credit.cta} <FiArrowUpRight aria-hidden="true" />
          </a>
        </div>
      )}
      <button
        type="button"
        className="fin-pill glass"
        aria-expanded={open}
        aria-controls="fin-card"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="fin-dot" aria-hidden="true">
          F
        </span>
        {site.credit.short}
      </button>
    </div>
  );
}
