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

/** "#B3121C", 0.3 -> "rgba(179, 18, 28, 0.3)" */
export function hexToRgba(hex: string, alpha: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const luminance = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

/**
 * A card's backdrop wash: a faint hint of the shoe's most colourful part, or warm sand for
 * black/white pairs. Kept quiet so the photo, not a coloured glow, carries the card.
 */
export function tintOf(palette: { upper: string; overlay: string; stripe: string }) {
  const colourful = [palette.upper, palette.overlay, palette.stripe].find((c) => {
    const l = luminance(c);
    return l > 0.12 && l < 0.85;
  });
  return colourful ? hexToRgba(colourful, 0.14) : 'rgba(150, 128, 104, 0.14)';
}

/** Card size label: "EU 39–45" for an unbroken run, else the sizes listed. */
export function sizeLabel(sizes: number[]) {
  const sorted = [...sizes].sort((a, b) => a - b);
  const contiguous = sorted.every((size, i) => i === 0 || size === sorted[i - 1] + 1);
  if (contiguous && sorted.length > 2) return `EU ${sorted[0]}–${sorted[sorted.length - 1]}`;
  return `EU ${sorted.join(' · ')}`;
}
