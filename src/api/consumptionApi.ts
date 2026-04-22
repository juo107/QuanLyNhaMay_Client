import axiosClient from './axiosClient';
import type { IConsumptionRecord, IConsumptionSearchParams, IConsumptionStats } from '../types/consumption';

export const consumptionApi = {
  async search(params: IConsumptionSearchParams) {
    const mappedParams = {
      ...params,
      fromDate: params.dateFrom,
      toDate: params.dateTo,
      pageSize: params.limit,
    };
    return await axiosClient.get('/production-materials/search', { params: mappedParams });
  },

  async getStats(params: Omit<IConsumptionSearchParams, 'page' | 'limit'>) {
    const mappedParams = {
      ...params,
      fromDate: params.dateFrom,
      toDate: params.dateTo,
    };
    return await axiosClient.get('/production-materials/stats/search', { params: mappedParams });
  },

  async getPOs(params: { dateFrom?: string; dateTo?: string }) {
    return await axiosClient.get('/production-materials/production-orders', {
      params: { fromDate: params.dateFrom, toDate: params.dateTo },
    });
  },

  async getBatches(params: { productionOrderNumber?: string; dateFrom?: string; dateTo?: string }) {
    return await axiosClient.get('/production-materials/batch-codes', {
      params: { ...params, fromDate: params.dateFrom, toDate: params.dateTo },
    });
  },

  async getIngredients(params: { productionOrderNumber?: string; batchCode?: string; dateFrom?: string; dateTo?: string }) {
    return await axiosClient.get('/production-materials/ingredients', {
      params: { ...params, fromDate: params.dateFrom, toDate: params.dateTo },
    });
  },

  async getShifts(params: { dateFrom?: string; dateTo?: string }) {
    return await axiosClient.get('/production-materials/shifts', {
      params: { fromDate: params.dateFrom, toDate: params.dateTo },
    });
  }
};
