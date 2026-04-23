export interface IMhuType {
  mhuTypeId: number;
  fromUnit: string;
  toUnit: string;
  conversion: number;
}

export interface IProduct {
  productMasterId: number;
  itemCode: string;
  itemName: string;
  itemType: string;
  group: string;
  category: string;
  brand: string;
  baseUnit: string;
  inventoryUnit: string;
  itemStatus: string;
  timestamp: string;
  mhuTypes: IMhuType[];
}

export interface IProductSearchParams {
  q?: string;
  status?: string;
  statuses?: string[];
  type?: string;
  types?: string[];
  page: number;
  pageSize: number;
}

export interface IProductStats {
  totalProducts: number;
  activeProducts: number;
  totalTypes: number;
  totalGroups: number;
}
