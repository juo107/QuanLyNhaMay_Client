import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { message } from 'antd';
import axiosClient from '../api/axiosClient';
import { recipeApi } from '../api/recipeApi';
import { groupRecipesByCode } from '../helpers/recipeHelper';
import type { IRecipe, IRecipeSearchParams, IRecipeVersionItem, IRecipeStats } from '../types/recipeTypes';

// Hook quản lý danh sách công thức: tải dữ liệu, phân trang và xử lý Drawer
export const useRecipes = () => {
  const restoredRef = useRef(false);
  const [stats, setStats] = useState<IRecipeStats>({ total: 0, active: 0, totalVersions: 0 });
  const [data, setData] = useState<IRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<IRecipeSearchParams>({ page: 1, limit: 20 });
  const [total, setTotal] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<IRecipe | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [versionRows, setVersionRows] = useState<IRecipeVersionItem[]>([]);
  const [versionLoading, setVersionLoading] = useState(false);

  // Tải danh sách công thức từ API và xử lý gộp nhóm phiên bản
  const fetchRecipes = useCallback(async (currentParams: IRecipeSearchParams) => {
    setLoading(true);
    try {
      const searchRes: any = await recipeApi.search(currentParams);
      if (searchRes) {
        const rawItems = searchRes.items ?? searchRes.Items ?? searchRes.data?.items ?? searchRes.data?.Items ?? (Array.isArray(searchRes) ? searchRes : []);
        setData(groupRecipesByCode(rawItems));
        setTotal(searchRes.total ?? searchRes.Total ?? searchRes.data?.total ?? searchRes.data?.Total ?? 0);
      }

      const statsRes: any = await recipeApi.getStats(currentParams);
      if (statsRes) {
        setStats({
          total: statsRes.total ?? statsRes.Total ?? statsRes.data?.total ?? statsRes.data?.Total ?? 0,
          active: statsRes.active ?? statsRes.Active ?? statsRes.data?.active ?? statsRes.data?.Active ?? 0,
          totalVersions: statsRes.totalVersions ?? statsRes.TotalVersions ?? statsRes.data?.totalVersions ?? statsRes.data?.totalVersions ?? 0
        });
      }
    } catch {
      message.error('Lỗi tải danh sách công thức');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchRecipes(params);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [fetchRecipes, params.page, params.limit, params.search, params.statuses]);

  const onFilterChange = (key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const onPageChange = useCallback((page: number, pageSize: number) => {
    setParams(prev => ({ ...prev, page, limit: pageSize }));
  }, []);

  // Mở Drawer chi tiết và tải danh sách các phiên bản của công thức
  const openDetailDrawer = useCallback(async (recipe: IRecipe) => {
    setSelectedRecipe(recipe);
    setIsDetailDrawerOpen(true);
    setVersionLoading(true);
    try {
      const payload: any = await axiosClient.get('/production-order-detail/recipe-versions', {
        params: { recipeCode: recipe.recipeCode || '' },
      });
      const items = payload?.items ?? payload?.Items ?? payload?.data?.items ?? payload?.data?.Items ?? (Array.isArray(payload) ? payload : []);
      setVersionRows(items);
    } catch {
      setVersionRows([]);
      message.error('Không tải được danh sách phiên bản công thức');
    } finally {
      setVersionLoading(false);
    }
  }, []);

  const closeDetailDrawer = useCallback(() => {
    setIsDetailDrawerOpen(false);
    setSelectedRecipe(null);
    setVersionRows([]);
  }, []);

  return {
    stats,
    data,
    loading,
    params,
    total,
    selectedRecipe,
    isDetailDrawerOpen,
    versionRows,
    versionLoading,
    onFilterChange,
    onPageChange,
    openDetailDrawer,
    closeDetailDrawer,
    fetchRecipes,
    restoredRef
  };
};
