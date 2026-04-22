import axiosClient from './axiosClient';
import type { IProduct, IProductSearchParams, IProductStats } from '../types/product';

export const productApi = {
  async getStats(params?: IProductSearchParams) {
    return await axiosClient.get('/production-products/stats/search', { params });
  },
  async search(params?: IProductSearchParams) {
    return await axiosClient.get('/production-products/search', { params });
  },
  async getTypes() {
    return await axiosClient.get('/production-products/types');
  },
  async getById(id: string) {
    return await axiosClient.get(`/production-products/${id}`);
  },
};
