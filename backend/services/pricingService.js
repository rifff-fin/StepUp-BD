// Pricing rules, in one place. The server always recalculates totals with these; the numbers
// the browser shows are only a preview.

const DELIVERY_FEES = {
  'inside-dhaka': 100,
  'outside-dhaka': 150,
};

// Business days are not modelled: estimates are calendar days from the order date
const DELIVERY_DAYS = {
  'inside-dhaka': { from: 1, to: 2 },
  'outside-dhaka': { from: 3, to: 5 },
};

const MAX_QTY_PER_LINE = 10;

const deliveryZoneFor = (district) => (district === 'Dhaka' ? 'inside-dhaka' : 'outside-dhaka');

const couponDiscount = (subtotal, percent) => Math.round((subtotal * (percent || 0)) / 100);

/**
 * @param {{ subtotal: number, couponPercent?: number, deliveryZone: string }} input
 * @returns {{ subtotal: number, discount: number, deliveryFee: number, total: number }}
 */
const calculateTotals = ({ subtotal, couponPercent = 0, deliveryZone }) => {
  const discount = couponDiscount(subtotal, couponPercent);
  const deliveryFee = DELIVERY_FEES[deliveryZone] ?? DELIVERY_FEES['outside-dhaka'];
  return { subtotal, discount, deliveryFee, total: subtotal - discount + deliveryFee };
};

const estimateDelivery = (deliveryZone, orderedAt = new Date()) => {
  const days = DELIVERY_DAYS[deliveryZone] ?? DELIVERY_DAYS['outside-dhaka'];
  const addDays = (n) => {
    const d = new Date(orderedAt);
    d.setDate(d.getDate() + n);
    return d;
  };
  return { from: addDays(days.from), to: addDays(days.to) };
};

module.exports = {
  DELIVERY_FEES,
  DELIVERY_DAYS,
  MAX_QTY_PER_LINE,
  deliveryZoneFor,
  couponDiscount,
  calculateTotals,
  estimateDelivery,
};
