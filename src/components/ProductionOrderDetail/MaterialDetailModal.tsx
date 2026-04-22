import React, { useMemo } from 'react';
import { Button, Tag, Typography, Descriptions } from 'antd';
import { ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Modal from '../../components/Modal';
import { Table } from '../../components/Table';
import type { IProductionOrder, IBatch, IMaterialConsumption, IGroupedMaterial } from '../../types/productionOrderTypes';
import { calculatePlanQuantity } from '../../helpers/materialsHelper';

const { Text } = Typography;

interface MaterialDetailModalProps {
  // ... (giữ nguyên props)
  isOpen: boolean;
  onClose: () => void;
  order: IProductionOrder;
  batches: IBatch[];
  ingredientsTotals: Record<string, { total: number; unit: string; description: string }>;
  selectedGroup: IGroupedMaterial | null;
  selectedItem: IMaterialConsumption | null;
  setSelectedItem: (item: IMaterialConsumption | null) => void;
}

const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  batches,
  ingredientsTotals,
  selectedGroup,
  selectedItem,
  setSelectedItem,
}) => {
  const selectedRecordRequest = useMemo(() => {
    if (!selectedItem?.request) return '-';
    try {
      return JSON.stringify(JSON.parse(selectedItem.request), null, 2);
    } catch {
      return selectedItem.request;
    }
  }, [selectedItem]);

  const columns = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center' as const,
      render: (id: any) => <span className="font-extrabold text-gray-800 text-[15px]">{id || '-'}</span>
    },
    {
      title: 'Batch',
      dataIndex: 'batchCode',
      key: 'batchCode',
      width: 100,
      render: (t: any) => t ? <Tag color="blue" className="rounded-full px-3 py-0.5 font-bold text-[13px]">{t}</Tag> : <Text type="secondary" italic className="text-[13px]">No Batch</Text>
    },
    {
      title: 'Ingredient Code',
      dataIndex: 'ingredientCode',
      key: 'ingredientCode',
      width: 220,
      render: (code: any) => (
        <div className="whitespace-normal break-words leading-tight">
          <span className="inline-block px-2 py-0.5 bg-gray-50 text-gray-800 border border-gray-100 rounded font-bold text-[13px]">
            {code}
          </span>
        </div>
      )
    },
    {
      title: 'Lot',
      dataIndex: 'lot',
      key: 'lot',
      width: 100,
      render: (l: any) => <span className="text-[14px] font-medium text-gray-700">{l || '-'}</span>
    },
    {
      title: 'Plan Qty',
      key: 'planQty',
      align: 'right' as const,
      width: 130,
      render: (_: any, r: any) => {
        const plan = calculatePlanQuantity(r, batches, parseFloat(order.quantity as any) || 1, order.productQuantity, ingredientsTotals);
        return <Text className="text-[14px] font-bold text-gray-700">{plan > 0 ? plan.toFixed(2) : 'N/A'} {r.unitOfMeasurement}</Text>;
      }
    },
    {
      title: 'Actual Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
      width: 130,
      render: (q: any, r: any) => {
        const val = parseFloat(q as any) || 0;
        return <Text className={`text-[14px] font-bold ${val > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{val > 0 ? val.toFixed(2) : 'N/A'} {r.unitOfMeasurement}</Text>;
      }
    },
    {
      title: 'Datetime',
      dataIndex: 'datetime',
      key: 'datetime',
      width: 140,
      render: (d: any) => (
        <div className="flex flex-col">
          <span className="text-[13px] text-gray-900 font-bold">{d ? dayjs(d).format('DD/MM/YYYY') : '-'}</span>
          <span className="text-[11px] text-gray-600 font-medium">{d ? dayjs(d).format('HH:mm:ss') : ''}</span>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'response',
      key: 'response',
      width: 100,
      align: 'center' as const,
      render: (resp: any) => {
        const isSuccess = resp?.includes('Success');
        return <Tag color={isSuccess ? 'success' : 'error'} className="font-bold px-2 py-0.5 text-[11px] rounded">{isSuccess ? 'SUCCESS' : 'FAILED'}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'view',
      width: 70,
      align: 'center' as const,
      render: (_: any, r: any) => <Button type="text" icon={<EyeOutlined style={{ fontSize: '18px' }} />} onClick={() => setSelectedItem(r)} />
    }
  ], [batches, ingredientsTotals, order.quantity, setSelectedItem]);

  return (
    <Modal
      title="Danh sách Materials"
      isOpen={isOpen}
      onClose={onClose}
      footer={null}
      width={1400}
      centered
    >
      {selectedItem ? (
        // ... (phần chi tiết giữ nguyên)
        <div className="space-y-6">
          {selectedGroup && (
            <Button 
              type="link" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => setSelectedItem(null)} 
              className="p-0 text-[#5b4ce8] font-bold"
            >
              Quay lại danh sách nhóm
            </Button>
          )}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
            <Descriptions 
              bordered 
              column={2} 
              size="middle" 
              labelStyle={{ background: '#f8f9fa', fontWeight: 'bold', width: '200px', fontSize: '14px', color: '#374151' }}
              contentStyle={{ fontSize: '15px', color: '#111827', padding: '12px 24px' }}
            >
              <Descriptions.Item label="Mã Đơn Hàng" span={2}>
                <Text className="text-[#5b4ce8] text-[16px]">{order.productionOrderNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã Batch">
                <Tag color="blue" className="rounded-full px-4 py-1 text-[14px]">{selectedItem.batchCode || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mã NL">
                <Text className="text-gray-800 text-[15px]">{selectedItem.ingredientCode || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số Lô (Lot)">
                <Text className="text-[15px]">{selectedItem.lot || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số Lượng Thực Tế">
                <div className="flex items-center gap-2">
                  <Text className={`text-[18px] ${(parseFloat(selectedItem.quantity as any) || 0) > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                    {(parseFloat(selectedItem.quantity as any) || 0) > 0 ? (parseFloat(selectedItem.quantity as any) || 0).toFixed(2) : 'N/A'}
                  </Text> 
                  <Text className="text-[12px] uppercase font-medium text-gray-500">{selectedItem.unitOfMeasurement}</Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Thời Gian Ghi Nhận">
                <Text className="text-gray-800">
                  {selectedItem.datetime ? dayjs(selectedItem.datetime).format('DD/MM/YYYY HH:mm:ss') : '-'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng Thái">
                {selectedItem.response?.includes('Success') ? 
                  <Tag color="success" className="px-4 py-1 text-[13px] rounded-lg">SUCCESS</Tag> : 
                  <Tag color="error" className="px-4 py-1 text-[13px] rounded-lg">FAILED</Tag>
                }
              </Descriptions.Item>
              <Descriptions.Item label="Thông tin khác" span={2}>
                <div className="flex flex-col text-xs text-gray-500">
                  <span>Máy: {selectedItem.supplyMachine || '-'}</span>
                  <span>Operator ID: {selectedItem.operatorId || '-'}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Request/Response Log" span={2}>
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-[12px] text-gray-700 overflow-auto max-h-[250px] font-mono shadow-inner">
                    <pre className="m-0 whitespace-pre-wrap break-words">{selectedRecordRequest}</pre>
                  </div>
                  <div className={`p-2 rounded text-[11px] border font-mono ${selectedItem.response?.includes('Success') ? 'bg-green-50' : 'bg-red-50'}`}>
                    {selectedItem.response || 'No response message'}
                  </div>
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      ) : selectedGroup && (
        <div className="space-y-4">
          <div className="bg-white p-4 mb-2 flex flex-wrap items-center gap-x-12 gap-y-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Text className="text-gray-900 font-extrabold text-[16px]">Ingredient:</Text>
              <Text className="text-gray-600 font-normal text-[15px]">
                {selectedGroup.ingredientCode} - {ingredientsTotals[selectedGroup.ingredientCode]?.description || ""}
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Text className="text-gray-900 font-extrabold text-[16px]">Lot:</Text>
              <Text className="text-gray-600 font-normal text-[15px]">{selectedGroup.lot || "-"}</Text>
            </div>
            <div className="flex items-center gap-2">
              <Text className="text-gray-900 font-extrabold text-[16px]">Total Actual:</Text>
              <Text className={`font-normal text-[15px] ${(selectedGroup.totalQuantity || 0) > 0 ? 'text-gray-700' : 'text-gray-300'}`}>
                {(selectedGroup.totalQuantity || 0) > 0 ? (selectedGroup.totalQuantity || 0).toFixed(2) : 'N/A'} {selectedGroup.unitOfMeasurement}
              </Text>
            </div>
          </div>
          <Table
            data={selectedGroup.items}
            rowKey={(record: any, index?: number) => `${record.id || 'syn'}-${index}`}
            size="large"
            hidePagination={true}
            scroll={{ y: 500 }}
            columns={columns}
          />
        </div>
      )}
    </Modal>
  );
};

export default MaterialDetailModal;
