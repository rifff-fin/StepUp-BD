import { useState, type CSSProperties } from 'react';
import { FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { Modal } from '../ui/Overlay';
import { ShippingStep } from './ShippingStep';
import { PaymentStep } from './PaymentStep';
import { ReviewStep } from './ReviewStep';
import { Processing, WalletMock } from './PaymentProcessing';
import { SuccessStep } from './SuccessStep';
import { checkout } from '../../content/copy';
import { apiErrorMessage, apiFieldErrors } from '../../lib/api';
import { LAST_ORDER_KEY, normalizePhone, type FieldErrors } from '../../lib/checkout';
import { writePref } from '../../lib/storage';
import { scrollToId } from '../../lib/lenis';
import { cartTotals, deliveryZoneFor } from '../../lib/pricing';
import { useMeta } from '../../hooks/useCatalog';
import { createOrder } from '../../services/storeService';
import { useCart } from '../../store/cartStore';
import { useUi } from '../../store/uiStore';
import type { Order, PaymentMethod, ShippingDetails } from '../../types';

type Step = 'shipping' | 'payment' | 'review' | 'wallet' | 'processing' | 'success';

const STEP_INDEX: Record<Step, number> = {
  shipping: 0,
  payment: 1,
  review: 2,
  wallet: 2,
  processing: 2,
  success: 3,
};

const EMPTY_SHIPPING: ShippingDetails = {
  name: '',
  phone: '',
  address: '',
  district: '',
  note: '',
};
const PROCESSING_MS = 2000;
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/**
 * Demo checkout (controller for the four steps). Shipping → Payment → Review → Success.
 * The "DEMO MODE" banner stays on every step; no real payment is ever processed.
 */
export function Checkout() {
  const open = useUi((s) => s.checkoutOpen);
  const items = useCart((s) => s.items);
  const coupon = useCart((s) => s.coupon);
  const cartZone = useCart((s) => s.zone);
  const { meta } = useMeta();

  const [step, setStep] = useState<Step>('shipping');
  const [shipping, setShipping] = useState<ShippingDetails>(EMPTY_SHIPPING);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [method, setMethod] = useState<PaymentMethod>('cod');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const zone = shipping.district ? deliveryZoneFor(shipping.district) : cartZone;
  const totals = cartTotals(items, zone, coupon);

  const close = () => {
    if (step === 'processing') return; // don't interrupt a payment in progress
    if (step === 'success') {
      finish();
      return;
    }
    if (step === 'wallet') setStep('review');
    useUi.getState().closeCheckout();
  };

  /** "Continue shopping": reset the cart and the checkout, back to the shop. */
  const finish = () => {
    useCart.getState().clear();
    useUi.getState().closeCheckout();
    window.setTimeout(() => {
      setStep('shipping');
      setOrder(null);
      setError('');
      scrollToId('shop');
    }, 400);
  };

  const placeOrder = async () => {
    setStep('processing');
    setError('');
    try {
      const [placed] = await Promise.all([
        createOrder({
          items: items.map(({ productId, size, qty }) => ({ productId, size, qty })),
          shipping: { ...shipping, phone: normalizePhone(shipping.phone) },
          paymentMethod: method,
          couponCode: coupon?.code ?? null,
        }),
        wait(PROCESSING_MS),
      ]);
      setOrder(placed);
      setStep('success');
      writePref(
        LAST_ORDER_KEY,
        JSON.stringify({ orderNumber: placed.orderNumber, phone: placed.shipping.phone }),
      );
    } catch (err) {
      const fields = apiFieldErrors(err) as FieldErrors;
      const shippingFields = (['name', 'phone', 'address', 'district'] as const).filter(
        (key) => fields[key],
      );
      if (shippingFields.length) {
        setServerErrors(fields);
        setStep('shipping');
        return;
      }
      if ('couponCode' in fields) useCart.getState().removeCoupon();
      setError(apiErrorMessage(err));
      setStep('review');
    }
  };

  const index = STEP_INDEX[step];

  return (
    <Modal
      open={open}
      onClose={close}
      labelledBy="co-title"
      panelClassName="co-panel"
      closeLabel="Close checkout"
      hideClose={step === 'processing'}
    >
      <div className="demo-banner" role="note">
        <FiAlertTriangle aria-hidden="true" /> {checkout.demoBanner}
      </div>
      <div className="co-body">
        <h2 className="co-title" id="co-title">
          {step === 'success' ? 'Thank you' : 'Checkout'}
        </h2>

        <div className="steps" role="list" aria-label="Checkout progress">
          <span className="steps-bar" aria-hidden="true">
            <i style={{ '--p': index / 3 } as CSSProperties} />
          </span>
          {checkout.steps.map((label, i) => (
            <div
              key={label}
              role="listitem"
              className={`step ${i === index ? 'active' : ''} ${i < index ? 'done' : ''}`}
              aria-current={i === index ? 'step' : undefined}
            >
              <b>{i < index ? <FiCheck aria-label="done" /> : i + 1}</b>
              {label}
            </div>
          ))}
        </div>

        {items.length === 0 && step !== 'success' ? (
          <p className="co-error">Your cart is empty. Add a pair first.</p>
        ) : step === 'shipping' ? (
          <ShippingStep
            meta={meta}
            value={shipping}
            onChange={(patch) => {
              setShipping((prev) => ({ ...prev, ...patch }));
              if (patch.district) useCart.getState().setZone(deliveryZoneFor(patch.district));
              setServerErrors({});
            }}
            serverErrors={serverErrors}
            onNext={() => setStep('payment')}
          />
        ) : step === 'payment' ? (
          <PaymentStep
            method={method}
            onMethod={setMethod}
            onBack={() => setStep('shipping')}
            onNext={() => setStep('review')}
          />
        ) : step === 'review' ? (
          <ReviewStep
            items={items}
            totals={totals}
            couponCode={coupon?.code ?? null}
            shipping={shipping}
            method={method}
            error={error}
            onEdit={setStep}
            onPlace={() =>
              method === 'bkash' || method === 'nagad' ? setStep('wallet') : placeOrder()
            }
          />
        ) : step === 'wallet' && (method === 'bkash' || method === 'nagad') ? (
          <WalletMock
            method={method}
            amount={totals.total}
            phone={shipping.phone}
            onConfirm={placeOrder}
            onCancel={() => setStep('review')}
          />
        ) : step === 'processing' ? (
          <Processing method={method} />
        ) : order ? (
          <SuccessStep order={order} onContinue={finish} />
        ) : null}
      </div>
    </Modal>
  );
}
