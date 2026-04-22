import { useState, useCallback, useEffect, useMemo } from 'react';
import { message } from 'antd';
import { productApi } from '../api/productApi';
import type { IProduct, IProductSearchParams } from '../types/product';
import type { FilterItem } from '../components/FilterSearchBar';

export const useProducts = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalTypes: 0,
    totalGroups: 0
  });

  const [data, setData] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Định nghĩa initialParams đơn giản hơn
  const initialParams: IProductSearchParams = {
    page: 1,
    pageSize: 20,
    q: undefined,
    types: undefined,
    statuses: undefined
  };

  // 2. Chuyển từ useUrlState sang useState thông thường
  const [params, setParams] = useState<IProductSearchParams>(initialParams);

  const [total, setTotal] = useState(0);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  const fetchProducts = useCallback(async (currentParams: IProductSearchParams) => {
    setLoading(true);
    try {
      const searchRes: any = await productApi.search(currentParams);
      if (searchRes) {
        const rawItems = searchRes.items ?? searchRes.Items ?? searchRes.data?.items ?? searchRes.data?.Items ?? (Array.isArray(searchRes) ? searchRes : []);
        setData(rawItems);
        setTotal(searchRes.total ?? searchRes.Total ?? searchRes.data?.total ?? searchRes.data?.Total ?? 0);
      }

      const statsRes: any = await productApi.getStats(currentParams);
      if (statsRes) {
        const s = statsRes.data ?? statsRes;
        setStats({
          totalProducts: s.totalProducts ?? s.TotalProducts ?? 0,
          activeProducts: s.activeProducts ?? s.ActiveProducts ?? 0,
          totalTypes: s.totalTypes ?? s.TotalTypes ?? 0,
          totalGroups: s.totalGroups ?? s.TotalGroups ?? 0
        });
      }
    } catch {
      message.error("Lỗi tải danh mục sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    productApi.getTypes().then(res => setAvailableTypes(res || []));
  }, []);

  // Effect này vẫn giữ lại để tự động fetch khi params thay đổi (có debounce)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchProducts(params);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [fetchProducts, params]);

  const onFilterChange = (key: string, value: any) => {
    setParams(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1 // Reset về trang 1 khi lọc
    }));
  };

  const onPageChange = useCallback((page: number, pageSize: number) => {
    setParams(prev => ({ ...prev, page, pageSize }));
  }, []);

  const openDetailModal = useCallback(async (record: IProduct) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const detail = await productApi.getById(record.itemCode);
      setSelectedProduct(detail || null);
    } catch {
      setSelectedProduct(null);
      message.error('Không tải được chi tiết sản phẩm');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const filterConfig: FilterItem[] = useMemo(() => [
    {
      type: 'search',
      key: 'q',
      placeholder: 'Tìm mã, tên, nhóm...',
      width: 260,
    },
    {
      type: 'checkboxSelect',
      key: 'statuses',
      placeholder: 'Trạng thái',
      minWidth: 160,
      options: [
        { value: 'ACTIVE', label: 'Hoạt động' },
        { value: 'INACTIVE', label: 'Vô hiệu' },
      ],
    },
    {
      type: 'checkboxSelect',
      key: 'types',
      placeholder: 'Loại sản phẩm',
      minWidth: 200,
      options: availableTypes.map(t => ({ value: t, label: t })),
    },
  ], [availableTypes]);

  return {
    stats,
    data,
    loading,
    params,
    total,
    isDetailModalOpen,
    detailLoading,
    selectedProduct,
    onFilterChange,
    onPageChange,
    openDetailModal,
    closeDetailModal,
    filterConfig,
    fetchProducts
  };
};