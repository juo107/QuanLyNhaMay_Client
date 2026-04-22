import { useState, useCallback, useEffect, useMemo } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { productionOrderApi } from '../api/productionOrderApi';
import type { IProductionOrder, IProductionOrderParams } from '../types/productionOrderTypes';
import type { FilterItem } from '../components/FilterSearchBar';

export const useProductionStatus = () => {
  const [stats, setStats] = useState({ Total: 0, InProgress: 0, Completed: 0, Stopped: 0 });
  const [data, setData] = useState<IProductionOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Định nghĩa giá trị khởi tạo
  const initialParams: IProductionOrderParams = {
    page: 1,
    limit: 20,
    dateFrom: dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    dateTo: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
    searchQuery: undefined,
    processAreas: undefined,
    shifts: undefined,
    statuses: undefined,
  };

  // 2. Sử dụng useState thay cho useUrlState
  const [params, setParams] = useState<IProductionOrderParams>(initialParams);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const [total, setTotal] = useState(0);
  const [processAreas, setProcessAreas] = useState<string[]>([]);
  const [shifts, setShifts] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IProductionOrder | null>(null);

  const fetchData = useCallback(async (currentParams: IProductionOrderParams) => {
    setLoading(true);
    try {
      const searchRes: any = await productionOrderApi.search(currentParams);
      if (searchRes) {
        const rawItems = searchRes.items ?? searchRes.Items ?? searchRes.data?.items ?? searchRes.data?.Items ?? (Array.isArray(searchRes) ? searchRes : []);
        setData(rawItems);
        setTotal(searchRes.total ?? searchRes.Total ?? searchRes.data?.total ?? searchRes.data?.Total ?? 0);
      }

      const statsRes: any = await productionOrderApi.getStats(currentParams);
      if (statsRes) {
        const s = statsRes.data ?? statsRes;
        setStats({
          Total: s.total ?? s.Total ?? 0,
          InProgress: s.inProgress ?? s.InProgress ?? 0,
          Completed: s.completed ?? s.Completed ?? 0,
          Stopped: s.stopped ?? s.Stopped ?? 0
        });
      }
    } catch {
      message.error('Lỗi tải dữ liệu trạng thái sản xuất');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    productionOrderApi.getFilters().then((res: any) => {
      const d = res?.data ?? res;
      setProcessAreas(d?.processAreas ?? d?.ProcessAreas ?? []);
      setShifts(d?.shifts ?? d?.Shifts ?? []);
    });
  }, []);

  // Debounce gọi API khi params thay đổi
  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchData(params);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [fetchData, params]);

  const onFilterChange = useCallback((key: string, value: any) => {
    setParams(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1 // Reset về trang 1 khi lọc
    }));
  }, []);

  const onPageChange = useCallback((page: number, pageSize: number) => {
    setParams(prev => ({ ...prev, page, limit: pageSize }));
  }, []);

  const filterConfig: FilterItem[] = useMemo(() => [
    {
      type: 'search',
      key: 'searchQuery',
      placeholder: 'Tìm mã lệnh SX, mã sản phẩm...',
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
      options: processAreas.map(a => ({ value: a, label: a })),
    },
    {
      type: 'checkboxSelect',
      key: 'shifts',
      placeholder: 'Ca làm việc',
      minWidth: 160,
      options: shifts.map(s => ({ value: s, label: s })),
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
  ], [processAreas, shifts]);

  return {
    stats,
    data,
    loading,
    params,
    total,
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