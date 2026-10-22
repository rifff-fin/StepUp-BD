import { useState, type FormEvent } from 'react';
import { FiArrowLeft, FiArrowRight, FiCreditCard, FiInfo, FiPackage } from 'react-icons/fi';
import { checkout } from '../../content/copy';
import {
  formatCardNumber,
  formatExpiry,
  PAYMENT_OPTIONS,
  validateTestCard,
  type CardInput,
} from '../../lib/checkout';
import type { PaymentMethod } from '../../types';

interface Props {
  method: PaymentMethod;
  onMethod: (method: PaymentMethod) => void;
  onBack: () => void;
  onNext: () => void;
}

/**
 * Step 2: payment method. The card form is a demo: it accepts only the test card, and its
 * values live in this component's state only. They are never stored or sent anywhere, and
 * are gone once you leave this step.
 */
export function PaymentStep({ method, onMethod, onBack, onNext }: Props) {
  const [card, setCard] = useState<CardInput>({ number: '', expiry: '', cvc: '', name: '' });
  const [cardErrors, setCardErrors] = useState<Partial<Record<keyof CardInput, string>>>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (method === 'card') {
      const errors = validateTestCard(card);
      setCardErrors(errors);
      const first = Object.keys(errors)[0];
      if (first) {
        document.getElementById(`card-${first}`)?.focus();
        return;
      }
    }
    onNext();
  };

  const cardField = (key: keyof CardInput) => ({
    id: `card-${key}`,
    value: card[key],
    autoComplete: 'off', // never let the browser fill a real card here
    'aria-invalid': !!cardErrors[key],
    'aria-describedby': `card-${key}-err`,
    'data-lpignore': 'true',
    'data-1p-ignore': 'true',
  });

  return (
    <form className="co-step" onSubmit={submit} noValidate>
      <fieldset className="pay-options">
        <legend className="sr-only">Payment method</legend>
        {PAYMENT_OPTIONS.map((option) => (
          <label className="pay-opt" key={option.id}>
            <input
              type="radio"
              name="payment"
              value={option.id}
              checked={method === option.id}
              onChange={() => onMethod(option.id)}
            />
            <span className="pay-card">
              <span className="pay-logo" style={{ background: option.colour }} aria-hidden="true">
                {option.id === 'card' ? (
                  <FiCreditCard />
                ) : option.id === 'cod' ? (
                  <FiPackage />
                ) : (
                  option.badge
                )}
              </span>
              <b>{option.label}</b>
              <small>{option.note}</small>
            </span>
          </label>
        ))}
      </fieldset>

      {method === 'card' && (
        <div className="card-form">
          <p className="test-note">
            <FiInfo aria-hidden="true" /> {checkout.testCardNote}
          </p>
          <div className="form-grid">
            <div className={`field ${cardErrors.number ? 'invalid' : ''}`}>
              <label htmlFor="card-number">Card number (test)</label>
              <input
                {...cardField('number')}
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                onChange={(event) =>
                  setCard((c) => ({ ...c, number: formatCardNumber(event.target.value) }))
                }
              />
              <span className="err" id="card-number-err">
                {cardErrors.number}
              </span>
            </div>
            <div className="row2">
              <div className={`field ${cardErrors.expiry ? 'invalid' : ''}`}>
                <label htmlFor="card-expiry">Expiry</label>
                <input
                  {...cardField('expiry')}
                  inputMode="numeric"
                  placeholder="MM/YY"
                  onChange={(event) =>
                    setCard((c) => ({ ...c, expiry: formatExpiry(event.target.value) }))
                  }
                />
                <span className="err" id="card-expiry-err">
                  {cardErrors.expiry}
                </span>
              </div>
              <div className={`field ${cardErrors.cvc ? 'invalid' : ''}`}>
                <label htmlFor="card-cvc">CVC</label>
                <input
                  {...cardField('cvc')}
                  inputMode="numeric"
                  placeholder="123"
                  maxLength={3}
                  onChange={(event) =>
                    setCard((c) => ({
                      ...c,
                      cvc: event.target.value.replace(/\D/g, '').slice(0, 3),
                    }))
                  }
                />
                <span className="err" id="card-cvc-err">
                  {cardErrors.cvc}
                </span>
              </div>
            </div>
            <div className={`field ${cardErrors.name ? 'invalid' : ''}`}>
              <label htmlFor="card-name">Name on card</label>
              <input
                {...cardField('name')}
                placeholder="Any name"
                onChange={(event) => setCard((c) => ({ ...c, name: event.target.value }))}
              />
              <span className="err" id="card-name-err">
                {cardErrors.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {(method === 'bkash' || method === 'nagad') && (
        <p className="test-note" style={{ marginTop: 16 }}>
          <FiInfo aria-hidden="true" /> You will confirm on a demo{' '}
          {method === 'bkash' ? 'bKash' : 'Nagad'} screen after reviewing your order.{' '}
          {checkout.walletNote}
        </p>
      )}

      <div className="co-nav">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <FiArrowLeft aria-hidden="true" /> Back
        </button>
        <button type="submit" className="btn btn-primary">
          Review order <FiArrowRight aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
