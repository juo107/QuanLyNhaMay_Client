import React from 'react';
import { Tag, Typography, Tooltip, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatUnit } from '../../utils/format';
import type { IConsumptionRecord } from '../../types/consumption';

const { Text } = Typography;

export const getConsumptionLogColumns = (showDetail: (record: IConsumptionRecord) => void) => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 70,
  },
  {
    title: 'Mã Lệnh SX',
    dataIndex: 'productionOrderNumber',
    key: 'productionOrderNumber',
    width: 150,
    render: (text: string) => <Text strong>{text || 'NULL'}</Text>,
  },
  {
    title: 'Mã Lô (Batch)',
    dataIndex: 'batchCode',
    key: 'batchCode',
    width: 120,
    render: (text: string) => <span className="text-gray-500 font-medium">{text || 'NULL'}</span>,
  },
  {
    title: 'Số Lượng',
    key: 'quantity',
    width: 100,
    align: 'right' as const,
    render: (_: any, record: IConsumptionRecord) => (
      <Text strong>
        {record.quantity} <span className="text-[11px] text-gray-400 font-normal">{formatUnit(record.unitOfMeasurement)}</span>
      </Text>
    ),
  },
  {
    title: 'Mã Vật Tư',
    dataIndex: 'ingredientCode',
    key: 'ingredientCode',
    width: 200,
    render: (text: string) => (
      <Tooltip title={text}>
        <Text className="block truncate max-w-[180px]">{text}</Text>
      </Tooltip>
    ),
  },
  {
    title: 'Số Lô (Lot)',
    dataIndex: 'lot',
    key: 'lot',
    width: 120,
    render: (text: string) => text || '-',
  },
  {
    title: 'Ca',
    dataIndex: 'shift',
    key: 'shift',
    align: 'center' as const,
    width: 80,
  },
  {
    title: 'Người Vận Hành',
    dataIndex: 'operatorId',
    key: 'operatorId',
    width: 120,
    render: (text: string) => text || '-',
  },
  {
    title: 'Kết Quả',
    dataIndex: 'response',
    key: 'response',
    align: 'center' as const,
    width: 120,
    render: (val: string) => {
      const isSuccess = val?.toLowerCase().includes('success');
      return (
        <Tag icon={isSuccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />} color={isSuccess ? 'success' : 'error'}>
          {isSuccess ? 'Thành công' : 'Thất bại'}
        </Tag>
      );
    },
  },
  {
    title: 'Thời Gian',
    dataIndex: 'datetime',
    key: 'datetime',
    width: 160,
    render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm:ss') : '-',
  },
  {
    title: 'Thao Tác',
    key: 'actions',
    align: 'center' as const,
    width: 80,
    render: (_: any, record: IConsumptionRecord) => (
      <Tooltip title="Xem chi tiết">
        <Button 
          type="text" 
          icon={<EyeOutlined style={{ color: '#5b4ce8', fontSize: '18px' }} />} 
          onClick={() => showDetail(record)} 
        />
      </Tooltip>
    ),
  },
];
