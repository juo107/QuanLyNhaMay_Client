import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { productionOrderApi } from '../api/productionOrderApi';
import type { FilterItem } from '../components/FilterSearchBar';
import type { IProductionOrder } from '../types/productionOrderTypes';
import { useTableFilters } from './useTableFilters';

export const useProductionStatus = () => {
  const params = useSearch({ from: '/production-status' });
  const navigate = useNavigate({ from: '/production-status' });
  const { onFilterChange, onPageChange } = useTableFilters(navigate);

  // 2. Các trạng thái giao diện nội bộ
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IProductionOrder | null>(null);

  // Query: Lấy danh sách Trạng Thái Sản Xuất dựa trên bộ lọc URL
  const { data: statusData, isLoading: loading, refetch: fetchData } = useQuery({
    queryKey: ['productionStatus', params],
    queryFn: async () => {
      const p = params as Record<string, any>;
      const finalParams = {
        ...params,
        statuses: Array.isArray(p.statuses) ? p.statuses.join(',') : p.statuses,
        processAreas: Array.isArray(p.processAreas) ? p.processAreas.join(',') : p.processAreas,
        shifts: Array.isArray(p.shifts) ? p.shifts.join(',') : p.shifts,
      };
      const searchRes: any = await productionOrderApi.searchV2(finalParams);
      const items = searchRes.items ?? searchRes.Items ?? searchRes.data?.items ?? searchRes.data?.Items ?? (Array.isArray(searchRes) ? searchRes : []);
      const total = searchRes.total ?? searchRes.Total ?? searchRes.data?.total ?? searchRes.data?.Total ?? 0;
      return { items, total };
    },
  });

  // Query: Lấy số liệu thống kê sản xuất (Stats) dựa trên bộ lọc URL
  const { data: stats = { Total: 0, InProgress: 0, Completed: 0, Stopped: 0 } } = useQuery({
    queryKey: ['productionStatusStats', params],
    queryFn: async () => {
      const p = params as Record<string, any>;
      const finalParams = {
        ...params,
        statuses: Array.isArray(p.statuses) ? p.statuses.join(',') : p.statuses,
        processAreas: Array.isArray(p.processAreas) ? p.processAreas.join(',') : p.processAreas,
        shifts: Array.isArray(p.shifts) ? p.shifts.join(',') : p.shifts,
      };
      const statsRes: any = await productionOrderApi.getStatsV2(finalParams);
      const s = statsRes.data ?? statsRes;
      return {
        Total: s.total ?? s.Total ?? 0,
        InProgress: s.inProgress ?? s.InProgress ?? 0,
        Completed: s.completed ?? s.Completed ?? 0,
        Stopped: s.stopped ?? s.Stopped ?? 0
      };
    },
  });

  // Query: Lấy dữ liệu danh sách lọc (Process Area, Shifts, Statuses)
  const { data: filters = { processAreas: [], shifts: [], statuses: [] } } = useQuery({
    queryKey: ['productionFilters'],
    queryFn: async () => {
      const res: any = await productionOrderApi.getFiltersV2();
      const d = res?.data ?? res;
      return {
        processAreas: d?.processAreas ?? d?.ProcessAreas ?? [],
        shifts: d?.shifts ?? d?.Shifts ?? [],
        statuses: d?.statuses ?? d?.Statuses ?? []
      };
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });



  // Ánh xạ nhãn trạng thái từ mã số
  const getStatusLabel = (status: string) => {
    switch (status) {
      case '1': return 'Đang chạy';
      case '0': return 'Đang chờ';
      case '2': return 'Đã hoàn thành';
      default: return `Trạng thái ${status}`;
    }
  };

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
      options: ['1', '0'].map(s => ({
        value: s,
        label: getStatusLabel(s)
      })),
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