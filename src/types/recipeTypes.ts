export interface IRecipe {
  recipeDetailsId: number;
  recipeCode: string;
  recipeName: string;
  version: string;
  recipeStatus: string;
  productCode: string;
  productName: string;
  timestamp: string;
  isGroup?: boolean;
  versionsCount?: number;
  allVersions?: IRecipe[];
}

export interface IRecipeSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  statuses?: string;
  status?: string;
}

export interface IProcess {
  processId: number;
  processCode: string;
  processName: string;
  duration: number;
  durationUoM: string;
}

export interface IIngredient {
  ingredientId: number;
  processId: number;
  ingredientCode: string;
  itemName: string;
  quantity: number;
  unitOfMeasurement: string;
}

export interface IByProduct {
  byProductId: number;
  processId: number;
  byProductCode: string;
  byProductName: string;
  planQuantity: number;
  unitOfMeasurement: string;
}

export interface IProduct {
  productId: number;
  processId: number;
  productCode: string;
  planQuantity: number;
  unitOfMeasurement: string;
  itemName: string;
}

export interface IParameter {
  processId: number;
  code: string;
  parameterName: string;
  value: string | number;
}

export interface IRecipeDetailResponse {
  success: boolean;
  recipe: IRecipe;
  processes: IProcess[];
  ingredients: IIngredient[];
  products: IProduct[];
  byProducts: IByProduct[];
  parameters: IParameter[];
}

export interface IRecipeVersionItem extends IRecipe {
  productionLine?: string;
}

export interface IRecipeStats {
  total: number;
  active: number;
  totalVersions: number;
}
