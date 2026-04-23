import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { productApi } from '../api/productApi';
import type { IRecipeDetailResponse } from '../types/recipeTypes';

export const useRecipeDetail = (id: string | undefined) => {
  // 1. Các trạng thái giao diện nội bộ (Lọc quy trình, Modal sản phẩm)
  const [selectedProcessIds, setSelectedProcessIds] = useState<number[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProductCode, setSelectedProductCode] = useState<string | null>(null);

  // Query: Lấy chi tiết thông tin công thức dựa trên ID từ URL
  const { data, isLoading: loading, error: queryError, refetch: fetchDetail } = useQuery({
    queryKey: ['recipeDetail', id],
    queryFn: async () => {
      if (!id) throw new Error('Thiếu ID công thức');
      const res = await axiosClient.get(`/production-recipe-detail/${id}`) as any;
      const rawData = res.data ?? res;

      const recipeData: IRecipeDetailResponse = {
        success: true,
        recipe: rawData.recipe ?? rawData.Recipe,
        processes: rawData.processes ?? rawData.Processes ?? [],
        ingredients: rawData.ingredients ?? rawData.Ingredients ?? [],
        products: rawData.products ?? rawData.Products ?? [],
        byProducts: rawData.byProducts ?? rawData.ByProducts ?? [],
        parameters: rawData.parameters ?? rawData.Parameters ?? []
      };

      // Khởi tạo danh sách ID quy trình mặc định khi dữ liệu lần đầu được tải
      if (selectedProcessIds.length === 0 && recipeData.processes.length > 0) {
        setSelectedProcessIds(recipeData.processes.map(p => p.processId));
      }

      return recipeData;
    },
    enabled: !!id,
  });

  // Query: Lấy thông tin chi tiết của một sản phẩm khi mở Modal
  const { data: selectedProduct, isLoading: productLoading } = useQuery({
    queryKey: ['productDetailRecipe', selectedProductCode],
    queryFn: () => selectedProductCode ? productApi.getById(selectedProductCode) : null,
    enabled: !!selectedProductCode && isProductModalOpen,
  });

  // Lọc danh sách nguyên liệu theo các quy trình đã chọn
  const filteredIngredients = useMemo(() => {
    if (!data) return [];
    if (!selectedProcessIds.length) return data.ingredients || [];
    return (data.ingredients || []).filter((i) => selectedProcessIds.includes(i.processId));
  }, [data, selectedProcessIds]);

  // Lọc danh sách sản phẩm theo các quy trình đã chọn
  const filteredProducts = useMemo(() => {
    if (!data) return [];
    if (!selectedProcessIds.length) return data.products || [];
    return (data.products || []).filter((p) => selectedProcessIds.includes(p.processId));
  }, [data, selectedProcessIds]);

  // Lọc danh sách phụ phẩm theo các quy trình đã chọn
  const filteredByProducts = useMemo(() => {
    if (!data) return [];
    if (!selectedProcessIds.length) return data.byProducts || [];
    return (data.byProducts || []).filter((i) => selectedProcessIds.includes(i.processId));
  }, [data, selectedProcessIds]);

  // Lọc danh sách thông số vận hành theo các quy trình đã chọn
  const filteredParameters = useMemo(() => {
    if (!data) return [];
    if (!selectedProcessIds.length) return data.parameters || [];
    return (data.parameters || []).filter((i) => selectedProcessIds.includes(i.processId));
  }, [data, selectedProcessIds]);

  // Mở Modal chi tiết sản phẩm cho một mã code cụ thể
  const openProductModal = useCallback((code: string) => {
    if (!code) return;
    setSelectedProductCode(code);
    setIsProductModalOpen(true);
  }, []);

  return {
    loading,
    error: queryError ? (queryError as any).message : '',
    data,
    selectedProcessIds,
    setSelectedProcessIds,
    filteredIngredients,
    filteredProducts,
    filteredByProducts,
    filteredParameters,
    selectedProduct,
    isProductModalOpen,
    setIsProductModalOpen,
    productLoading,
    openProductModal,
    fetchDetail
  };
};
