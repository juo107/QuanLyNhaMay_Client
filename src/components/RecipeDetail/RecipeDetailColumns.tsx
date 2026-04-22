import React from 'react';
import { Button, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { IIngredient, IProduct, IByProduct } from '../../types/recipeTypes';

export const getIngredientColumns = (openProductModal: (code: string) => void) => [
  { title: 'Process', dataIndex: 'processId', key: 'processId', width: 90 },
  { title: 'Ingredient ID', dataIndex: 'ingredientId', key: 'ingredientId', width: 120 },
  { title: 'Code', dataIndex: 'ingredientCode', key: 'ingredientCode', width: 160 },
  {
    title: 'Tên',
    dataIndex: 'itemName',
    key: 'itemName',
    render: (value: string) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{value || '-'}</div>,
  },
  { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', width: 110 },
  { title: 'Đơn vị', dataIndex: 'unitOfMeasurement', key: 'unitOfMeasurement', width: 110 },
  {
    title: 'Thao tác',
    key: 'actions',
    width: 100,
    render: (_: unknown, record: IIngredient) => (
      <Tooltip title="Xem chi tiết sản phẩm">
        <Button 
          type="text"
          icon={<EyeOutlined style={{ color: '#5b4ce8', fontSize: '18px' }} />}
          onClick={() => openProductModal(record.ingredientCode)}
        />
      </Tooltip>
    ),
  },
];

export const getProductColumns = (openProductModal: (code: string) => void) => [
  { title: 'Process', dataIndex: 'processId', key: 'processId', width: 90 },
  { title: 'Product ID', dataIndex: 'productId', key: 'productId', width: 120 },
  { title: 'Code', dataIndex: 'productCode', key: 'productCode', width: 160 },
  {
    title: 'Tên',
    dataIndex: 'itemName',
    key: 'itemName',
    render: (value: string) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{value || '-'}</div>,
  },
  { title: 'Plan Qty', dataIndex: 'planQuantity', key: 'planQuantity', width: 110 },
  { title: 'Đơn vị', dataIndex: 'unitOfMeasurement', key: 'unitOfMeasurement', width: 110 },
  {
    title: 'Thao tác',
    key: 'actions',
    width: 100,
    render: (_: any, record: IProduct) => (
      <Tooltip title="Xem chi tiết sản phẩm">
        <Button 
          type="text"
          icon={<EyeOutlined style={{ color: '#5b4ce8', fontSize: '18px' }} />}
          onClick={() => openProductModal(record.productCode)}
        />
      </Tooltip>
    ),
  },
];

export const getByProductColumns = (openProductModal: (code: string) => void) => [
  { title: 'Process', dataIndex: 'processId', key: 'processId', width: 90 },
  { title: 'ByProduct Code', dataIndex: 'byProductCode', key: 'byProductCode', width: 180 },
  {
    title: 'ByProduct Name',
    dataIndex: 'byProductName',
    key: 'byProductName',
    render: (value: string) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{value || '-'}</div>,
  },
  {
    title: 'Thao tác',
    key: 'actions',
    width: 100,
    render: (_: any, record: IByProduct) => (
      <Tooltip title="Xem chi tiết phụ phẩm">
        <Button 
          type="text"
          icon={<EyeOutlined style={{ color: '#5b4ce8', fontSize: '18px' }} />}
          onClick={() => openProductModal(record.byProductCode)}
        />
      </Tooltip>
    ),
  },
];
