import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { productionOrderApi } from '../api/productionOrderApi';
import type { FilterItem } from '../components/FilterSearchBar';
import type { IProductionOrder } from '../types/productionOrderTypes';

export const useProductionOrders = () => {
  // 1. Quản lý trạng thái URL thông qua TanStack Router
  const params = useSearch({ from: '/production-orders' });
  const navigate = useNavigate({ from: '/production-orders' });

  // 2. Các trạng thái giao diện nội bộ
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [poInput, setPoInput] = useState(params.pos || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IProductionOrder | null>(null);

  // Helper cập nhật Search Params lên URL
  const setParams = useCallback((updater: (prev: any) => any) => {
    navigate({
      search: (prev) => updater(prev),
      replace: true,
    });
  }, [navigate]);

  // Query: Lấy danh sách Lệnh Sản Xuất dựa trên bộ lọc URL
  const { data: orderData, isLoading: loading, refetch: fetchData } = useQuery({
    queryKey: ['productionOrders', params],
    queryFn: async () => {
      const finalParams = {
        ...params,
      };
      const res: any = await productionOrderApi.search(finalParams);
      const items = res.items ?? res.Items ?? res.data?.items ?? res.data?.Items ?? (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
      const total = res.total ?? res.Total ?? res.data?.total ?? res.data?.Total ?? 0;
      return { items, total };
    },
  });

  // Query: Lấy số liệu thống kê (Stats) dựa trên bộ lọc URL
  const { data: stats = { total: 0, inProgress: 0, completed: 0, stopped: 0 } } = useQuery({
    queryKey: ['productionOrdersStats', params],
    queryFn: async () => {
      const finalParams = {
        ...params,
      };
      const res: any = await productionOrderApi.getStats(finalParams);
      const s = res.data ?? res;
      return {
        total: s.total ?? s.Total ?? 0,
        inProgress: s.inProgress ?? s.InProgress ?? 0,
        completed: s.completed ?? s.Completed ?? 0,
        stopped: s.stopped ?? s.Stopped ?? 0
      };
    },
  });

  // Query: Lấy dữ liệu danh sách lọc (Process Area, Shifts) từ API
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

  // Query: Lấy danh sách mẻ (Batches) khi mở Modal chi tiết
  const { data: batches = [], isLoading: batchLoading } = useQuery({
    queryKey: ['productionOrderBatchesModal', selectedOrder?.productionOrderId],
    queryFn: async () => {
      if (!selectedOrder?.productionOrderId) return [];
      const res: any = await productionOrderApi.getBatches(selectedOrder.productionOrderId);
      return res?.items ?? res?.Items ?? res?.data?.items ?? res?.data?.Items ?? (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
    },
    enabled: isModalOpen && !!selectedOrder?.productionOrderId,
  });

  // Xử lý thay đổi bộ lọc từ giao diện
  const onFilterChange = (key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  // Xử lý thay đổi trang và giới hạn hiển thị
  const onPageChange = (page: number, pageSize: number) => {
    setParams(prev => ({ ...prev, page, limit: pageSize }));
  };

  // Xử lý tìm kiếm theo mã PO
  const onPoSearch = (val: string) => {
    setParams(prev => ({ ...prev, pos: val || undefined, page: 1 }));
  };

  // Hiển thị Modal chi tiết cho một lệnh sản xuất
  const showDetail = (record: IProductionOrder) => {
    setSelectedOrder(record);
    setIsModalOpen(true);
  };

  // Cấu hình các trường lọc cho FilterSearchBar
  const filterConfig: FilterItem[] = useMemo(() => [
    {
      type: 'autocomplete',
      key: 'searchQuery',
      table: 'ProductionOrders',
      column: 'ProductionOrderNumber,ProductCode',
      placeholder: 'Tìm Lệnh Sản Xuất, Mã SP...',
      width: 280,
    },
    {
      type: 'autocomplete',
      key: 'productCode',
      table: 'ProductMasters',
      column: 'ItemCode,ItemName',
      placeholder: 'Tìm Mã Sản Phẩm, Tên...',
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
      placeholder: 'Khu vực',
      minWidth: 160,
      options: filters.processAreas.map((a: any) => {
        const val = typeof a === 'object' ? (a.value || a.Value || a.processArea || '') : a;
        return { value: val, label: val };
      }),
    },
    {
      type: 'checkboxSelect',
      key: 'shifts',
      placeholder: 'Ca làm',
      minWidth: 120,
      options: filters.shifts.map((s: any) => {
        const val = typeof s === 'object' ? (s.value || s.Value || s.shift || '') : s;
        return { value: val, label: val };
      }),
    },
    {
      type: 'checkboxSelect',
      key: 'statuses',
      placeholder: 'Trạng thái',
      minWidth: 140,
      options: [
        { value: '0', label: 'Đang chờ' },
        { value: '1', label: 'Đang chạy' },
        { value: '2', label: 'Hoàn thành' },
      ],
    },
  ], []);

  return {
    viewMode,
    setViewMode,
    stats,
    data: orderData?.items || [],
    loading,
    total: orderData?.total || 0,
    params,
    poInput,
    setPoInput,
    isModalOpen,
    setIsModalOpen,
    selectedOrder,
    batches,
    batchLoading,
    fetchData,
    onFilterChange,
    onPageChange,
    onPoSearch,
    showDetail,
    filterConfig,
  };
};