import { useRef, useState, type FormEvent } from 'react';
import { FiArrowRight, FiTruck } from 'react-icons/fi';
import { formatTaka } from '../../lib/format';
import { deliveryZoneFor, DELIVERY_FEES } from '../../lib/pricing';
import { validateShipping, type FieldErrors } from '../../lib/checkout';
import type { Meta, ShippingDetails } from '../../types';

interface Props {
  meta: Meta | null;
  value: ShippingDetails;
  onChange: (patch: Partial<ShippingDetails>) => void;
  serverErrors: FieldErrors;
  onNext: () => void;
}

/** Step 1: name, phone, address, district (delivery fee follows the district). */
export function ShippingStep({ meta, value, onChange, serverErrors, onNext }: Props) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [summary, setSummary] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const shown = { ...errors, ...serverErrors };
  const LABELS: Record<keyof ShippingDetails, string> = {
    name: 'Full name',
    phone: 'Mobile number',
    address: 'Address',
    district: 'District',
    note: 'Note',
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateShipping(value);
    setErrors(found);
    if (Object.keys(found).length) {
      // error summary at the top, focused, linking to each field (inline errors stay)
      setSummary(true);
      window.setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    setSummary(false);
    onNext();
  };

  // Check a field when the shopper leaves it (only once they've typed something)
  const validateOnBlur = (key: keyof ShippingDetails) => {
    if (!value[key] && !errors[key]) return;
    const message = validateShipping(value)[key];
    setErrors((prev) => ({ ...prev, [key]: message }));
  };

  const field = (key: keyof ShippingDetails) => ({
    id: `ship-${key}`,
    value: value[key],
    'aria-invalid': !!shown[key],
    'aria-describedby': `ship-${key}-err`,
    onChange: (event: { target: { value: string } }) => {
      onChange({ [key]: event.target.value });
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    onBlur: () => validateOnBlur(key),
  });

  const summaryItems = (Object.keys(shown) as (keyof ShippingDetails)[]).filter((k) => shown[k]);

  const zone = value.district ? deliveryZoneFor(value.district) : null;

  return (
    <form className="co-step" onSubmit={submit} noValidate>
      {summary && summaryItems.length > 0 && (
        <div
          className="error-summary"
          role="alert"
          tabIndex={-1}
          ref={summaryRef}
          aria-labelledby="ship-error-title"
        >
          <h3 id="ship-error-title">
            Please check {summaryItems.length === 1 ? 'this field' : 'these fields'}
          </h3>
          <ul>
            {summaryItems.map((key) => (
              <li key={key}>
                <a
                  href={`#ship-${key}`}
                  onClick={(event) => {
                    event.preventDefault();
                    document.getElementById(`ship-${key}`)?.focus();
                  }}
                >
                  {LABELS[key]}: {shown[key]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="form-grid two">
        <div className={`field ${shown.name ? 'invalid' : ''}`}>
          <label htmlFor="ship-name">Full name</label>
          <input {...field('name')} autoComplete="name" data-autofocus />
          <span className="err" id="ship-name-err">
            {shown.name}
          </span>
        </div>
        <div className={`field ${shown.phone ? 'invalid' : ''}`}>
          <label htmlFor="ship-phone">Mobile number</label>
          <input
            {...field('phone')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
          />
          <span className="err" id="ship-phone-err">
            {shown.phone}
          </span>
        </div>
        <div className={`field span2 ${shown.address ? 'invalid' : ''}`}>
          <label htmlFor="ship-address">Address</label>
          <textarea
            {...field('address')}
            autoComplete="street-address"
            placeholder="House, road, area (e.g. House 12, Road 7, Dhanmondi)"
          />
          <span className="err" id="ship-address-err">
            {shown.address}
          </span>
        </div>
        <div className={`field ${shown.district ? 'invalid' : ''}`}>
          <label htmlFor="ship-district">District</label>
          <select {...field('district')}>
            <option value="">Choose district…</option>
            {meta &&
              Object.entries(meta.divisions).map(([division, districts]) => (
                <optgroup key={division} label={`${division} Division`}>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>
          <span className="err" id="ship-district-err">
            {shown.district}
          </span>
          {zone && (
            <span className="delivery-pill">
              <FiTruck aria-hidden="true" />
              {zone === 'inside-dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'} delivery:{' '}
              {formatTaka(DELIVERY_FEES[zone])}
            </span>
          )}
        </div>
        <div className="field">
          <label htmlFor="ship-note">Note for the rider (optional)</label>
          <input {...field('note')} placeholder="e.g. call before coming" />
          <span className="hint">Landmarks help the courier find you.</span>
        </div>
      </div>
      <div className="co-nav">
        <button type="submit" className="btn btn-primary">
          Continue to payment <FiArrowRight aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
