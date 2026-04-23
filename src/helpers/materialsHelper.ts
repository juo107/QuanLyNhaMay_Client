import type { IMaterialConsumption, IGroupedMaterial, IBatch } from '../types/productionOrderTypes';

// Tính toán số lượng kế hoạch dựa trên định mức công thức và sản lượng mẻ
export const calculatePlanQuantity = (
  item: IMaterialConsumption,
  batches: IBatch[],
  orderQuantity: number,
  productQuantity: number | null | undefined,
  ingredientsTotals: Record<string, { total: number; unit: string }>
): number => {
  const ingCode = item.ingredientCode ? item.ingredientCode.split(' - ')[0].trim() : '';
  const itemBatchNormalized = (item.batchCode || '').trim().toUpperCase();
  const batch = batches.find(b => (b.batchNumber || '').trim().toUpperCase() === itemBatchNormalized);

  if (!batch && item.batchCode) return 0;

  const batchQty = batch ? parseFloat(batch.quantity as any) || 0 : 0;
  const recipeQty = ingredientsTotals[ingCode]?.total || 0;

  // Mấu chốt: Sử dụng ProductQuantity (Base của Recipe) làm số chia nếu có, 
  // nếu không mới dùng orderQuantity (Tổng của PO)
  const poQty = (productQuantity && productQuantity > 0) ? productQuantity : (orderQuantity || 1);

  if (recipeQty === 0 || (!item.batchCode && recipeQty > 0)) {
    return 0;
  }

  const planQ = (recipeQty / poQty) * batchQty;
  return parseFloat(planQ.toFixed(2));
};

// Xác định trạng thái Success/Failed tổng quát cho cả nhóm
export const getGroupResponse = (items: IMaterialConsumption[]): string | null => {
  if (!items || items.length === 0) return null;
  const allSuccess = items.every((item) => item?.response?.includes('Success'));
  if (allSuccess) return 'Success';
  const allFailed = items.every((item) => item?.response && !item?.response?.includes('Success'));
  if (allFailed) return 'Failed';
  return null;
};

// Gộp nhóm dữ liệu tiêu thụ theo mã nguyên vật liệu
export const groupMaterialsLogic = (
  materialsArray: IMaterialConsumption[],
  orderQuantity: number,
  productQuantity: number | null | undefined,
  batches: IBatch[],
  ingredientsTotals: Record<string, { total: number; unit: string }>
): IGroupedMaterial[] => {
  const groupMap = new Map<string, any>();

  materialsArray.forEach(material => {
    const key = (material.ingredientCode || "").trim(); // Gộp theo mã nguyên liệu "Mã - Tên"

    if (groupMap.has(key)) {
      const group = groupMap.get(key);
      group.totalQuantity += parseFloat(material.quantity as any) || 0;
      group.items.push(material);
      group.ids.push(material.id);
      group.response = getGroupResponse(group.items);
    } else {
      const items = [material];
      groupMap.set(key, {
        batchCode: material.batchCode,
        ingredientCode: material.ingredientCode,
        lot: material.lot,
        unitOfMeasurement: material.unitOfMeasurement,
        totalQuantity: parseFloat(material.quantity as any) || 0,
        totalPlanQuantity: 0,
        items: items,
        ids: [material.id],
        latestDatetime: material.datetime,
        response: getGroupResponse(items),
      });
    }
  });

  const results = Array.from(groupMap.values());
  results.forEach(group => {
    // Sắp xếp các mục trong nhóm theo mã mẻ để đảm bảo thứ tự hiển thị
    group.items.sort((a: any, b: any) => {
      const bA = (a.batchCode || "").toString();
      const bB = (b.batchCode || "").toString();
      return bA.localeCompare(bB, undefined, { numeric: true, sensitivity: 'base' });
    });

    // Cập nhật lại danh sách IDs sau khi sắp xếp
    group.ids = group.items.map((it: any) => it.id);

    // Tổng hợp danh sách các mã mẻ xuất hiện trong nhóm
    const allBatchCodes = group.items
      .map((it: any) => (it.batchCode || "").toString().trim().toUpperCase())
      .filter((code: string) => code !== "");
    const uniqueBatches = Array.from(new Set(allBatchCodes)).sort();
    group.batchCode = uniqueBatches.length > 0 ? uniqueBatches.join(", ") : "-";

    // Tính toán số lượng kế hoạch dựa trên định mức công thức
    const ingCodeOnly = group.ingredientCode ? group.ingredientCode.split(' - ')[0].trim() : '';
    const recipeQuantity = ingredientsTotals[ingCodeOnly]?.total || 0;
    // Sử dụng ProductQuantity (Base của Recipe) nếu có, nếu không mới dùng orderQuantity (Tổng của PO)
    const poQuantity = (productQuantity && parseFloat(productQuantity as any) > 0)
      ? parseFloat(productQuantity as any)
      : (parseFloat(orderQuantity as any) || 1);

    let finalPlanQ = 0;
    for (const item of group.items) {
      const batch = batches.find(b => b.batchNumber === item.batchCode);
      const batchQuantity = batch ? parseFloat(batch.quantity as any) || 0 : 0;
      if (recipeQuantity > 0 && batchQuantity > 0) {
        finalPlanQ = (recipeQuantity / poQuantity) * batchQuantity;
        break;
      }
    }
    group.totalPlanQuantity = finalPlanQ;

    // Tổng hợp danh sách các số lô thực tế trong nhóm
    // Lấy danh sách các Lot thực tế (không rỗng)
    const uniqueLots = Array.from(new Set(
      group.items
        .map((it: any) => (it.lot || "").toString().trim())
        .filter((l: string) => l !== "")
    )).sort();

    // KIỂM TRA: Nếu có bất kỳ dòng nào (kể cả thực tế lẫn kế hoạch) mà KHÔNG CÓ LOT
    // Các trường hợp không có lot: rỗng, khoảng trắng, "-", "null", "undefined"
    const hasItemWithoutLot = group.items.some((it: any) => {
      const lotStr = (it.lot || "").toString().trim().toLowerCase();
      return lotStr === "" || lotStr === "-" || lotStr === "null" || lotStr === "undefined";
    });

    if (hasItemWithoutLot || uniqueLots.length === 0) {
      group.lot = "-";
    } else {
      group.lot = uniqueLots.join(", ");
    }

    // Cập nhật lại response cho nhóm sau khi sắp xếp
    group.response = getGroupResponse(group.items);

    // Cập nhật lại ngày tháng mới nhất
    const dates = group.items.map((it: any) => it.datetime).filter(Boolean);
    if (dates.length > 0) {
      group.latestDatetime = dates.sort().reverse()[0];
    }
  });

  return results;
};

// Chuẩn hóa dữ liệu API và ghép ItemName vào mã nguyên liệu
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
      quantity: m.quantity ?? 0,
      unitOfMeasurement: m.unitOfMeasurement || '',
      datetime: m.datetime || '',
      operatorId: m.operatorId || '',
      supplyMachine: m.supplyMachine || '',
      count: m.count ?? 0,
      request: m.request || '',
      response: m.response || '',
      status1: m.status1 || '',
      timestamp: m.timestamp || ''
    };

    // Nếu Backend đã gửi lên định dạng "Mã - Tên", ta giữ nguyên. 
    // Nếu chỉ có mã, ta mới thử tra cứu từ danh sách công thức.
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

// Tạo các dòng kế hoạch trống cho nguyên liệu chưa được tiêu thụ (Cross Join)
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
      const fullCode = ingredientsTotals[ingCode]?.description
        ? `${ingCode} - ${ingredientsTotals[ingCode].description}`
        : ingCode;

      const hasActual = actualConsumptions.some(m => {
        const mBatch = (m.batchCode || '').trim().toUpperCase();
        const mIngRaw = (m.ingredientCode || '').split(' - ')[0].trim();
        return mBatch === batchNumNormalized && mIngRaw === ingCode;
      });

      if (!hasActual) {
        synthesizedRows.push({
          id: null as any,
          batchCode: batch.batchNumber.trim().toUpperCase(), // Đảm bảo đồng nhất kiểu chữ hoa
          ingredientCode: fullCode,
          lot: '',
          quantity: 0,
          unitOfMeasurement: ingredientsTotals[ingCode]?.unit || '',
          datetime: '',
          operatorId: '',
          supplyMachine: '',
          count: 0,
          request: '',
          response: '',
          status1: '',
          timestamp: ''
        });
      }
    });
  });

  return synthesizedRows;
};

// Lọc dữ liệu theo trạng thái tiêu thụ (Đã tiêu thụ / Chưa tiêu thụ)
export const filterMaterialsByConsumption = (
  groupedData: IGroupedMaterial[],
  filterType: 'all' | 'consumed' | 'unconsumed'
): IGroupedMaterial[] => {
  if (!filterType || filterType === 'all') return groupedData;

  if (filterType === 'consumed') {
    return groupedData
      .filter(group => group.ids.length > 0 && group.ids.some(id => id !== null))
      .map(group => ({
        ...group,
        ids: group.ids.filter(id => id !== null),
        items: group.items.filter(it => (it.id !== null && it.id !== undefined))
      }));
  }

  if (filterType === 'unconsumed') {
    return groupedData
      .filter(group => group.ids.length === 0 || group.ids.some(id => id === null))
      .map(group => ({
        ...group,
        ids: group.ids.filter(id => id === null),
        items: group.items.filter(it => (it.id === null || it.id === undefined)),
        totalQuantity: 0
      }));
  }

  return groupedData;
};
