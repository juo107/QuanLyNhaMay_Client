import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { productionOrderApi } from '../api/productionOrderApi';
import type { FilterItem } from '../components/FilterSearchBar';
import type { IProductionOrder } from '../types/productionOrderTypes';

export const useProductionStatus = () => {
  // 1. Quản lý trạng thái URL thông qua TanStack Router
  const params = useSearch({ from: '/production-status' });
  const navigate = useNavigate({ from: '/production-status' });

  // 2. Các trạng thái giao diện nội bộ
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IProductionOrder | null>(null);

  // Helper cập nhật Search Params lên URL
  const setParams = useCallback((updater: (prev: any) => any) => {
    navigate({
      search: (prev) => updater(prev),
      replace: true,
    });
  }, [navigate]);

  // Query: Lấy danh sách Trạng Thái Sản Xuất dựa trên bộ lọc URL
  const { data: statusData, isLoading: loading, refetch: fetchData } = useQuery({
    queryKey: ['productionStatus', params],
    queryFn: async () => {
      const finalParams = {
        ...params,
      };
      const searchRes: any = await productionOrderApi.search(finalParams);
      const items = searchRes.items ?? searchRes.Items ?? searchRes.data?.items ?? searchRes.data?.Items ?? (Array.isArray(searchRes) ? searchRes : []);
      const total = searchRes.total ?? searchRes.Total ?? searchRes.data?.total ?? searchRes.data?.Total ?? 0;
      return { items, total };
    },
  });

  // Query: Lấy số liệu thống kê sản xuất (Stats) dựa trên bộ lọc URL
  const { data: stats = { Total: 0, InProgress: 0, Completed: 0, Stopped: 0 } } = useQuery({
    queryKey: ['productionStatusStats', params],
    queryFn: async () => {
      const finalParams = {
        ...params,
      };
      const statsRes: any = await productionOrderApi.getStats(finalParams);
      const s = statsRes.data ?? statsRes;
      return {
        Total: s.total ?? s.Total ?? 0,
        InProgress: s.inProgress ?? s.InProgress ?? 0,
        Completed: s.completed ?? s.Completed ?? 0,
        Stopped: s.stopped ?? s.Stopped ?? 0
      };
    },
  });

  // Query: Lấy dữ liệu danh sách lọc (Process Area, Shifts)
  const { data: filters = { processAreas: [], shifts: [] } } = useQuery({
    queryKey: ['productionFilters'],
    queryFn: async () => {
      const res: any = await productionOrderApi.getFilters();
      const d = res?.data ?? res;
      return {
        processAreas: d?.processAreas ?? d?.ProcessAreas ?? [],
        shifts: d?.shifts ?? d?.Shifts ?? []
      };
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Xử lý thay đổi bộ lọc từ giao diện
  const onFilterChange = useCallback((key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value || undefined, page: 1 }));
  }, [setParams]);

  // Xử lý thay đổi trang và giới hạn hiển thị
  const onPageChange = useCallback((page: number, pageSize: number) => {
    setParams(prev => ({ ...prev, page, limit: pageSize }));
  }, [setParams]);

  // Cấu hình các trường lọc cho FilterSearchBar
  const filterConfig: FilterItem[] = useMemo(() => [
    {
      type: 'autocomplete',
      key: 'searchQuery',
      table: 'ProductionOrders',
      column: 'ProductionOrderNumber,ProductCode',
      placeholder: 'Tìm lệnh SX, mã SP...',
      width: 280,
    },
    {
      type: 'dateRange',
      key: ['dateFrom', 'dateTo'],
      placeholder: ['Từ ngày', 'Đến ngày'],
    },
    {
      type: 'checkboxSelect',
      key: 'processAreas',
      placeholder: 'Process Area',
      minWidth: 180,
      options: filters.processAreas.map((a: any) => {
        const val = typeof a === 'object' ? (a.value || a.Value || a.processArea || '') : a;
        return { value: val, label: val };
      }),
    },
    {
      type: 'checkboxSelect',
      key: 'shifts',
      placeholder: 'Ca làm việc',
      minWidth: 160,
      options: filters.shifts.map((s: any) => {
        const val = typeof s === 'object' ? (s.value || s.Value || s.shift || '') : s;
        return { value: val, label: val };
      }),
    },
    {
      type: 'checkboxSelect',
      key: 'statuses',
      placeholder: 'Trạng thái',
      minWidth: 160,
      options: [
        { value: 'Đang chạy', label: 'Đang chạy' },
        { value: 'Đang chờ', label: 'Đang chờ' },
      ],
    },
  ], [filters]);

  return {
    stats,
    data: statusData?.items || [],
    loading,
    params,
    total: statusData?.total || 0,
    viewMode,
    setViewMode,
    isModalOpen,
    setIsModalOpen,
    selectedOrder,
    setSelectedOrder,
    onFilterChange,
    onPageChange,
    filterConfig,
    fetchData,
  };
};