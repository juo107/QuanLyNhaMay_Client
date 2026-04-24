import React, { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ToastMessage, ToastContextType } from '../types/toast';
import { ToastContainer } from '../components/ToastContainer';
import { registerToast } from '../utils/toastManager';

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Tự động xóa sau duration (mặc định 3s)
    const timeout = toast.duration || 3000;
    setTimeout(() => {
      removeToast(id);
    }, timeout);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register for global use
  React.useEffect(() => {
    registerToast(addToast);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};
