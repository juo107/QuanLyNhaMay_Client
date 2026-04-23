import React from 'react';
import { Drawer as AntdDrawer } from 'antd';
import type { DrawerProps } from 'antd';
import { useResponsive } from '../hooks/useResponsive';

export interface ICommonDrawerProps extends Omit<DrawerProps, 'open' | 'onClose' | 'title'> {
  title: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'default' | 'large';
}

export const CommonDrawer: React.FC<ICommonDrawerProps> = ({
  title,
  isOpen,
  onClose,
  children,
  size = 'large',
  ...props
}) => {
  const { isMobile } = useResponsive();
  return (
    <AntdDrawer
      title={<div className="text-base font-semibold text-gray-800">{title}</div>}
      open={isOpen}
      onClose={onClose}
      size={size}
      width={isMobile ? '100%' : undefined}
      destroyOnClose
      {...props}
    >
      <div className="space-y-4">{children}</div>
    </AntdDrawer>
  );
};

export default CommonDrawer;
