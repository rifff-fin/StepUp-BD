import { FiMinus, FiPlus } from 'react-icons/fi';
import { MAX_QTY_PER_LINE } from '../../lib/pricing';

interface Props {
  value: number;
  onChange: (qty: number) => void;
  label: string; // e.g. "Quantity of Dunk Low Panda"
  max?: number;
}

export function QtyStepper({ value, onChange, label, max = MAX_QTY_PER_LINE }: Props) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <FiMinus />
      </button>
      <output aria-live="polite" aria-label="Quantity">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <FiPlus />
      </button>
    </div>
  );
}
