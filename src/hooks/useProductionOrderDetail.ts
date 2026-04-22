import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { productionOrderApi } from '../api/productionOrderApi';
import type { IProductionOrder, IBatch } from '../types/productionOrderTypes';

export const useProductionOrderDetail = (id: string | undefined) => {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<IProductionOrder | null>(null);
  const [batches, setBatches] = useState<IBatch[]>([]);
  const [activeTab, setActiveTab] = useState('batches');
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [batchFilter, setBatchFilter] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const parsedId = parseInt(id, 10);
      
      const resDetail: any = await productionOrderApi.getDetail(parsedId);
      const orderData = resDetail?.data ?? resDetail;
      if (orderData) {
        setOrder(orderData);
      }

      // Fetch planned batches
      const resBatches: any = await productionOrderApi.getBatches(parsedId);
      const rawPlanned = resBatches?.items ?? resBatches?.Items ?? resBatches?.data?.items ?? resBatches?.data?.Items ?? (Array.isArray(resBatches?.data) ? resBatches.data : (Array.isArray(resBatches) ? resBatches : []));
      
      const plannedBatches: IBatch[] = Array.isArray(rawPlanned) ? rawPlanned.map((b: any) => ({
        batchId: b.batchId ?? b.BatchId,
        productionOrderId: b.productionOrderId ?? b.ProductionOrderId,
        batchNumber: b.batchNumber ?? b.BatchNumber,
        quantity: b.quantity ?? b.Quantity,
        unitOfMeasurement: b.unitOfMeasurement ?? b.UnitOfMeasurement,
        status: b.status ?? b.Status
      })) : [];

      // Fetch actual batch codes (including those without planned lot)
      if (orderData?.productionOrderNumber) {
        try {
          const actualRes: any = await productionOrderApi.getBatchCodesWithMaterials(orderData.productionOrderNumber);
          const actualItems = actualRes?.items ?? actualRes?.Items ?? actualRes?.data?.items ?? actualRes?.data?.Items ?? (Array.isArray(actualRes?.data) ? actualRes.data : (Array.isArray(actualRes) ? actualRes : []));
          const actualCodes: (string | null)[] = actualItems.map((b: any) => (b.batchCode || b.BatchCode));

          // Merge actual batches into the list
          const mergedMap = new Map<string | null, IBatch>();
          
          // Start with planned
          plannedBatches.forEach(b => {
             const key = b.batchNumber ? b.batchNumber.trim().toUpperCase() : null;
             mergedMap.set(key, b);
          });

          // Add actual batches that aren't in planned
          let virtualIdCounter = -10;
          actualCodes.forEach(code => {
             const normalizedCode = (code || "").trim().toUpperCase();
             if (normalizedCode && !mergedMap.has(normalizedCode)) {
               mergedMap.set(normalizedCode, {
                 batchId: virtualIdCounter--, // Unique Virtual ID
                 batchNumber: normalizedCode,
                 quantity: 0,
                 unitOfMeasurement: '',
                 status: 1 
               } as IBatch);
             } else if (code === null || normalizedCode === "") {
                // Handle "No Batch" case
                if (!mergedMap.has(null)) {
                  mergedMap.set(null, {
                    batchId: -2, // Virtual ID for No Batch
                    batchNumber: null as any,
                    quantity: 0,
                    unitOfMeasurement: '',
                    status: 1
                  } as IBatch);
                }
             }
          });

          setBatches(Array.from(mergedMap.values()));
        } catch (e) {
          console.error("Error fetching actual batches:", e);
          setBatches(plannedBatches);
        }
      } else {
        setBatches(plannedBatches);
      }
    } catch {
      message.error('Không thể tải chi tiết Lệnh Sản Xuất');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchDetail();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [fetchDetail]);

  return {
    loading,
    order,
    batches,
    activeTab,
    setActiveTab,
    isHeaderExpanded,
    setIsHeaderExpanded,
    batchFilter,
    setBatchFilter,
    fetchDetail
  };
};
