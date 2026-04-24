import React from 'react';
import type { ToastMessage } from '../types/toast';
import { ToastItem } from '@/components/ToastItem';

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div 
      className="fixed top-5 right-5 z-[9999] flex flex-col items-end pointer-events-none"
    >
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};
