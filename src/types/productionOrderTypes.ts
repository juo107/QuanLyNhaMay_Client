export interface IProductionOrder {
  productionOrderId: number;
  productionOrderNumber: string;
  productionLine: string;
  productCode: string;
  recipeCode: string;
  recipeVersion: string;
  lotNumber: string;
  processArea: string;
  plannedStart: string;
  plannedEnd: string;
  quantity: number;
  unitOfMeasurement: string;
  plant: string;
  shopfloor: string;
  shift: string;
  status: number;
  productName: string;
  recipeName: string;
  currentBatch: string | number | null;
  totalBatches: number;
  productQuantity: number | null;
  recipeDetailsId: number | null;
  batches?: IBatch[];
}

export interface IBatch {
  batchId: number;
  productionOrderId: number;
  batchNumber: string;
  quantity: number;
  unitOfMeasurement: string;
  status: number;
}

export interface IProductionOrderStats {
  total: number;
  inProgress: number;
  completed: number;
  stopped: number;
}

export interface IProductionOrderParams {
  page: number;
  limit: number;
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
  processAreas?: string[];
  shifts?: string[];
  statuses?: string[];
}

export interface IMaterialConsumption {
  id: number;
  productionOrderNumber?: string;
  batchCode: string;
  ingredientCode: string;
  ingredientName?: string;
  lot: string;
  quantity: string | number;
  unitOfMeasurement: string;
  datetime: string;
  operatorId: string;
  supplyMachine: string;
  count: number;
  request: string;
  response: string;
  status1: string;
  timestamp: string;
}

export interface IGroupedMaterial {
  batchCode: string | null;
  ingredientCode: string;
  lot: string;
  unitOfMeasurement: string;
  totalQuantity: number;
  totalPlanQuantity: number;
  items: IMaterialConsumption[];
  ids: (number | null)[];
  latestDatetime: string;
  response: string | null;
}
