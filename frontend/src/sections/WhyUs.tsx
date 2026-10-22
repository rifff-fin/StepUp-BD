import { FiDollarSign, FiRotateCcw, FiShield, FiTruck } from 'react-icons/fi';
import { why } from '../content/copy';

const ICONS = {
  shield: FiShield,
  cash: FiDollarSign,
  return: FiRotateCcw,
  truck: FiTruck,
} as const;

/** The service strip under the hero: authenticity, payment, exchange, delivery. */
export function WhyUs() {
  return (
    <section id="why" className="usp" aria-labelledby="why-title">
      <div className="container">
        <h2 id="why-title" className="sr-only">
          {why.title}
        </h2>
        <ul className="usp-list">
          {why.items.map((item) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS];
            return (
              <li key={item.title}>
                <Icon aria-hidden="true" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
