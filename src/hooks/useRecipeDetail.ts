import { useState, useEffect, useMemo, useCallback } from 'react';
import { message } from 'antd';
import axiosClient from '../api/axiosClient';
import { productApi } from '../api/productApi';
import type { IRecipeDetailResponse } from '../types/recipeTypes';
import type { IProduct } from '../types/product';

// Hook quản lý chi tiết công thức: tải thông tin, lọc quy trình và xử lý Modal sản phẩm
export const useRecipeDetail = (id: string | undefined) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<IRecipeDetailResponse | null>(null);
  const [selectedProcessIds, setSelectedProcessIds] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  // Tải thông tin chi tiết công thức (quy trình, nguyên liệu, thông số)
  const fetchDetail = useCallback(async () => {
    if (!id) {
      setError('Thiếu ID công thức');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosClient.get(`/production-recipe-detail/${id}`) as any;
      if (res) {
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
        setData(recipeData);
        setSelectedProcessIds((recipeData.processes || []).map((p) => p.processId));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải chi tiết công thức');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const filteredIngredients = useMemo(() => {
    if (!data) return [];
    if (!selectedProcessIds.length) return data.ingredients || [];
    return (data.ingredients || []).filter((i) => selectedProcessIds.includes(i.processId));
  }, [data, selectedProcessIds]);

  const filteredProducts = useMemo(() => {
    if (!data) return [];
    if (!selectedProcessIds.length) return data.products || [];
    return (data.products || []).filter((p) => selectedProcessIds.includes(p.processId));
  }, [data, selectedProcessIds]);

  const filteredByProducts = useMemo(() => {
    if (!data) return [];
    if (!selectedProcessIds.length) return data.byProducts || [];
    return (data.byProducts || []).filter((i) => selectedProcessIds.includes(i.processId));
  }, [data, selectedProcessIds]);

  const filteredParameters = useMemo(() => {
    if (!data) return [];
    if (!selectedProcessIds.length) return data.parameters || [];
    return (data.parameters || []).filter((i) => selectedProcessIds.includes(i.processId));
  }, [data, selectedProcessIds]);

  // Mở Modal hiển thị thông tin chi tiết của sản phẩm/nguyên liệu
  const openProductModal = async (code: string) => {
    if (!code) return;
    setIsProductModalOpen(true);
    setProductLoading(true);
    try {
      const detail = await productApi.getById(code);
      setSelectedProduct(detail);
    } catch {
      setSelectedProduct(null);
      message.error('Không tải được chi tiết sản phẩm');
    } finally {
      setProductLoading(false);
    }
  };

  return {
    loading,
    error,
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
