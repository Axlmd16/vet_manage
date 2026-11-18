import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ToastContext } from './toast-context';
import type { ToastType } from './toast-context';

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, type }].slice(-4));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />)}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(() => onDismiss(toast.id), 4500);
    return () => window.clearTimeout(timeout);
  }, [onDismiss, toast.id]);

  const label = toast.type === 'success' ? 'Listo' : toast.type === 'error' ? 'No se pudo completar' : 'Información';
  const icon = toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : 'i';

  return (
    <div className={`toast toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
      <span className="toast__icon" aria-hidden="true">{icon}</span>
      <div className="toast__copy"><strong>{label}</strong><span>{toast.message}</span></div>
      <button className="toast__close" type="button" aria-label="Cerrar notificación" onClick={() => onDismiss(toast.id)}>×</button>
    </div>
  );
}
