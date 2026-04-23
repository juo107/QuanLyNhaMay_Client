import React from 'react';
import dayjs from 'dayjs';
import { Tag, Descriptions, Typography } from 'antd';
import { formatUnit } from '../../utils/format';
import type { IProductionOrder } from '../../types/productionOrderTypes';
import { useResponsive } from '../../hooks/useResponsive';

const { Text } = Typography;

interface Props {
  selectedOrder: IProductionOrder;
}

const ProductionOrderDetailTable: React.FC<Props> = ({ selectedOrder }) => {
  const { isMobile, isTablet } = useResponsive();
  const currentB = selectedOrder.currentBatch ?? 0;
  const totalB = selectedOrder.totalBatches ?? 0;
  const progress = totalB > 0 ? Math.round((Number(currentB) / totalB) * 100) : 0;
  const isRunning = selectedOrder.status === 1;

  return (
    <div className="production-detail-container">
      <Descriptions
        bordered
        size="small"
        column={isMobile ? 1 : isTablet ? 2 : 4}
        layout={isMobile ? 'vertical' : 'horizontal'}
        styles={{ label: { fontWeight: 'bold' } }}
      >
        <Descriptions.Item label="Mã Lệnh SX" span={isMobile ? 1 : 2}>
          <Text strong className="text-blue-600">{selectedOrder.productionOrderNumber}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Mã Sản Phẩm" span={isMobile ? 1 : 2}>
          <Text strong>{selectedOrder.productCode}</Text> - {selectedOrder.productName}
        </Descriptions.Item>

        <Descriptions.Item label="Lô SX">
          {selectedOrder.lotNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Số Lượng">
          <Text strong>{selectedOrder.quantity?.toLocaleString()}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Đơn Vị">
          {formatUnit(selectedOrder.unitOfMeasurement)}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày Bắt Đầu">
          {selectedOrder.plannedStart ? dayjs(selectedOrder.plannedStart).format('DD/MM/YYYY') : '-'}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày Kết Thúc">
          {selectedOrder.plannedEnd ? dayjs(selectedOrder.plannedEnd).format('DD/MM/YYYY') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Ca Làm">
          {selectedOrder.shift}
        </Descriptions.Item>
        <Descriptions.Item label="Tiến Độ Batch">
          <Text strong className="text-orange-500">{currentB} / {totalB}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Phần Trăm">
          <Text strong>{progress}%</Text>
        </Descriptions.Item>

        <Descriptions.Item label="Trạng Thái">
          <Tag color={isRunning ? 'success' : 'processing'} className="rounded-full px-3">
            {isRunning ? 'Đang chạy' : 'Đang chờ'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Plant">
          {selectedOrder.plant}
        </Descriptions.Item>
        <Descriptions.Item label="Process Area">
          {selectedOrder.processArea}
        </Descriptions.Item>
        <Descriptions.Item label="Shop Floor">
          {selectedOrder.shopfloor || 'WP2'}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default ProductionOrderDetailTable;

