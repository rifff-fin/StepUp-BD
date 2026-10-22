import { useState, type FormEvent } from 'react';
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
  const shown = { ...errors, ...serverErrors };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateShipping(value);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`ship-${first}`)?.focus();
      return;
    }
    onNext();
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
  });

  const zone = value.district ? deliveryZoneFor(value.district) : null;

  return (
    <form className="co-step" onSubmit={submit} noValidate>
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
