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
  operatorId?: string;
  operator_ID?: string; // Khớp với .NET Operator_ID
  supplyMachine: string;
  count: number;
  request: string;
  response?: string;
  respone?: string; // Khớp với .NET Respone (typo trong DB)
  status?: string;
  status1: string;
  timestamp: string;
  shift?: string;
  productionLine?: string;
}

export interface IConsumptionSearchParams {
  page: number;
  pageSize: number;
  productionOrderNumber?: string;
  batchCode?: string;
  ingredientCode?: string;
  respone?: string[];
  shift?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface IConsumptionStats {
  total: number;
}
