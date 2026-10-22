import { useRef, type KeyboardEvent } from 'react';

const STORE_SIZES = [39, 40, 41, 42, 43, 44, 45];

interface Props {
  available: number[];
  value: number | null;
  onChange: (size: number) => void;
  error?: string;
  /** Changes on each failed "Add to cart" so the shake animation replays. */
  errorKey?: number;
  labelId: string;
}

/** EU size radio group: arrow keys move between the sizes in stock. */
export function SizePicker({ available, value, onChange, error, errorKey, labelId }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = STORE_SIZES.filter((s) => available.includes(s));
  const tabStop = value ?? enabled[0];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, size: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = enabled.indexOf(size);
    const next = enabled[(index + step + enabled.length) % enabled.length];
    onChange(next);
    refs.current[STORE_SIZES.indexOf(next)]?.focus();
  };

  return (
    <div>
      <div
        key={errorKey}
        className={`size-grid ${error ? 'error' : ''}`}
        role="radiogroup"
        aria-labelledby={labelId}
        aria-invalid={!!error}
        aria-describedby={error ? `${labelId}-error` : undefined}
      >
        {STORE_SIZES.map((size, i) => {
          const inStock = available.includes(size);
          return (
            <button
              key={size}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              className="size-btn"
              aria-checked={value === size}
              aria-label={inStock ? `EU ${size}` : `EU ${size}, sold out`}
              disabled={!inStock}
              tabIndex={size === tabStop ? 0 : -1}
              onClick={() => onChange(size)}
              onKeyDown={(event) => onKeyDown(event, size)}
            >
              {size}
            </button>
          );
        })}
      </div>
      <p className="size-error" id={`${labelId}-error`} role="alert">
        {error}
      </p>
    </div>
  );
}
