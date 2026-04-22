import axiosClient from './axiosClient';
import type { IRecipe, IRecipeSearchParams, IRecipeStats } from '../types/recipeTypes';

export const recipeApi = {
  async getStats(params?: IRecipeSearchParams): Promise<any> {
    return await axiosClient.get('/production-recipes/stats/search', { params });
  },
  async search(params?: IRecipeSearchParams): Promise<any> {
    return await axiosClient.get('/production-recipes/search', { params });
  },
};
