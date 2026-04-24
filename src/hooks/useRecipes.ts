import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useRef, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { recipeApi } from '../api/recipeApi';
import { groupRecipesByCode } from '../helpers/recipeHelper';
import type { IRecipe } from '../types/recipeTypes';
import { useTableFilters } from './useTableFilters';

export const useRecipes = () => {
  // 1. Quản lý trạng thái URL thông qua TanStack Router
  const params = useSearch({ from: '/recipes' });
  const navigate = useNavigate({ from: '/recipes' });
  const { onFilterChange, onPageChange } = useTableFilters(navigate);

  const restoredRef = useRef(false);

  // 2. Các trạng thái giao diện nội bộ cho Drawer và phiên bản
  const [selectedRecipe, setSelectedRecipe] = useState<IRecipe | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);



  // Query: Lấy danh sách công thức dựa trên bộ lọc URL và xử lý gộp nhóm
  const { data: recipeData, isLoading: loading, refetch: fetchRecipes } = useQuery({
    queryKey: ['recipes', params],
    queryFn: async () => {
      const searchRes: any = await recipeApi.search(params);
      const rawItems = searchRes.items ?? searchRes.Items ?? searchRes.data?.items ?? searchRes.data?.Items ?? (Array.isArray(searchRes) ? searchRes : []);
      const total = searchRes.total ?? searchRes.Total ?? searchRes.data?.total ?? searchRes.data?.Total ?? 0;
      return { items: groupRecipesByCode(rawItems), total };
    },
  });

  // Query: Lấy số liệu thống kê công thức dựa trên bộ lọc URL
  const { data: stats = { total: 0, active: 0, totalVersions: 0 } } = useQuery({
    queryKey: ['recipesStats', params],
    queryFn: async () => {
      const statsRes: any = await recipeApi.getStats(params);
      return {
        total: statsRes.total ?? statsRes.Total ?? statsRes.data?.total ?? statsRes.data?.Total ?? 0,
        active: statsRes.active ?? statsRes.Active ?? statsRes.data?.active ?? statsRes.data?.Active ?? 0,
        totalVersions: statsRes.totalVersions ?? statsRes.TotalVersions ?? statsRes.data?.totalVersions ?? statsRes.data?.totalVersions ?? 0
      };
    },
  });

  // Query: Lấy danh sách các phiên bản của một công thức khi mở Drawer
  const { data: versionRows = [], isLoading: versionLoading } = useQuery({
    queryKey: ['recipeVersions', selectedRecipe?.recipeCode],
    queryFn: async () => {
      if (!selectedRecipe?.recipeCode) return [];
      const payload: any = await axiosClient.get('/production-order-detail/recipe-versions', {
        params: { recipeCode: selectedRecipe.recipeCode || '' },
      });
      return payload?.items ?? payload?.Items ?? payload?.data?.items ?? payload?.data?.Items ?? (Array.isArray(payload) ? payload : []);
    },
    enabled: isDetailDrawerOpen && !!selectedRecipe?.recipeCode,
  });



  // Mở Drawer chi tiết cho một công thức
  const openDetailDrawer = useCallback((recipe: IRecipe) => {
    setSelectedRecipe(recipe);
    setIsDetailDrawerOpen(true);
  }, []);

  // Đóng Drawer chi tiết
  const closeDetailDrawer = useCallback(() => {
    setIsDetailDrawerOpen(false);
    setSelectedRecipe(null);
  }, []);

  return {
    stats,
    data: recipeData?.items || [],
    loading,
    params,
    total: recipeData?.total || 0,
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
