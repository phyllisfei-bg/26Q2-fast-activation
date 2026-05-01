import { useImperativeHandle, useRef, useState, forwardRef, useCallback } from 'react';

export interface SnackbarHandle {
  show: (
    msg?: string,
    showCta?: boolean,
    onDismiss?: () => void,
    quickAction?: { label: string; onClick: () => void },
  ) => void;
  dismiss: () => void;
}

interface Props {
  onBackToDashboard?: () => void;
}

export const Snackbar = forwardRef<SnackbarHandle, Props>(({ onBackToDashboard }, ref) => {
  const [visible, setVisible]           = useState(false);
  const [message, setMessage]           = useState('Wallet created.');
  const [showCta, setShowCta]           = useState(true);
  const [quickAction, setQuickAction]   = useState<{ label: string; onClick: () => void } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onDismissRef = useRef<(() => void) | undefined>(undefined);

  const hide = useCallback(() => {
    setVisible(false);
    setQuickAction(null);
    if (onDismissRef.current) {
      const cb = onDismissRef.current;
      onDismissRef.current = undefined;
      setTimeout(cb, 300);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    show(msg = 'Wallet created.', cta = true, onDismiss?: () => void, qa?) {
      setMessage(msg);
      setShowCta(cta);
      setQuickAction(qa ?? null);
      setVisible(true);
      onDismissRef.current = onDismiss;
      clearTimeout(timer.current);
      timer.current = setTimeout(hide, (cta || qa) ? 8000 : 4000);
    },
    dismiss() { hide(); },
  }));

  const handleQuickAction = () => {
    quickAction?.onClick();
    hide();
  };

  return (
    <div className={`snackbar${visible ? ' show' : ''}`}>
      <span className="snackbar-text">{message}</span>
      {showCta && (
        <button className="snackbar-cta" onClick={onBackToDashboard}>
          Back to dashboard
        </button>
      )}
      {quickAction && (
        <button className="snackbar-cta" onClick={handleQuickAction}>
          {quickAction.label}
        </button>
      )}
      <button className="snackbar-close" onClick={hide}>✕</button>
    </div>
  );
});
Snackbar.displayName = 'Snackbar';
