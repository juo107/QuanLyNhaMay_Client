import { EyeOutlined } from '@ant-design/icons';
import { Button, Tag, Tooltip } from 'antd';
import React from 'react';
import type { IBatch } from '../../types/productionOrderTypes';
import Table from '../Table';

interface BatchesTabProps {
  batches: IBatch[];
  loading: boolean;
  onViewMaterials?: (batchCode: string | null) => void;
}

const BatchesTab: React.FC<BatchesTabProps> = ({ batches, loading, onViewMaterials }) => {
  const columns = [
    {
      title: 'Mã Lô (Batch Number)',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      align: 'center' as const,
      width: 250,
      render: (text: string) => {
        if (!text) return <span className="text-red-500 italic">Vật tư không Batch</span>;
        return <span className="text-gray-800">{text}</span>;
      }
    },
    {
      title: 'Số Lượng',
      key: 'quantity',
      align: 'center' as const,
      width: 200,
      render: (_: any, record: IBatch) => (
        <span className="text-gray-800">
          {typeof record.quantity === 'number' ? record.quantity.toLocaleString() : record.quantity} {record.unitOfMeasurement}
        </span>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      width: 150,
      render: (status: number, record: IBatch) => {
        if (record.batchId === -2) return <Tag color="error" className="rounded-full px-4">Đang chạy</Tag>;
        if (status === 0) return <Tag color="warning" className="rounded-full px-4">Đang chờ</Tag>;
        if (status === 1) return <Tag color="blue" className="rounded-full px-4">Đang chạy</Tag>;
        if (status === 2) return <Tag color="success" className="rounded-full px-4">Hoàn thành</Tag>;
        if (status === -1) return <Tag color="error" className="rounded-full px-4">Đã hủy</Tag>;
        return <Tag className="rounded-full px-4">{status}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'Actions',
      align: 'center' as const,
      width: 100,
      render: (_: any, record: IBatch) => (
        <Tooltip title="Xem chi tiết tiêu thụ">
          <Button
            type="text"
            icon={<EyeOutlined className="text-[#5b4ce8]" />}
            onClick={() => onViewMaterials?.(record.batchNumber)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="pt-4">
      <Table
        rowKey="batchId"
        columns={columns}
        data={batches}
        isLoading={loading}
        pageSize={15}
        size="middle"
        bordered
      />
    </div>
  );
};

export default BatchesTab;
