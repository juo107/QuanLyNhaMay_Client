import axiosClient from './axiosClient';
import type { IConsumptionRecord, IConsumptionSearchParams } from '../types/consumption';

export const consumptionApi = {
  async search(params: IConsumptionSearchParams) {
    // Destructure để loại bỏ các trường thừa và chuẩn hóa cho Backend .NET
    const { dateFrom, dateTo, pageSize, ...rest } = params;
    
    const mappedParams = {
      ...rest,
      fromDate: dateFrom,
      toDate: dateTo,
      pageSize: pageSize,
    };

    return await axiosClient.get('/production-materials/search', { params: mappedParams });
  },

  async getStats(params: Omit<IConsumptionSearchParams, 'page' | 'pageSize'>) {
    const { dateFrom, dateTo, ...rest } = params;
    
    const mappedParams = {
      ...rest,
      fromDate: dateFrom,
      toDate: dateTo,
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
