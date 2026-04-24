import dayjs from 'dayjs';
import type { IBatch, IGroupedMaterial, IMaterialConsumption } from '../types/productionOrderTypes';

// Tính toán số lượng kế hoạch dựa trên định mức công thức và sản lượng mẻ
export const calculatePlanQuantity = (
  item: IMaterialConsumption,
  batches: IBatch[],
  orderQuantity: number,
  productQuantity: number | null | undefined,
  ingredientsTotals: Record<string, { total: number; unit: string; description: string }>
): number | null => {
  const ingCode = item.ingredientCode ? item.ingredientCode.split(' - ')[0].trim() : '';

  if (!ingredientsTotals[ingCode]) {
    return null;
  }

  const itemBatchNormalized = (item.batchCode || '').trim().toUpperCase();
  const batch = batches.find(b => (b.batchNumber || '').trim().toUpperCase() === itemBatchNormalized);

  if (!batch && item.batchCode) return null;

  const batchQty = batch ? parseFloat(batch.quantity as any) || 0 : 0;
  const recipeQty = ingredientsTotals[ingCode]?.total || 0;

  const poQty = (productQuantity && productQuantity > 0) ? productQuantity : (orderQuantity || 1);

  if (recipeQty === 0 || (!item.batchCode && recipeQty > 0)) {
    return null;
  }

  const planQ = (recipeQty / poQty) * batchQty;
  return parseFloat(planQ.toFixed(2));
};

// Xác định trạng thái Success/Failed tổng quát cho cả nhóm
export const getGroupResponse = (items: IMaterialConsumption[]): string | null => {
  if (!items || items.length === 0) return null;

  // 1. Nếu có bất kỳ dòng nào chưa cân (ID null) -> "-"
  const hasIncomplete = items.some(it => !it.id);
  if (hasIncomplete) return null;

  const actualItems = items.filter(it => it.id);
  if (actualItems.length === 0) return null;

  // 2. Kiểm tra tính đồng nhất của trạng thái
  const allSuccess = actualItems.every(it => it.respone?.toLowerCase().includes('success'));
  const allFailed = actualItems.every(it => it.respone?.toLowerCase().includes('fail') || it.respone?.toLowerCase().includes('error'));

  // Chỉ hiện Success nếu 100% thành công
  if (allSuccess) return 'Success';

  // Chỉ hiện Failed nếu 100% thất bại
  if (allFailed) return 'Failed';

  // 3. Nếu pha trộn (vừa có Success vừa có Failed) hoặc các trường hợp khác -> "-"
  return null;
};

// Logic gom nhóm vật tư chính (EJS-Style Logic)
export const groupMaterialsLogic = (
  materialsArray: IMaterialConsumption[],
  orderQuantity: number,
  productQuantity: number | null | undefined,
  batches: IBatch[],
  ingredientsTotals: Record<string, { total: number; unit: string; description: string }>
): IGroupedMaterial[] => {
  const groupMap = new Map<string, IGroupedMaterial>();

  // 1. Phân bổ vào Map
  materialsArray.forEach(material => {
    const rawCode = (material.ingredientCode || "").split(" - ")[0].trim();
    const key = rawCode || 'Unknown';

    if (!groupMap.has(key)) {
      const recipeInfo = ingredientsTotals[key];
      groupMap.set(key, {
        batchCode: '',
        ingredientCode: key,
        itemName: recipeInfo?.description || material.ingredientName || (material.ingredientCode?.split(" - ")[1] || ""),
        lot: '',
        unitOfMeasurement: recipeInfo?.unit || material.unitOfMeasurement || '',
        totalQuantity: 0,
        totalPlanQuantity: 0,
        items: [],
        ids: [],
        latestDatetime: null,
        respone: null,
      });
    }
    groupMap.get(key)!.items.push(material);
  });

  // 2. Tính toán cho từng nhóm
  const results = Array.from(groupMap.values());
  results.forEach(group => {
    let totalPlanQ: number | null = null;
    let totalActualQ: number | null = null;
    const processedActualIds = new Set<string | number>();
    const processedBatches = new Set<string>();
    const uniqueLots = new Set<string>();
    const uniqueBatches = new Set<string>();
    let groupLatestDate: string | null = null;

    group.items.forEach(item => {
      const plan = calculatePlanQuantity(item, batches, orderQuantity, productQuantity, ingredientsTotals);
      (item as any).planQuantity = plan;

      const bCode = (item.batchCode || "").toString().trim().toUpperCase();
      const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity) : (item.quantity as number);

      // Xử lý Thực tế: Chỉ cộng dồn ID DUY NHẤT để tránh bị nhân đôi dữ liệu từ Backend
      if (item.id) {
        if (!processedActualIds.has(item.id)) {
          totalActualQ = (totalActualQ || 0) + (isNaN(qty) ? 0 : qty);
          processedActualIds.add(item.id);
        }

        if (item.datetime) {
          if (!groupLatestDate || dayjs(item.datetime).isAfter(dayjs(groupLatestDate))) {
            groupLatestDate = item.datetime;
          }
        }
        if (item.lot && item.lot !== "-" && item.lot.toLowerCase() !== "null") {
          uniqueLots.add(item.lot.toString().trim());
        }
      }

      // Tính Kế hoạch: Mỗi mã mẻ trong nhóm chỉ tính 1 lần
      if (bCode) {
        uniqueBatches.add(bCode);
        if (!processedBatches.has(bCode)) {
          if (plan !== null) {
            totalPlanQ = totalPlanQ === null ? plan : Math.max(totalPlanQ, plan);
          }
          processedBatches.add(bCode);
        }
      }
    });

    group.totalPlanQuantity = totalPlanQ === null ? 0 : parseFloat((totalPlanQ as number).toFixed(2));
    group.totalQuantity = totalActualQ === null ? 0 : parseFloat((totalActualQ as number).toFixed(2));

    (group as any).hasActualData = totalActualQ !== null;
    (group as any).hasPlanData = totalPlanQ !== null;

    // Logic mới cho Ngày ghi nhận: Nếu có bất kỳ dòng nào chưa có ngày (dòng chờ) -> Hiện "-" cho cả nhóm
    const hasIncompleteDate = group.items.some(it => !it.datetime);
    if (hasIncompleteDate) {
      groupLatestDate = null;
    }

    group.latestDatetime = groupLatestDate;
    group.lot = uniqueLots.size > 0 ? Array.from(uniqueLots).sort().join(", ") : "-";
    group.batchCode = uniqueBatches.size > 0 ? Array.from(uniqueBatches).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).join(", ") : "-";
    group.ids = group.items.filter(it => it.id).map(it => it.id!.toString());
    group.respone = getGroupResponse(group.items);

    group.items.sort((a, b) => {
      // 1. Sắp xếp theo Số mẻ (Batch Code) tăng dần
      const batchA = (a.batchCode || "").toString();
      const batchB = (b.batchCode || "").toString();
      const batchCompare = batchA.localeCompare(batchB, undefined, { numeric: true, sensitivity: 'base' });
      if (batchCompare !== 0) return batchCompare;

      // 2. Trong cùng một mẻ: Ưu tiên dòng Thực tế (có datetime) hiện lên trên, dòng Kế hoạch (không datetime) hiện dưới cùng
      if (a.datetime && !b.datetime) return -1;
      if (!a.datetime && b.datetime) return 1;

      // 3. Nếu cả hai đều là dòng thực tế: Hiện thời gian mới nhất lên đầu
      if (a.datetime && b.datetime) {
        return dayjs(b.datetime).unix() - dayjs(a.datetime).unix();
      }

      return 0;
    });
  });

  // 3. Lọc bỏ các dòng không cần thiết (Quy tắc: Có trong kế hoạch HOẶC Đã có dữ liệu thực tế)
  const filteredResults = results.filter(group => {
    const hasPlan = (group as any).hasPlanData === true; // Có trong công thức là hiện
    const hasActual = (group as any).hasActualData === true; // Có bản ghi thực tế là hiện

    return hasPlan || hasActual;
  });

  return filteredResults.sort((a, b) => a.ingredientCode.localeCompare(b.ingredientCode, undefined, { numeric: true }));
};

export const normalizeMaterialConsumption = (
  rawItems: any[],
  ingredientsTotals: Record<string, { total: number; unit: string; description: string }>
): IMaterialConsumption[] => {
  return rawItems.map((m: any) => {
    const normalized: IMaterialConsumption = {
      id: m.id,
      batchCode: (m.batchCode || '').toString().trim().toUpperCase(),
      ingredientCode: m.ingredientCode,
      lot: m.lot || '',
      quantity: m.quantity,
      unitOfMeasurement: m.unitOfMeasurement || '',
      datetime: m.datetime || '',
      operator_ID: m.operator_ID || '',
      supplyMachine: m.supplyMachine || '',
      count: m.count ?? 0,
      request: m.request || '',
      respone: m.respone || '',
      status1: m.status1 || '',
      timestamp: m.timestamp || '',
      ingredientName: m.ingredientName || m.IngredientName || ''
    };

    let fullCode = normalized.ingredientCode || '';
    if (!fullCode.includes(' - ')) {
      const rawCode = fullCode.trim();
      if (ingredientsTotals[rawCode]?.description) {
        fullCode = `${rawCode} - ${ingredientsTotals[rawCode].description}`;
      }
    }

    return {
      ...normalized,
      ingredientCode: fullCode
    };
  });
};

export const generateSynthesizedRows = (
  batches: IBatch[],
  ingredientsTotals: Record<string, { total: number; unit: string; description: string }>,
  actualConsumptions: IMaterialConsumption[]
): IMaterialConsumption[] => {
  const synthesizedRows: IMaterialConsumption[] = [];
  const ingredientCodes = Object.keys(ingredientsTotals);

  batches.forEach(batch => {
    if (!batch.batchNumber || !batch.batchNumber.trim()) return;
    const batchNumNormalized = batch.batchNumber.trim().toUpperCase();

    ingredientCodes.forEach(ingCode => {
      const isAlreadyConsumed = actualConsumptions.some(
        act => act.ingredientCode.startsWith(ingCode) &&
          (act.batchCode || '').toString().trim().toUpperCase() === batchNumNormalized
      );

      if (!isAlreadyConsumed) {
        synthesizedRows.push({
          batchCode: batchNumNormalized,
          ingredientCode: `${ingCode} - ${ingredientsTotals[ingCode].description}`,
          lot: '-',
          quantity: null,
          unitOfMeasurement: ingredientsTotals[ingCode].unit,
          datetime: '',
          operator_ID: '-',
          supplyMachine: '-',
          respone: '',
          status1: ''
        } as any);
      }
    });
  });

  return synthesizedRows;
};

export const filterMaterialsByConsumption = (
  groups: IGroupedMaterial[],
  type: 'all' | 'consumed' | 'unconsumed'
): IGroupedMaterial[] => {
  if (type === 'all') return groups;
  if (type === 'consumed') return groups.filter(g => g.items.some(it => it.id));
  return groups.filter(g => g.items.some(it => !it.id));
};
