import { createContext, useContext } from 'react';
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: number) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe utilizarse dentro de ToastProvider');
  return context;
}
