import { useState, type CSSProperties } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import { faq, site } from '../content/copy';

/** FAQ accordion: one answer open at a time. */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const whatsapp = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`;

  return (
    <section id="faq" className="section" aria-labelledby="faq-title">
      <div className="container faq-wrap">
        <div className="faq-intro">
          <h2 id="faq-title" className="section-title">
            {faq.title}
          </h2>
          <p>{faq.lede}</p>
          <a className="btn btn-ghost" href={whatsapp} target="_blank" rel="noopener noreferrer">
            <FiMessageCircle aria-hidden="true" /> Ask on WhatsApp
          </a>
        </div>

        <div className="faq-list">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} data-reveal style={{ '--d': i } as CSSProperties}>
                <div className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <h3 className="faq-h">
                    <button
                      type="button"
                      className="faq-q"
                      id={`faq-q-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                    >
                      {item.q}
                      <span className="pm" aria-hidden="true" />
                    </button>
                  </h3>
                  <div
                    className="faq-a"
                    id={`faq-a-${i}`}
                    role="region"
                    aria-labelledby={`faq-q-${i}`}
                    inert={!isOpen}
                  >
                    <div>
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
