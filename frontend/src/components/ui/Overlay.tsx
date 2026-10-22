import { useRef, type CSSProperties, type ReactNode } from 'react';
import { FiX } from 'react-icons/fi';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  titleId: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Slide-in side panel (cart, wishlist): dialog semantics, focus trap, Escape to close. */
export function Drawer({ open, onClose, title, titleId, children, footer }: DrawerProps) {
  const ref = useRef<HTMLElement>(null);
  useFocusTrap(open, ref, onClose);

  return (
    <>
      <div className={`backdrop ${open ? 'show' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside
        ref={ref}
        className={`drawer ${open ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
        tabIndex={-1}
      >
        <div className="drawer-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>
        <div className="drawer-body" data-lenis-prevent>
          {children}
        </div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </aside>
    </>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  panelClassName?: string;
  panelStyle?: CSSProperties;
  closeLabel?: string;
  /** Hide the close button (e.g. while a payment is "processing"). */
  hideClose?: boolean;
}

/** Centred dialog (bottom sheet on phones): focus trap, Escape and backdrop close. */
export function Modal({
  open,
  onClose,
  labelledBy,
  children,
  panelClassName = '',
  panelStyle,
  closeLabel = 'Close',
  hideClose = false,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(open, ref, onClose);

  return (
    <div className={`modal ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        className={`modal-panel ${panelClassName}`}
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        data-lenis-prevent
      >
        {!hideClose && (
          <button
            type="button"
            className="icon-btn modal-close"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <FiX />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
