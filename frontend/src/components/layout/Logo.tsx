/**
 * StepUp BD logo: an ink tile with three rising steps (the last one in University Red),
 * then the wordmark. Original artwork, no brand marks.
 */
export function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo-word">
        StepUp<b>BD</b>
      </span>
    </span>
  );
}

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="logo-ink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2b31" />
          <stop offset="1" stopColor="#0c0c0e" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#logo-ink)" />
      <path
        d="M7 23.5h5.5V18H18v-5.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 12.5h6.5V7"
        fill="none"
        stroke="#e2263c"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
