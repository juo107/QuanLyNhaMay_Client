import React from 'react';
import { Tag, Typography, Tooltip, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatVersionDisplay } from '../../helpers/recipeHelper';
import type { IRecipe } from '../../types/recipeTypes';
import type { FilterItem } from '../FilterSearchBar';

const { Text } = Typography;

export const getRecipeFilters = (): FilterItem[] => [
  {
    type: 'search',
    key: 'search',
    placeholder: 'Tìm mã công thức, tên sản phẩm...',
    width: 300,
  },
  {
    type: 'checkboxSelect',
    key: 'statuses',
    placeholder: 'Trạng thái',
    minWidth: 160,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
];

export const getRecipeColumns = (openDetailDrawer: (record: IRecipe) => void) => [
  {
    title: 'ID',
    dataIndex: 'recipeDetailsId',
    key: 'recipeDetailsId',
    width: 100,
    align: 'center' as const,
    render: (id: any, record: any) => 
      record.isGroup ? <Tag color="purple">{record.versionsCount} items</Tag> : id,
  },
  {
    title: 'Mã Sản Phẩm',
    dataIndex: 'productCode',
    key: 'productCode',
    width: 150,
    sorter: (a: IRecipe, b: IRecipe) => (a.productCode || '').localeCompare(b.productCode || ''),
    render: (text: string) => <Text strong>{text || '-'}</Text>,
  },
  {
    title: 'Tên Sản Phẩm',
    dataIndex: 'productName',
    key: 'productName',
    width: 300,
    render: (text: string) => <span className="whitespace-normal leading-relaxed">{text || '-'}</span>,
  },
  {
    title: 'Mã Công Thức',
    dataIndex: 'recipeCode',
    key: 'recipeCode',
    width: 180,
    sorter: (a: IRecipe, b: IRecipe) => (a.recipeCode || '').localeCompare(b.recipeCode || ''),
    render: (text: string) => <Text strong className="text-blue-600">{text || '-'}</Text>,
  },
  {
    title: 'Tên Công Thức',
    dataIndex: 'recipeName',
    key: 'recipeName',
    width: 320,
    render: (text: string) => <span className="whitespace-normal leading-relaxed">{text || '-'}</span>,
  },
  {
    title: 'Phiên Bản',
    dataIndex: 'version',
    key: 'version',
    width: 110,
    align: 'center' as const,
    render: (version: string, record: any) => (
      <span className={`font-medium ${record.isGroup ? 'text-purple-600' : 'text-gray-700'}`}>
        {formatVersionDisplay(version)}
      </span>
    ),
  },
  {
    title: 'Trạng Thái',
    dataIndex: 'recipeStatus',
    key: 'recipeStatus',
    width: 120,
    align: 'center' as const,
    render: (status: string) => {
      const isActive = status === 'Active';
      return (
        <Tag color={isActive ? 'success' : 'error'} className="rounded-full px-4">
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      );
    },
  },
  {
    title: 'Cập Nhật',
    dataIndex: 'timestamp',
    key: 'timestamp',
    width: 170,
    render: (ts: string) => ts ? dayjs(ts).format('DD/MM/YYYY HH:mm:ss') : '-',
  },
  {
    title: 'Thao Tác',
    key: 'actions',
    width: 90,
    align: 'center' as const,
    render: (_: unknown, record: IRecipe) => (
      <Tooltip title={record.isGroup ? "Xem các phiên bản" : "Xem chi tiết"}>
        <Button
          type="text"
          icon={<EyeOutlined style={{ color: record.isGroup ? '#722ed1' : '#5b4ce8', fontSize: '18px' }} />}
          onClick={() => openDetailDrawer(record)}
        />
      </Tooltip>
    ),
  },
];
