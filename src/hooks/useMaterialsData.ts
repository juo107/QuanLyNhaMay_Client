import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { productionOrderApi } from '../api/productionOrderApi';
import {
  filterMaterialsByConsumption,
  generateSynthesizedRows,
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
      const ingredients = ingRes?.data?.data ?? ingRes?.items ?? ingRes?.Items ?? ingRes?.data?.items ?? ingRes?.data?.Items ?? (Array.isArray(ingRes?.data) ? ingRes.data : (Array.isArray(ingRes) ? ingRes : []));

      if (ingredients) {
        const seenIngredientLines = new Set<string>();
        ingredients.forEach((item: any) => {
          const code = (item.ingredientCode || item.IngredientCode || "").toString().trim();
          if (!code) return;

          const qty = parseFloat(item.quantity || item.Quantity || 0);
          const unit = (item.unitOfMeasurement || item.UnitOfMeasurement || "");

          const lineKey = `${code}-${qty}-${unit}`;
          if (seenIngredientLines.has(lineKey)) return;
          seenIngredientLines.add(lineKey);

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
      const rawConsumptions: any[] = [
        ...(dataRes?.items ?? dataRes?.Items ?? dataRes?.data?.items ?? dataRes?.data?.Items ?? (Array.isArray(dataRes) ? dataRes : [])),
        ...(excludeRes?.items ?? excludeRes?.Items ?? excludeRes?.data?.items ?? excludeRes?.data?.Items ?? (Array.isArray(excludeRes) ? excludeRes : []))
      ];

      const uniqueConsumptions: any[] = [];
      const seenKeys = new Set();

      rawConsumptions.forEach(m => {
        const compositeKey = `${m.id}-${(m.batchCode || "").toString().trim().toUpperCase()}-${(m.ingredientCode || "").toString().trim().toUpperCase()}-${(m.lot || "").toString().trim().toUpperCase()}`;
        if (!seenKeys.has(compositeKey)) {
          seenKeys.add(compositeKey);
          uniqueConsumptions.push(m);
        }
      });

      const actualConsumptions = normalizeMaterialConsumption(uniqueConsumptions, totals);
      const synthesizedRows = generateSynthesizedRows(batches, totals, actualConsumptions);

      const combined = [...actualConsumptions, ...synthesizedRows].sort((a, b) => {
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
