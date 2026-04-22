export interface IConsumptionRecord {
  id: number;
  productionOrderNumber: string;
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
  status?: string;
  status1: string;
  timestamp: string;
  shift?: string;
  productionLine?: string;
}

export interface IConsumptionSearchParams {
  page?: number;
  limit?: number;
  productionOrderNumber?: string;
  batchCode?: string;
  ingredientCode?: string;
  respone?: string;
  shift?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface IConsumptionStats {
  total: number;
}
