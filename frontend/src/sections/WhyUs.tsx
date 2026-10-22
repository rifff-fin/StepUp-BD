import type { CSSProperties } from 'react';
import { FiDollarSign, FiRotateCcw, FiShield, FiTruck } from 'react-icons/fi';
import { why } from '../content/copy';

const ICONS = {
  shield: FiShield,
  cash: FiDollarSign,
  return: FiRotateCcw,
  truck: FiTruck,
} as const;

export function WhyUs() {
  return (
    <section id="why" className="section" aria-labelledby="why-title">
      <div className="container">
        <div className="section-head" data-reveal>
          <div>
            <span className="eyebrow">{why.eyebrow}</span>
            <h2 id="why-title" className="display">
              {why.title} <em>{why.titleAccent}</em>
            </h2>
          </div>
          <p>{why.lede}</p>
        </div>
        <div className="why-grid">
          {why.items.map((item, i) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS];
            return (
              <div key={item.title} data-reveal style={{ '--d': i } as CSSProperties}>
                <article className="why-card">
                  <span className="why-num" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <div className="why-icon" aria-hidden="true">
                    <Icon />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
