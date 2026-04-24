import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';
import type { ToastType } from '../types/toast';

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast } = context;

  const show = (message: string, type: ToastType = 'info', title?: string, duration?: number) => {
    addToast({ message, type, title, duration });
  };

  return {
    success: (msg: string, title?: string, dur?: number) => show(msg, 'success', title, dur),
    error: (msg: string, title?: string, dur?: number) => show(msg, 'error', title, dur),
    info: (msg: string, title?: string, dur?: number) => show(msg, 'info', title, dur),
    warning: (msg: string, title?: string, dur?: number) => show(msg, 'warning', title, dur),
  };
};
