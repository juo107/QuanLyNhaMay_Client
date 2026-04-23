import axiosClient from './axiosClient';
import type { IProduct, IProductSearchParams, IProductStats } from '../types/product';

export const productApi = {
  async getStats(params?: IProductSearchParams): Promise<IProductStats> {
    return await axiosClient.get('/production-products/stats/search', { params });
  },
  async search(params?: IProductSearchParams): Promise<any> {
    return await axiosClient.get('/production-products/search', { params });
  },
  async getTypes(): Promise<string[]> {
    return await axiosClient.get('/production-products/types');
  },
  async getById(id: string): Promise<IProduct> {
    return await axiosClient.get(`/production-products/${id}`);
  },
};
