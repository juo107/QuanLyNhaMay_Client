import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { productionOrderApi } from '../api/productionOrderApi';
import {
  filterMaterialsByConsumption,
  groupMaterialsLogic,
  normalizeMaterialConsumption
} from '../helpers/materialsHelper';
import type { IBatch, IProductionOrder } from '../types/productionOrderTypes';

export const useMaterialsData = (
  order: IProductionOrder,
  batches: IBatch[],
  batchFilter?: string | null,
  onChangeBatchFilter?: (code: string | null) => void
) => {
  // Internal UI states for inputs
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [lotSearch, setLotSearch] = useState('');

  // Search states that trigger re-filtering
  const [activeIngredientSearch, setActiveIngredientSearch] = useState('');
  const [activeLotSearch, setActiveLotSearch] = useState('');

  // Filter type
  const [filterType, setFilterType] = useState<'all' | 'consumed' | 'unconsumed'>('all');

  // Tải dữ liệu định mức (Ingredients) và tiêu thụ thực tế từ API
  const { data, isLoading: loading, refetch: fetchData } = useQuery({
    queryKey: ['productionOrderMaterials', order.productionOrderNumber, batches.map(b => b.batchNumber)],
    queryFn: async () => {
      if (!batches || batches.length === 0) return { allMaterials: [], ingredientsTotals: {} };

      const batchNumbers = batches.map(b => b.batchNumber).filter(Boolean);
      const [ingRes, dataRes, excludeRes]: any[] = await Promise.all([
        productionOrderApi.getIngredients(order.productionOrderNumber),
        productionOrderApi.getMaterialConsumptions(order.productionOrderNumber, batchNumbers, 1, 9999),
        productionOrderApi.getMaterialConsumptionsExclude(order.productionOrderNumber, batchNumbers.map(b => ({ batchCode: b })), 1, 9999)
      ]);

      // Process Ingredients Totals
      const totals: Record<string, { total: number; unit: string; description: string }> = {};
      const ingredients = ingRes?.data?.data ??
        ingRes?.data ??
        ingRes?.items ??
        ingRes?.Items ??
        ingRes?.data?.items ??
        ingRes?.data?.Items ??
        (Array.isArray(ingRes?.data) ? ingRes.data : (Array.isArray(ingRes) ? ingRes : []));

      if (ingredients) {
        ingredients.forEach((item: any) => {
          const code = (item.ingredientCode || item.IngredientCode || "").toString().trim();
          if (!code) return;

          const qty = parseFloat(item.quantity || item.Quantity || 0);
          const unit = (item.unitOfMeasurement || item.UnitOfMeasurement || "");

          if (!totals[code]) {
            totals[code] = {
              total: 0,
              unit: unit,
              description: (item.itemName || item.ItemName || "")
            };
          }
          totals[code].total += isNaN(qty) ? 0 : qty;
        });
      }

      // Process Consumptions
      const extractItems = (res: any) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.items)) return res.items;
        if (Array.isArray(res.Items)) return res.Items;
        if (res.data && Array.isArray(res.data.items)) return res.data.items;
        if (res.data && Array.isArray(res.data.Items)) return res.data.Items;
        return [];
      };

      const rawConsumptions: any[] = [
        ...extractItems(dataRes),
        ...extractItems(excludeRes)
      ];

      const uniqueConsumptions: any[] = [];
      const seenIds = new Set();

      rawConsumptions.forEach(m => {
        if (m.id) {
          if (!seenIds.has(m.id)) {
            seenIds.add(m.id);
            uniqueConsumptions.push(m);
          }
        } else {
          // Quy tắc đặc biệt cho Mẻ 0: Chỉ lấy nếu có dữ liệu thực tế (có ID). Nếu không có ID thì bỏ qua dòng chờ của mẻ 0.
          const bCode = (m.batchCode || "").toString().trim();
          if (bCode === "0") return;

          // Lọc trùng dòng Kế hoạch (ID null) dựa trên Mẻ + Mã vật tư
          const planKey = `plan-${bCode}-${(m.ingredientCode || "").toString().trim()}`;
          if (!seenIds.has(planKey)) {
            seenIds.add(planKey);
            uniqueConsumptions.push(m);
          }
        }
      });

      const actualConsumptions = normalizeMaterialConsumption(uniqueConsumptions, totals);

      const combined = actualConsumptions.sort((a, b) => {
        // 1. Ưu tiên các dòng chưa có ID (dòng kế hoạch) lên đầu
        if (!a.id && b.id) return -1;
        if (a.id && !b.id) return 1;

        // 2. Sắp xếp theo Số mẻ (Batch Code)
        const batchA = a.batchCode || '';
        const batchB = b.batchCode || '';
        return batchA.localeCompare(batchB, undefined, { numeric: true, sensitivity: 'base' });
      });

      return {
        allMaterials: combined,
        ingredientsTotals: totals
      };
    },
    enabled: !!order.productionOrderNumber && batches.length > 0,
  });

  const allMaterials = data?.allMaterials || [];
  const ingredientsTotals = data?.ingredientsTotals || {};

  // Thực hiện lọc dữ liệu thô theo Batch, mã nguyên liệu và số lô (Lot)
  const filteredMaterials = useMemo(() => {
    let result = allMaterials;

    // Filter by Batch
    if (batchFilter !== undefined && batchFilter !== null) {
      result = result.filter(m => {
        const bCode = (m.batchCode || "").trim().toUpperCase();
        const fCode = (batchFilter || "").trim().toUpperCase();
        return bCode === fCode;
      });
    }

    // Filter by Ingredient Search
    if (activeIngredientSearch) {
      result = result.filter(item => item.ingredientCode?.toLowerCase().includes(activeIngredientSearch.toLowerCase()));
    }

    // Filter by Lot Search
    if (activeLotSearch) {
      result = result.filter(item => item.lot?.toLowerCase().includes(activeLotSearch.toLowerCase()));
    }

    return result;
  }, [allMaterials, batchFilter, activeIngredientSearch, activeLotSearch]);

  // Gộp nhóm dữ liệu đã lọc và áp dụng bộ lọc trạng thái tiêu thụ (consumed/unconsumed)
  const filteredData = useMemo(() => {
    const orderQty = parseFloat(order.quantity as any) || 1;
    const grouped = groupMaterialsLogic(
      filteredMaterials,
      orderQty,
      order.productQuantity,
      batches,
      ingredientsTotals
    );

    return filterMaterialsByConsumption(grouped, filterType);
  }, [filteredMaterials, filterType, order.quantity, order.productQuantity, batches, ingredientsTotals]);

  // Hàm thay đổi filter batch, gọi callback từ Component cha (nếu có)
  const setSelectedBatchCode = (code: string | null) => {
    if (onChangeBatchFilter) {
      onChangeBatchFilter(code);
    }
  };

  return {
    loading,
    allMaterials,
    ingredientsTotals,
    filteredData,
    activeIngredientSearch,
    setActiveIngredientSearch,
    activeLotSearch,
    setActiveLotSearch,
    filterType,
    setFilterType,
    ingredientSearch,
    setIngredientSearch,
    lotSearch,
    setLotSearch,
    fetchData,
    setSelectedBatchCode,
    selectedBatchCode: batchFilter
  };
};
