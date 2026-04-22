import React from 'react';
import dayjs from 'dayjs';
import { Tag } from 'antd';
import { formatUnit } from '../../utils/format';
import type { IProductionOrder } from '../../types/productionOrderTypes';

interface Props {
  selectedOrder: IProductionOrder;
}

const ProductionOrderDetailTable: React.FC<Props> = ({ selectedOrder }) => {
  const currentB = selectedOrder.currentBatch ?? 0;
  const totalB = selectedOrder.totalBatches ?? 0;
  const progress = totalB > 0 ? Math.round((Number(currentB) / totalB) * 100) : 0;
  const isRunning = selectedOrder.status === 1;

  return (
    <div className="detail-modal-body">
      <table className="production-detail-table">
        <tbody>
          <tr>
            <td className="label-cell">Mã Lệnh SX</td>
            <td className="value-cell font-bold" colSpan={3}>{selectedOrder.productionOrderNumber}</td>
            <td className="label-cell">Mã Sản Phẩm</td>
            <td className="value-cell" colSpan={3}>
              <span className="font-bold">{selectedOrder.productCode}</span> - {selectedOrder.productName}
            </td>
          </tr>

          <tr>
            <td className="label-cell">Lô SX</td>
            <td className="value-cell" colSpan={1}>{selectedOrder.lotNumber}</td>
            <td className="label-cell">Số Lượng</td>
            <td className="value-cell font-bold" colSpan={1}>{selectedOrder.quantity?.toLocaleString()}</td>
            <td className="label-cell">Đơn Vị</td>
            <td className="value-cell" colSpan={1}>{formatUnit(selectedOrder.unitOfMeasurement)}</td>
            <td className="label-cell font-bold">Ngày Bắt Đầu</td>
            <td className="value-cell" colSpan={1}>
              {selectedOrder.plannedStart ? dayjs(selectedOrder.plannedStart).format('DD/MM/YYYY') : '-'}
            </td>
          </tr>

          <tr>
            <td className="label-cell font-bold">Ngày Kết Thúc</td>
            <td className="value-cell" colSpan={1}>
              {selectedOrder.plannedEnd ? dayjs(selectedOrder.plannedEnd).format('DD/MM/YYYY') : '-'}
            </td>
            <td className="label-cell font-bold">Ca Làm</td>
            <td className="value-cell" colSpan={1}>{selectedOrder.shift}</td>
            <td className="label-cell font-bold">Batch Hiện Tại</td>
            <td className="value-cell" colSpan={1}>
              <span className="font-bold text-center block whitespace-nowrap">{currentB} / {totalB}</span>
            </td>
            <td className="label-cell font-bold text-center">Tiến Độ</td>
            <td className="value-cell" colSpan={1}>
              <div className="flex flex-col items-center justify-center h-full">
                <span className="font-bold text-[14px] whitespace-nowrap">{progress}%</span>
              </div>
            </td>
          </tr>

          <tr>
            <td className="label-cell font-bold">Trạng Thái</td>
            <td className="value-cell" colSpan={1}>
              <Tag color="blue" className="rounded-full px-4 py-0 text-[12px] bg-blue-50 text-blue-600 border-blue-200">
                {isRunning ? 'Đang chạy' : 'Đang chờ'}
              </Tag>
            </td>
            <td className="label-cell font-bold">Plant</td>
            <td className="value-cell" colSpan={1}>{selectedOrder.plant}</td>
            <td className="label-cell font-bold">Process Area</td>
            <td className="value-cell" colSpan={1}>{selectedOrder.processArea}</td>
            <td className="label-cell font-bold">Shop Floor</td>
            <td className="value-cell" colSpan={1}>{selectedOrder.shopfloor || 'WP2'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProductionOrderDetailTable;
