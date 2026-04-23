import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import type { IProduct, IProductSearchParams } from '../types/product';
import type { FilterItem } from '../components/FilterSearchBar';
import { useSearch, useNavigate } from '@tanstack/react-router';

export const useProducts = () => {
  // 1. Quản lý trạng thái URL thông qua TanStack Router
  const params = useSearch({ from: '/products' });
  const navigate = useNavigate({ from: '/products' });

  // 2. Trạng thái debounce để giảm tần suất gọi API khi nhập liệu
  const [debouncedParams, setDebouncedParams] = useState(params);
  const debounceTimerRef = useRef<any>(null);

  // 3. Các trạng thái giao diện nội bộ cho Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProductCode, setSelectedProductCode] = useState<string | null>(null);

  // Hiệu ứng Debounce: Chỉ cập nhật tham số gọi API sau 400ms ngừng thao tác
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedParams(params);
    }, 400);
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [params]);

  // Helper cập nhật Search Params lên URL
  const setParams = useCallback((updater: (prev: IProductSearchParams) => IProductSearchParams) => {
    navigate({
      search: (prev) => updater(prev as IProductSearchParams),
      replace: true,
    });
  }, [navigate]);

  // Query: Lấy danh sách sản phẩm dựa trên bộ lọc URL
  const { data: productData, isLoading: loading, refetch: fetchProducts } = useQuery({
    queryKey: ['products', debouncedParams],
    queryFn: async () => {
      const searchRes: any = await productApi.search(debouncedParams);
      const rawItems = searchRes.items ?? searchRes.Items ?? searchRes.data?.items ?? searchRes.data?.Items ?? (Array.isArray(searchRes) ? searchRes : []);
      const total = searchRes.total ?? searchRes.Total ?? searchRes.data?.total ?? searchRes.data?.Total ?? 0;
      return { items: rawItems, total };
    },
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  // Query: Lấy số liệu thống kê sản phẩm dựa trên bộ lọc URL
  const { data: stats = { totalProducts: 0, activeProducts: 0, totalTypes: 0, totalGroups: 0 } } = useQuery({
    queryKey: ['productsStats', debouncedParams],
    queryFn: async () => {
      const statsRes: any = await productApi.getStats(debouncedParams);
      const s = statsRes.data ?? statsRes;
      return {
        totalProducts: s.totalProducts ?? s.TotalProducts ?? 0,
        activeProducts: s.activeProducts ?? s.ActiveProducts ?? 0,
        totalTypes: s.totalTypes ?? s.TotalTypes ?? 0,
        totalGroups: s.totalGroups ?? s.TotalGroups ?? 0
      };
    },
    staleTime: 30000,
  });

  // Query: Lấy danh sách loại sản phẩm để hiển thị trong bộ lọc
  const { data: availableTypes = [] } = useQuery({
    queryKey: ['productTypes'],
    queryFn: () => productApi.getTypes(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Query: Lấy chi tiết một sản phẩm khi mở Modal
  const { data: selectedProduct, isLoading: detailLoading } = useQuery({
    queryKey: ['productDetail', selectedProductCode],
    queryFn: () => selectedProductCode ? productApi.getById(selectedProductCode) : null,
    enabled: !!selectedProductCode && isDetailModalOpen,
  });

  // Xử lý thay đổi bộ lọc từ giao diện
  const onFilterChange = (key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  // Xử lý thay đổi trang và giới hạn hiển thị
  const onPageChange = useCallback((page: number, pageSize: number) => {
    setParams(prev => ({ ...prev, page, pageSize }));
  }, [setParams]);

  // Mở Modal chi tiết sản phẩm
  const openDetailModal = useCallback((record: IProduct) => {
    setSelectedProductCode(record.itemCode);
    setIsDetailModalOpen(true);
  }, []);

  // Đóng Modal chi tiết sản phẩm
  const closeDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedProductCode(null);
  }, []);

  // Cấu hình các trường lọc cho FilterSearchBar
  const filterConfig: FilterItem[] = useMemo(() => [
    {
      type: 'autocomplete',
      key: 'q',
      table: 'ProductMasters',
      column: 'ItemCode,ItemName,Group',
      placeholder: 'Tìm mã, tên, nhóm...',
      width: 300,
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
    data: productData?.items || [],
    loading,
    params,
    total: productData?.total || 0,
    isDetailModalOpen,
    detailLoading,
    selectedProduct: selectedProduct || null,
    onFilterChange,
    onPageChange,
    openDetailModal,
    closeDetailModal,
    filterConfig,
    fetchProducts
  };
};