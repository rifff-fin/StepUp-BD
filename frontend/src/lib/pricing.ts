import type { AppliedCoupon, CartItem, DeliveryZone } from '../types';

// Mirrors backend/services/pricingService.js. The server recalculates every order; these
// numbers are only the preview shown in the cart and at checkout.
export const DELIVERY_FEES: Record<DeliveryZone, number> = {
  'inside-dhaka': 100,
  'outside-dhaka': 150,
};

export const MAX_QTY_PER_LINE = 10;

export const deliveryZoneFor = (district: string): DeliveryZone =>
  district === 'Dhaka' ? 'inside-dhaka' : 'outside-dhaka';

export function cartTotals(items: CartItem[], zone: DeliveryZone, coupon: AppliedCoupon | null) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = coupon ? Math.round((subtotal * coupon.percent) / 100) : 0;
  const deliveryFee = items.length ? DELIVERY_FEES[zone] : 0;
  return { subtotal, discount, deliveryFee, total: subtotal - discount + deliveryFee };
}
