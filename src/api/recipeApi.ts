import type { IRecipeSearchParams, IRecipeStats } from '../types/recipeTypes';
import axiosClient from './axiosClient';

export const recipeApi = {
  async getStats(params?: IRecipeSearchParams): Promise<IRecipeStats> {
    return await axiosClient.get('/production-recipes/stats/search', { params });
  },
  async search(params?: IRecipeSearchParams): Promise<any> {
    return await axiosClient.get('/production-recipes/search', { params });
  },
};
