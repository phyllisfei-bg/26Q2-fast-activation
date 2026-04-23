import { useImperativeHandle, useRef, useState, forwardRef } from 'react';

export interface SnackbarHandle {
  show: (msg?: string, showCta?: boolean) => void;
  dismiss: () => void;
}

interface Props {
  onBackToDashboard?: () => void;
}

export const Snackbar = forwardRef<SnackbarHandle, Props>(({ onBackToDashboard }, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('Wallet created.');
  const [showCta, setShowCta] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useImperativeHandle(ref, () => ({
    show(msg = 'Wallet created.', cta = true) {
      setMessage(msg);
      setShowCta(cta);
      setVisible(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setVisible(false), cta ? 8000 : 4000);
    },
    dismiss() { setVisible(false); },
  }));

  return (
    <div className={`snackbar${visible ? ' show' : ''}`}>
      <span className="snackbar-text">{message}</span>
      {showCta && (
        <button className="snackbar-cta" onClick={onBackToDashboard}>
          Back to dashboard
        </button>
      )}
      <button className="snackbar-close" onClick={() => setVisible(false)}>✕</button>
    </div>
  );
});
Snackbar.displayName = 'Snackbar';
