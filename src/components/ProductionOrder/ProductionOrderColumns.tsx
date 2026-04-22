import React from 'react';
import { Tag, Button } from 'antd';
import { PlayCircleOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatUnit } from '../../utils/format';
import type { IProductionOrder } from '../../types/productionOrderTypes';

export const getProductionOrderColumns = (showDetail: (record: IProductionOrder) => void) => [
  {
    title: 'Mã Lệnh SX',
    dataIndex: 'productionOrderNumber',
    key: 'productionOrderNumber',
    width: 150,
    render: (text: string) => <span className="font-semibold text-gray-700">{text}</span>,
  },
  {
    title: 'Sản Phẩm',
    dataIndex: 'productCode',
    key: 'productCode',
    width: 150,
    render: (text: string, record: IProductionOrder) => (
      <div className="flex flex-col">
        <span className="font-bold text-gray-800 text-[13px]">{text}</span>
        <span className="text-gray-400 text-[11px] font-normal truncate max-w-[150px]">{record.productName}</span>
      </div>
    ),
  },
  {
    title: 'Dây Chuyền',
    dataIndex: 'productionLine',
    key: 'productionLine',
    align: 'center' as const,
    width: 100,
    render: (text: string) => (
      <Tag color="processing" className="rounded-full px-3 py-0.5 border-none bg-blue-500 text-white font-medium">
        {text}
      </Tag>
    ),
  },
  {
    title: 'Công Thức',
    dataIndex: 'recipeCode',
    key: 'recipeCode',
    width: 150,
    render: (text: string) => <span className="font-medium text-gray-700 text-[12px]">{text}</span>,
  },
  {
    title: 'Process Area',
    dataIndex: 'processArea',
    key: 'processArea',
    width: 140,
    align: 'center' as const,
  },
  {
    title: 'Ca',
    dataIndex: 'shift',
    key: 'shift',
    width: 80,
  },
  {
    title: 'Ngày BĐ / SL',
    key: 'dateQty',
    width: 140,
    render: (_: any, record: IProductionOrder) => (
      <div className="flex flex-col">
        <span className="text-gray-500 text-[12px]">{record.plannedStart ? dayjs(record.plannedStart).format('DD/MM/YYYY') : '-'}</span>
        <span className="text-gray-800 text-[13px] font-bold mt-0.5">{record.quantity?.toLocaleString()} {formatUnit(record.unitOfMeasurement)}</span>
      </div>
    ),
  },
  {
    title: 'Trạng Thái',
    dataIndex: 'status',
    key: 'status',
    align: 'center' as const,
    width: 130,
    render: (status: number) => {
      const isRunning = status === 1;
      return (
        <Tag
          icon={isRunning ? <PlayCircleOutlined /> : <ClockCircleOutlined />}
          color={isRunning ? 'orange' : 'blue'}
          className="m-0 border-none px-3 py-1 flex items-center justify-center gap-1 rounded-full text-white font-medium shadow-sm cursor-default min-w-[110px]"
        >
          {isRunning ? 'Đang chạy' : 'Đang chờ'}
        </Tag>
      );
    },
  },
  {
    title: 'Thao Tác',
    key: 'actions',
    align: 'center' as const,
    width: 80,
    render: (_: any, record: IProductionOrder) => (
      <Button
        type="text"
        icon={<EyeOutlined style={{ color: '#5b4ce8', fontSize: '18px' }} />}
        onClick={(e) => {
          e.stopPropagation();
          showDetail(record);
        }}
      />
    ),
  },
];
