import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import { productionOrderApi } from '../api/productionOrderApi';
import type { IBatch } from '../types/productionOrderTypes';

export const useProductionOrderDetail = (id: string | undefined) => {
  const search = useSearch({ from: '/production-status/$id' });
  const navigate = useNavigate({ from: '/production-status/$id' });

  const activeTab = search.tab;
  const batchFilter = search.batchFilter;

  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);

  // Lấy chi tiết thông tin Lệnh Sản Xuất dựa trên ID từ URL
  const { data: order, isLoading: loading, refetch: fetchOrderInfo } = useQuery({
    queryKey: ['productionOrder', id],
    queryFn: async () => {
      if (!id) return null;
      const parsedId = parseInt(id, 10);
      const res: any = await productionOrderApi.getDetail(parsedId);
      return res?.data ?? res;
    },
    enabled: !!id,
  });

  // Lấy danh sách các mẻ sản xuất (kế hoạch và thực tế) và gộp dữ liệu
  const { data: batches = [], isLoading: batchLoading, refetch: fetchBatches } = useQuery({
    queryKey: ['productionOrderBatches', id, order?.productionOrderNumber],
    queryFn: async () => {
      if (!id || !order?.productionOrderNumber) return [];
      const parsedId = parseInt(id, 10);

      const [resBatches, actualRes]: any[] = await Promise.all([
        productionOrderApi.getBatches(parsedId),
        productionOrderApi.getBatchCodesWithMaterials(order.productionOrderNumber)
      ]);

      const rawPlanned = resBatches?.items ?? resBatches?.Items ?? resBatches?.data?.items ?? resBatches?.data?.Items ?? (Array.isArray(resBatches?.data) ? resBatches.data : (Array.isArray(resBatches) ? resBatches : []));
      const plannedBatches: IBatch[] = Array.isArray(rawPlanned) ? rawPlanned.map((b: any) => ({
        batchId: b.batchId ?? b.BatchId,
        productionOrderId: b.productionOrderId ?? b.ProductionOrderId,
        batchNumber: b.batchNumber ?? b.BatchNumber,
        quantity: b.quantity ?? b.Quantity,
        unitOfMeasurement: b.unitOfMeasurement ?? b.UnitOfMeasurement,
        status: b.status ?? b.Status
      })) : [];

      const actualItems = actualRes?.items ?? actualRes?.Items ?? actualRes?.data?.items ?? actualRes?.data?.Items ?? (Array.isArray(actualRes?.data) ? actualRes.data : (Array.isArray(actualRes) ? actualRes : []));
      const actualCodes: (string | null)[] = actualItems.map((b: any) => (b.batchCode || b.BatchCode));

      const mergedMap = new Map<string | null, IBatch>();
      plannedBatches.forEach(b => {
        const key = b.batchNumber ? b.batchNumber.trim().toUpperCase() : null;
        
        // Nếu lô kế hoạch này đã có trong danh sách thực tế (actualCodes), 
        // cập nhật trạng thái thành Hoàn thành (2)
        if (key && actualCodes.some(code => (code || "").trim().toUpperCase() === key)) {
          b.status = 2; 
        }
        
        mergedMap.set(key, b);
      });

      let virtualIdCounter = -10;
      actualCodes.forEach(code => {
        const normalizedCode = (code || "").trim().toUpperCase();
        if (normalizedCode && !mergedMap.has(normalizedCode)) {
          mergedMap.set(normalizedCode, {
            batchId: virtualIdCounter--,
            batchNumber: normalizedCode,
            quantity: 0,
            unitOfMeasurement: '',
            status: 2 // Các lô phát sinh thực tế cũng để là Hoàn thành
          } as IBatch);
        } else if (code === null || normalizedCode === "") {
          if (!mergedMap.has(null)) {
            mergedMap.set(null, {
              batchId: -2,
              batchNumber: null as any,
              quantity: 0,
              unitOfMeasurement: '',
              status: 2 // Có tiêu thụ không lô thì coi như Hoàn thành/Đã chạy
            } as IBatch);
          }
        }
      });
      return Array.from(mergedMap.values());
    },
    enabled: !!id && !!order?.productionOrderNumber && (activeTab === 'batches' || activeTab === 'materials'),
  });

  // Chuyển đổi tab hiển thị và đồng bộ lên URL
  const setActiveTab = useCallback((tab: string) => {
    navigate({
      search: (prev: any) => ({ ...prev, tab: tab as any }),
    });
  }, [navigate]);

  // Thiết lập bộ lọc theo mã mẻ (Batch) và đồng bộ lên URL
  const setBatchFilter = useCallback((filter: string | null) => {
    navigate({
      search: (prev: any) => ({ ...prev, batchFilter: filter === null ? undefined : filter }),
    });
  }, [navigate]);

  return {
    loading,
    batchLoading,
    order,
    batches,
    activeTab,
    setActiveTab,
    isHeaderExpanded,
    setIsHeaderExpanded,
    batchFilter,
    setBatchFilter,
    fetchOrderInfo,
    fetchBatches
  };
};
