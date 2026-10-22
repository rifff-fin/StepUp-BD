/** StepUp BD wordmark with a simple rising-step mark (original artwork, no brand marks). */
export function Logo() {
  return (
    <span className="logo">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M3 16c3.5 0 6-1.6 8.2-4.2l2.3 2.3c1.6 1.6 3.9 2.4 7.5 2.4v3H3z" fill="#fff" />
          <path d="M3 20.5h18" stroke="#000" strokeWidth="1.2" opacity=".35" />
        </svg>
      </span>
      <span>
        STEPUP <b>BD</b>
      </span>
    </span>
  );
}
