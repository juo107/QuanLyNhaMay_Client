import React from 'react';
import { Drawer as AntdDrawer } from 'antd';
import type { DrawerProps } from 'antd';

export interface ICommonDrawerProps extends Omit<DrawerProps, 'open' | 'onClose' | 'title'> {
  title: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
}

export const CommonDrawer: React.FC<ICommonDrawerProps> = ({
  title,
  isOpen,
  onClose,
  children,
  width = 920,
  ...props
}) => {
  return (
    <AntdDrawer
      title={<div className="text-base font-semibold text-gray-800">{title}</div>}
      open={isOpen}
      onClose={onClose}
      width={width}
      destroyOnClose
      {...props}
    >
      <div className="space-y-4">{children}</div>
    </AntdDrawer>
  );
};

export default CommonDrawer;
