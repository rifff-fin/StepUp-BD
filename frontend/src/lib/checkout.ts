import type { PaymentMethod, ShippingDetails, WalletMethod } from '../types';

export type FieldErrors = Partial<Record<keyof ShippingDetails, string>>;

/** "+880 1712-345678" -> "01712345678" (same rule as the API). */
export const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.startsWith('880') ? `0${digits.slice(3)}` : digits;
};

export const isBdMobile = (value: string) => /^01[3-9]\d{8}$/.test(normalizePhone(value));

export function validateShipping(s: ShippingDetails): FieldErrors {
  const errors: FieldErrors = {};
  if (s.name.trim().length < 2) errors.name = 'Please enter your full name';
  if (!isBdMobile(s.phone))
    errors.phone = 'Enter a valid Bangladeshi mobile number, e.g. 01712345678';
  if (s.address.trim().length < 8) errors.address = 'Please enter house, road and area';
  if (!s.district) errors.district = 'Please choose your district';
  return errors;
}

// ---- Demo payment checks. These values stay in the browser: they are never stored or sent.

export const TEST_CARD = '4242424242424242';
export const DEMO_PIN = '12345';

export interface CardInput {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

/** Accepts only the test card, a future MM/YY expiry and a 3-digit CVC. */
export function validateTestCard(card: CardInput): Partial<Record<keyof CardInput, string>> {
  const errors: Partial<Record<keyof CardInput, string>> = {};
  if (card.number.replace(/\D/g, '') !== TEST_CARD) {
    errors.number = 'Demo mode accepts only the test card 4242 4242 4242 4242';
  }
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(card.expiry.trim());
  const month = match ? Number(match[1]) : 0;
  const year = match ? 2000 + Number(match[2]) : 0;
  const now = new Date();
  const expired =
    year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
  if (!match || month < 1 || month > 12 || expired) errors.expiry = 'Use any future date as MM/YY';
  if (!/^\d{3}$/.test(card.cvc)) errors.cvc = 'Any 3 digits';
  if (card.name.trim().length < 2) errors.name = 'Name as on card (any name)';
  return errors;
}

/** "4242424242424242" -> "4242 4242 4242 4242" while typing. */
export const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

/** "1228" -> "12/28" while typing. */
export const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

/** Checkout payment choices (bKash / Nagad / Rocket / card are demo screens). */
export const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  note: string;
  colour: string;
  badge: string;
}[] = [
  {
    id: 'bkash',
    label: 'bKash',
    note: 'Mobile wallet (demo screen)',
    colour: '#e2136e',
    badge: 'bK',
  },
  {
    id: 'nagad',
    label: 'Nagad',
    note: 'Mobile wallet (demo screen)',
    colour: '#f6921e',
    badge: 'N',
  },
  {
    id: 'rocket',
    label: 'Rocket',
    note: 'Mobile wallet (demo screen)',
    colour: '#8c3494',
    badge: 'R',
  },
  {
    id: 'card',
    label: 'Card',
    note: 'Visa / Mastercard (test card only)',
    colour: '#1f4fd1',
    badge: '',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    note: 'Pay the rider when it arrives',
    colour: '#22a35a',
    badge: '',
  },
];

/** bKash, Nagad and Rocket confirm on a mock wallet screen. */
export const isWallet = (method: PaymentMethod): method is WalletMethod =>
  method === 'bkash' || method === 'nagad' || method === 'rocket';

export const paymentLabel = (method: PaymentMethod) =>
  PAYMENT_OPTIONS.find((option) => option.id === method)?.label ?? method;

/** The latest order placed in this browser, so "Track order" can fill itself in. */
export const LAST_ORDER_KEY = 'stepup:last-order';
