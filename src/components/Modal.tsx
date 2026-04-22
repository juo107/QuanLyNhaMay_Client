import React from 'react';
import { Modal as AntdModal } from 'antd';
import type { ModalProps } from 'antd';

export interface ICommonModalProps extends ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
  hideFooter?: boolean;
}

export const Modal: React.FC<ICommonModalProps> = ({
  title,
  isOpen,
  onClose,
  children,
  width = 600,
  hideFooter = false,
  ...props
}) => {
  return (
    <AntdModal
      title={<div className="text-lg font-semibold text-gray-800">{title}</div>}
      open={isOpen}
      onCancel={onClose}
      width={width}
      footer={hideFooter ? null : props.footer}
      destroyOnClose
      maskClosable={true}
      centered
      className="custom-modal"
      {...props}
    >
      <div className="py-4">{children}</div>
    </AntdModal>
  );
};

export default Modal;
