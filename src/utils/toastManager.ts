import type { ToastType } from '../types/toast';

type ToastParams = {
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
};

let addToastRef: (toast: ToastParams) => void;

export const registerToast = (fn: typeof addToastRef) => {
  addToastRef = fn;
};

export const toastNative = {
  success: (msg: string, title?: string, duration?: number) => 
    addToastRef?.({ message: msg, type: 'success', title, duration }),
  error: (msg: string, title?: string, duration?: number) => 
    addToastRef?.({ message: msg, type: 'error', title, duration }),
  info: (msg: string, title?: string, duration?: number) => 
    addToastRef?.({ message: msg, type: 'info', title, duration }),
  warning: (msg: string, title?: string, duration?: number) => 
    addToastRef?.({ message: msg, type: 'warning', title, duration }),
};
