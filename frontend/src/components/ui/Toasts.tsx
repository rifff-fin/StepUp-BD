import { FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useUi } from '../../store/uiStore';

/** Short confirmations ("Added to cart"), announced to screen readers. */
export function Toasts() {
  const toasts = useUi((s) => s.toasts);
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.tone === 'error' ? 'error' : ''}`}>
          <span className="toast-icon" aria-hidden="true">
            {toast.tone === 'error' ? <FiAlertCircle /> : <FiCheck />}
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
