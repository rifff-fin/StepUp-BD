import { formatTaka } from '../../lib/format';

interface Props {
  min: number;
  max: number;
  low: number;
  high: number;
  step?: number;
  onChange: (low: number, high: number) => void;
}

/** Two-thumb price slider (two native range inputs on one track: keyboard + screen readers). */
export function PriceRange({ min, max, low, high, step = 100, onChange }: Props) {
  const pct = (value: number) => ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="range-values" aria-hidden="true">
        <span>{formatTaka(low)}</span>
        <span>{formatTaka(high)}</span>
      </div>
      <div className="range">
        <div className="range-track">
          <div
            className="range-fill"
            style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          aria-label="Minimum price"
          aria-valuetext={formatTaka(low)}
          onChange={(event) => onChange(Math.min(Number(event.target.value), high - step), high)}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          aria-label="Maximum price"
          aria-valuetext={formatTaka(high)}
          onChange={(event) => onChange(low, Math.max(Number(event.target.value), low + step))}
        />
      </div>
    </div>
  );
}
