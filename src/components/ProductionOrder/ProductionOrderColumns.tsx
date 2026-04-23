import { ClockCircleOutlined, EyeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';
import dayjs from 'dayjs';
import type { IProductionOrder } from '../../types/productionOrderTypes';
import { formatUnit } from '../../utils/format';

export const getProductionOrderColumns = (showDetail: (record: IProductionOrder) => void) => [
  {
    title: 'Mã Lệnh SX',
    dataIndex: 'productionOrderNumber',
    key: 'productionOrderNumber',
    width: 150,
    sorter: (a: IProductionOrder, b: IProductionOrder) => a.productionOrderNumber.localeCompare(b.productionOrderNumber),
    render: (text: string) => <span className="font-semibold text-gray-700">{text}</span>,
  },
  {
    title: 'Sản Phẩm',
    dataIndex: 'productCode',
    key: 'productCode',
    width: 150,
    sorter: (a: IProductionOrder, b: IProductionOrder) => a.productCode.localeCompare(b.productCode),
    render: (text: string, record: any) => {
      const pName = record.productName || record.ProductName || record.itemName || record.ItemName || record.productDescription || record.ProductDescription;
      return (
        <div className="py-1 whitespace-normal break-words min-w-[180px]">
          <span className="text-gray-800 text-[13px] font-medium">{text}</span>
          {pName && (
            <span className="text-gray-600 text-[12px] font-medium ml-1">
              - {pName}
            </span>
          )}
        </div>
      );
    },
  },
  {
    title: 'Dây Chuyền',
    dataIndex: 'productionLine',
    key: 'productionLine',
    align: 'center' as const,
    width: 50,
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
    width: 70,
    render: (text: string) => <span className="font-medium text-gray-700 text-[12px]">{text}</span>,
  },
  {
    title: 'Process Area',
    dataIndex: 'processArea',
    key: 'processArea',
    ellipsis: true,
    width: 60,
    align: 'center' as const,
  },
  {
    title: 'Ca',
    dataIndex: 'shift',
    key: 'shift',
    ellipsis: true,
    width: 50,
  },
  {
    title: 'Ngày BĐ / SL',
    key: 'dateQty',
    width: 60,
    sorter: (a: IProductionOrder, b: IProductionOrder) => {
      const dateA = a.plannedStart ? dayjs(a.plannedStart).unix() : 0;
      const dateB = b.plannedStart ? dayjs(b.plannedStart).unix() : 0;
      return dateA - dateB;
    },
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
