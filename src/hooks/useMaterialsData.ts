import { useState, useCallback, useEffect, useMemo } from 'react';
import { message } from 'antd';
import { productionOrderApi } from '../api/productionOrderApi';
import type { IMaterialConsumption, IBatch, IProductionOrder, IGroupedMaterial } from '../types/productionOrderTypes';
import { 
  normalizeMaterialConsumption, 
  generateSynthesizedRows, 
  groupMaterialsLogic,
  filterMaterialsByConsumption
} from '../helpers/materialsHelper';

// Hook quản lý dữ liệu tiêu thụ: tải API, gộp nhóm và lọc dữ liệu hiển thị
export const useMaterialsData = (
  order: IProductionOrder, 
  batches: IBatch[], 
  batchFilter?: string | null, 
  onClearFilter?: () => void
) => {
  const [allMaterials, setAllMaterials] = useState<IMaterialConsumption[]>([]);
  const [loading, setLoading] = useState(false);
  const [ingredientsTotals, setIngredientsTotals] = useState<Record<string, { total: number; unit: string; description: string }>>({});
  
  const [selectedBatchCode, setSelectedBatchCode] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'consumed' | 'unconsumed'>('all');
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [lotSearch, setLotSearch] = useState('');
  const [activeIngredientSearch, setActiveIngredientSearch] = useState('');
  const [activeLotSearch, setActiveLotSearch] = useState('');

  // Tải dữ liệu định mức và tiêu thụ từ hệ thống
  const fetchData = useCallback(async () => {
    if (!batches || batches.length === 0) return;
    setLoading(true);
    try {
      const ingRes: any = await productionOrderApi.getIngredients(order.productionOrderNumber);
      const totals: Record<string, { total: number; unit: string; description: string }> = {};
      const ingredients = ingRes?.data?.data ?? ingRes?.items ?? ingRes?.Items ?? ingRes?.data?.items ?? ingRes?.data?.Items ?? (Array.isArray(ingRes?.data) ? ingRes.data : (Array.isArray(ingRes) ? ingRes : []));
      
      if (ingredients) {
        const seenIngredientLines = new Set<string>();
        ingredients.forEach((item: any) => {
          const code = (item.ingredientCode || item.IngredientCode || "").toString().trim();
          if (!code) return; 
          
          const qty = parseFloat(item.quantity || item.Quantity || 0);
          const unit = (item.unitOfMeasurement || item.UnitOfMeasurement || "");
          
          // Loại bỏ các dòng nguyên liệu trùng lặp từ kết quả trả về
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
        setIngredientsTotals(totals);
      }

      // Tải dữ liệu tiêu thụ thực tế cho các lô sản xuất và các mục ngoài lô
      const batchNumbers = (batches || []).map(b => b.batchNumber).filter(Boolean);
      const [dataRes, excludeRes]: any[] = await Promise.all([
        productionOrderApi.getMaterialConsumptions(order.productionOrderNumber, batchNumbers, 1, 9999),
        productionOrderApi.getMaterialConsumptionsExclude(order.productionOrderNumber, batchNumbers.map(b => ({ batchCode: b })), 1, 9999)
      ]);
      
      const rawConsumptions: any[] = [
        ...(dataRes?.items ?? dataRes?.Items ?? dataRes?.data?.items ?? dataRes?.data?.Items ?? (Array.isArray(dataRes) ? dataRes : [])),
        ...(excludeRes?.items ?? excludeRes?.Items ?? excludeRes?.data?.items ?? excludeRes?.data?.Items ?? (Array.isArray(excludeRes) ? excludeRes : []))
      ];

      // Loại bỏ trùng lặp bằng mã khóa tổng hợp (ID, Lô, Nguyên liệu)
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

      setAllMaterials(combined);
    } catch (e) {
      console.error(e);
      message.error('Lỗi tải dữ liệu nguyên vật liệu');
    } finally {
      setLoading(false);
    }
  }, [order.productionOrderNumber, JSON.stringify(batches.map(b => b.batchNumber))]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (batchFilter !== null) {
      setSelectedBatchCode(batchFilter);
      onClearFilter?.();
    }
  }, [batchFilter, onClearFilter]);

  // Xử lý lọc và gộp nhóm dữ liệu cho bảng hiển thị
  const filteredData = useMemo(() => {
    let filtered = allMaterials;
    if (selectedBatchCode !== null) {
      const selectedNormalized = selectedBatchCode.trim().toUpperCase();
      filtered = filtered.filter(item => {
        if (selectedNormalized === "") return !item.batchCode || item.batchCode.trim() === "";
        return (item.batchCode || '').trim().toUpperCase() === selectedNormalized;
      });
    }
    if (activeIngredientSearch) filtered = filtered.filter(item => item.ingredientCode?.toLowerCase().includes(activeIngredientSearch.toLowerCase()));
    if (activeLotSearch) filtered = filtered.filter(item => item.lot?.toLowerCase().includes(activeLotSearch.toLowerCase()));

    let grouped = groupMaterialsLogic(filtered, parseFloat(order.quantity as any) || 1, order.productQuantity, batches, ingredientsTotals);
    
    // Lọc theo trạng thái tiêu thụ đã chọn
    grouped = filterMaterialsByConsumption(grouped, filterType);

    return grouped;
  }, [allMaterials, filterType, selectedBatchCode, activeIngredientSearch, activeLotSearch, order.quantity, batches, ingredientsTotals]);

  return {
    allMaterials,
    loading,
    ingredientsTotals,
    selectedBatchCode,
    setSelectedBatchCode,
    filterType,
    setFilterType,
    ingredientSearch,
    setIngredientSearch,
    lotSearch,
    setLotSearch,
    setActiveIngredientSearch,
    setActiveLotSearch,
    filteredData,
    fetchData
  };
};
