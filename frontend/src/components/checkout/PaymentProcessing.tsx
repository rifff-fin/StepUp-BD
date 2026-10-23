import { useState, type FormEvent } from 'react';
import { FiLock } from 'react-icons/fi';
import { checkout } from '../../content/copy';
import { DEMO_PIN, isBdMobile, normalizePhone, paymentLabel } from '../../lib/checkout';
import { formatTaka } from '../../lib/format';
import type { PaymentMethod, WalletMethod } from '../../types';

const WALLETS = {
  bkash: { name: 'bKash', colour: '#e2136e' },
  nagad: { name: 'Nagad', colour: '#f6921e' },
  rocket: { name: 'Rocket', colour: '#8c3494' },
} as const;

/**
 * Mock mobile-wallet screen (demo). Accepts any valid number and only the demo PIN; the
 * values stay in this component and are never stored or sent.
 */
export function WalletMock({
  method,
  amount,
  phone,
  onConfirm,
  onCancel,
}: {
  method: WalletMethod;
  amount: number;
  phone: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const wallet = WALLETS[method];
  const [number, setNumber] = useState(normalizePhone(phone));
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!isBdMobile(number)) {
      setError(`Enter your ${wallet.name} account number (01XXXXXXXXX)`);
      return;
    }
    if (pin !== DEMO_PIN) {
      setError('Wrong PIN. In this demo the PIN is 12345.');
      return;
    }
    setError('');
    setVerifying(true);
    setPin('');
    window.setTimeout(onConfirm, 900);
  };

  return (
    <form className="wallet co-step" onSubmit={submit} noValidate>
      <div className="wallet-head" style={{ background: wallet.colour }}>
        <b>{wallet.name} Payment</b>
        <span>DEMO</span>
      </div>
      <div className="wallet-body">
        <div className="wallet-amount">
          StepUp BD (merchant) <b>{formatTaka(amount)}</b>
        </div>
        <div className="field">
          <label htmlFor="wallet-number">{wallet.name} account number</label>
          <input
            id="wallet-number"
            type="tel"
            inputMode="numeric"
            autoComplete="off"
            value={number}
            onChange={(event) => setNumber(event.target.value)}
            disabled={verifying}
            data-autofocus
          />
        </div>
        <div className="field">
          <label htmlFor="wallet-pin">PIN (demo: 12345)</label>
          <input
            id="wallet-pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={5}
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
            disabled={verifying}
            aria-describedby="wallet-msg"
            data-lpignore="true"
            data-1p-ignore="true"
          />
        </div>
        <p className="test-note" style={{ marginBottom: 0 }}>
          {checkout.walletNote}
        </p>
        <p id="wallet-msg" className="coupon-msg err" role="alert">
          {error}
        </p>
        <button type="submit" className="btn btn-primary btn-block" disabled={verifying}>
          {verifying ? (
            <>
              <span className="spinner sm" aria-hidden="true" /> Verifying…
            </>
          ) : (
            <>
              <FiLock aria-hidden="true" /> Confirm {formatTaka(amount)}
            </>
          )}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={onCancel}
          disabled={verifying}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/** The 2-second "processing" screen shown while the order is placed. */
export function Processing({ method }: { method: PaymentMethod }) {
  const text =
    method === 'cod'
      ? 'Placing your order…'
      : `Processing your ${method === 'card' ? 'card' : paymentLabel(method)} payment…`;
  return (
    <div className="processing co-step" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <h3>{text}</h3>
      <p>Demo mode: no real money moves. Please don't close this window.</p>
      <div className="proc-bar" aria-hidden="true">
        <i />
      </div>
    </div>
  );
}
