const taka = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** 4990 -> "৳4,990" (lakh grouping, as used in Bangladesh: ৳1,25,000) */
export const formatTaka = (amount: number) => `৳${taka.format(Math.round(amount))}`;

const dayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

/** "Fri, 24 Oct" */
export const formatDay = (date: string | Date) => dayFormat.format(new Date(date));

/** "Fri, 24 Oct – Sun, 26 Oct" */
export const formatDayRange = (from: string | Date, to: string | Date) =>
  `${formatDay(from)} – ${formatDay(to)}`;

/** "#E10600", 0.3 -> "rgba(225, 6, 0, 0.3)" */
export function hexToRgba(hex: string, alpha: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const luminance = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

/** A card's glow: the shoe's most colourful part, or brand red for black/white pairs. */
export function tintOf(palette: { upper: string; overlay: string; stripe: string }) {
  const colourful = [palette.upper, palette.overlay, palette.stripe].find((c) => {
    const l = luminance(c);
    return l > 0.12 && l < 0.85;
  });
  return hexToRgba(colourful || '#E10600', 0.32);
}
