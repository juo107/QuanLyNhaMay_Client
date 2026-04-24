import { Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import type { IMESCompleteBatch } from '../../api/mesCompleteBatchApi';

const { Text } = Typography;

export const getMESCompleteBatchColumns = () => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 60,
    align: 'center' as const,
    fixed: 'left' as const,
  },
  {
    title: 'Lệnh Sản Xuất',
    dataIndex: 'productionOrder',
    key: 'productionOrder',
    width: 80,
    ellipsis: true,
    fixed: 'left' as const,
    render: (text: string) => (
      <Text className="font-bold text-[#5b4ce8] text-[12px]">{text || 'N/A'}</Text>
    ),
  },
  {
    title: 'Số Lô',
    dataIndex: 'batchNumber',
    key: 'batchNumber',
    width: 85,
    align: 'center' as const,
    ellipsis: true,
    render: (text: string) => <span className="text-[12px] text-gray-600">{text || 'N/A'}</span>,
  },
  {
    title: 'Sản Phẩm',
    key: 'product',
    ellipsis: true,
    render: (_: any, record: IMESCompleteBatch) => (
      <div className="flex flex-col">
        <Text className="text-[15px] line-clamp-1">{record.productName || 'N/A'}</Text>
        <Text type="secondary" className="text-[11px]">{record.productCode || 'N/A'}</Text>
      </div>
    ),
  },
  {
    title: 'Mã Máy',
    dataIndex: 'machineCode',
    key: 'machineCode',
    width: 90,
    align: 'center' as const,
    ellipsis: true,
    render: (text: string) => <span className="text-[12px]">{text || 'N/A'}</span>,
  },
  {
    title: 'Số Lượng',
    key: 'size',
    width: 110,
    align: 'right' as const,
    render: (_: any, record: IMESCompleteBatch) => (
      <Text strong className="text-[13px]">{record.batchSize} {record.batchUOM}</Text>
    ),
  },
  {
    title: 'Trạng Thái',
    dataIndex: 'transferStatus',
    key: 'transferStatus',
    width: 110,
    align: 'center' as const,
    render: (status: string) => {
      const lowerStatus = (status || '').toLowerCase();
      switch (lowerStatus) {
        case 'success':
        case 'sent':
          return <Tag color="success" className="rounded-full px-2 text-[10px] m-0">{status}</Tag>;
        case 'pending':
        case 'waiting':
          return <Tag color="warning" className="rounded-full px-2 text-[10px] m-0">{status}</Tag>;
        case 'error':
        case 'failed':
          return <Tag color="error" className="rounded-full px-2 text-[10px] m-0">{status}</Tag>;
        default:
          return <Tag className="rounded-full px-2 text-[10px] m-0">{status || 'N/A'}</Tag>;
      }
    },
  },
  {
    title: 'Ngày Tạo',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 120,
    render: (date: string) => (
      <Text type="secondary" className="text-[11px]">
        {dayjs(date).format('DD/MM HH:mm')}
      </Text>
    ),
  },
];
