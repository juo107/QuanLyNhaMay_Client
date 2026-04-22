import axiosClient from './axiosClient';
import type { IProductionOrderParams } from '../types/productionOrder';

export interface IProductionOrderStats {
  total: number;
  inProgress: number;
  completed: number;
  stopped: number;
}

export interface IProductionStatusStats {
  total: number;
  inProgress: number;
  completed: number;
  stopped: number;
}

export interface IProductionStatusParams {
  page?: number;
  limit?: number;
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
  processAreas?: string;
  shifts?: string;
  statuses?: string;
  pos?: string;
  batchIds?: string;
}

export const productionOrderApi = {
  async getStats(params?: IProductionOrderParams) {
    return await axiosClient.get('/production-orders/stats/search', { params });
  },

  async search(params?: IProductionOrderParams) {
    return await axiosClient.get('/production-orders/search', { params });
  },

  async getFilters(dateFrom?: string, dateTo?: string) {
    return await axiosClient.get('/production-orders/filters', {
      params: { dateFrom, dateTo },
    });
  },

  async getFiltersV2(dateFrom?: string, dateTo?: string) {
    return await axiosClient.get('/production-orders/filters-v2', {
      params: { dateFrom, dateTo },
    });
  },

  async getStatsV2(params?: IProductionStatusParams) {
    return await axiosClient.get('/production-orders/stats-v2/search', { params });
  },

  async searchV2(params?: IProductionStatusParams) {
    return await axiosClient.get('/production-orders/search-v2', { params });
  },

  // --- Detail API ---
  async getDetail(id: number) {
    return await axiosClient.get(`/production-order-detail/${id}`);
  },

  async getBatches(productionOrderId: number) {
    return await axiosClient.get('/production-order-detail/batches', {
      params: { productionOrderId },
    });
  },

  async getIngredients(productionOrderNumber: string) {
    return await axiosClient.get('/production-order-detail/ingredients-by-product', {
      params: { productionOrderNumber },
    });
  },

  async getMaterialConsumptions(
    productionOrderNumber: string,
    batches: string[],
    page: number = 1,
    limit: number = 9999
  ) {
    return await axiosClient.post(`/production-order-detail/material-consumptions?productionOrderNumber=${productionOrderNumber}&page=${page}&limit=${limit}`, batches);
  },

  async getMaterialConsumptionsExclude(
    productionOrderNumber: string,
    batchCodesWithMaterials: { batchCode: string }[],
    page: number = 1,
    limit: number = 9999
  ) {
    return await axiosClient.post(`/production-order-detail/material-consumptions-exclude-batches?productionOrderNumber=${productionOrderNumber}&page=${page}&limit=${limit}`, batchCodesWithMaterials);
  },

  async getBatchCodesWithMaterials(productionOrderNumber: string) {
    return await axiosClient.get('/production-order-detail/batch-codes-with-materials', {
      params: { productionOrderNumber }
    });
  },
};
