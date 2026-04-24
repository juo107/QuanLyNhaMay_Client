import React from 'react';
import type { ToastMessage } from '../types/toast';
import { 
  CheckCircleFilled, 
  CloseCircleFilled, 
  InfoCircleFilled, 
  ExclamationCircleFilled,
  CloseOutlined 
} from '@ant-design/icons';

interface ToastItemProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const toastStyles = {
  success: {
    icon: <CheckCircleFilled className="text-green-500" />,
    border: 'border-green-100',
    bg: 'bg-green-50',
    text: 'text-green-800'
  },
  error: {
    icon: <CloseCircleFilled className="text-red-500" />,
    border: 'border-red-100',
    bg: 'bg-red-50',
    text: 'text-red-800'
  },
  warning: {
    icon: <ExclamationCircleFilled className="text-amber-500" />,
    border: 'border-amber-100',
    bg: 'bg-amber-50',
    text: 'text-amber-800'
  },
  info: {
    icon: <InfoCircleFilled className="text-blue-500" />,
    border: 'border-blue-100',
    bg: 'bg-blue-50',
    text: 'text-blue-800'
  }
};

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const style = toastStyles[toast.type];

  return (
    <div 
      className={`
        flex items-start p-4 mb-3 w-80 rounded-xl border shadow-lg 
        animate-toast-in
        ${style.bg} ${style.border} ${style.text}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 text-xl mt-0.5">
        {style.icon}
      </div>
      <div className="ml-3 flex-1">
        {toast.title && <p className="text-sm font-bold mb-0.5">{toast.title}</p>}
        <p className="text-xs font-medium opacity-90">{toast.message}</p>
      </div>
      <button 
        onClick={() => onClose(toast.id)}
        className="ml-4 flex-shrink-0 rounded-lg p-1 hover:bg-black/5 transition-colors cursor-pointer"
      >
        <CloseOutlined className="text-[12px] opacity-60" />
      </button>
    </div>
  );
};
