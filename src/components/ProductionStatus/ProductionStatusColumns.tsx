import { ClockCircleOutlined, EyeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Button, Progress, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import type { IProductionOrder } from '../../types/productionOrderTypes';
import { formatUnit } from '../../utils/format';

export const getProductionStatusColumns = (
  navigate: any,
  onShowDetail: (record: IProductionOrder) => void
) => [
    {
      title: 'Mã Lệnh SX',
      dataIndex: 'productionOrderNumber',
      key: 'productionOrderNumber',
      width: 150,
      render: (text: string, record: IProductionOrder) => (
        <span
          className="font-semibold text-[#5b4ce8] cursor-pointer hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            navigate({ to: '/production-status/$id', params: { id: String(record.productionOrderId) }, search: (prev: any) => prev });
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Sản Phẩm',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 150,
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
      ellipsis: true,
      width: 80,
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
      sorter: (a: IProductionOrder, b: IProductionOrder) => dayjs(a.plannedStart).unix() - dayjs(b.plannedStart).unix(),
      render: (_: any, record: IProductionOrder) => (
        <div className="flex flex-col">
          <span className="text-gray-500 text-[12px]">{record.plannedStart ? dayjs(record.plannedStart).format('DD/MM/YYYY') : '-'}</span>
          <span className="text-gray-800 text-[13px] font-bold mt-0.5">{record.quantity?.toLocaleString()} {formatUnit(record.unitOfMeasurement)}</span>
        </div>
      ),
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      align: 'center' as const,
      width: 150,
      sorter: (a: IProductionOrder, b: IProductionOrder) => {
        const aCurrent = (typeof a.currentBatch === 'string' ? parseInt(a.currentBatch) : (a.currentBatch)) ?? -1;
        const bCurrent = (typeof b.currentBatch === 'string' ? parseInt(b.currentBatch) : (b.currentBatch)) ?? -1;
        const aTotalActual = (a.totalBatches || 0) + 1;
        const bTotalActual = (b.totalBatches || 0) + 1;
        const aPercent = aTotalActual > 0 ? ((aCurrent + 1) / aTotalActual) : 0;
        const bPercent = bTotalActual > 0 ? ((bCurrent + 1) / bTotalActual) : 0;
        return aPercent - bPercent;
      },
      render: (_: any, record: IProductionOrder) => {
        const currentRaw = (typeof record.currentBatch === 'string' ? parseInt(record.currentBatch) : (record.currentBatch)) ?? -1;
        const totalCount = record.totalBatches || 0;
        
        // Tính thêm Batch 0 là 1 batch thực thụ
        const actualTotal = totalCount + 1;
        // Chuyển từ index 0 sang số thứ tự 1 (Batch 0 là mẻ thứ 1)
        const currentDisplay = currentRaw >= 0 ? currentRaw + 1 : 0;
        const percent = actualTotal > 0 ? (currentDisplay / actualTotal) * 100 : 0;
        
        return (
          <div className="flex flex-col items-center py-1">
            <Progress
              percent={Math.round(percent)}
              size="small"
              strokeColor="#5b4ce8"
              showInfo={false}
              className="mb-1 !w-[80px]"
            />
            <span className="text-[11px] text-gray-500 font-bold">
              {currentDisplay}/{actualTotal} <span className="font-normal text-gray-400">batches</span>
            </span>
          </div>
        );
      },
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
      width: 100,
      render: (_: any, record: IProductionOrder) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: '#5b4ce8', fontSize: '18px' }} />}
            onClick={(e) => {
              e.stopPropagation();
              onShowDetail(record);
            }}
          />
        </Tooltip>
      ),
    },
  ];
