import { useState, useCallback, useEffect, useMemo } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { productionOrderApi } from '../api/productionOrderApi';
import type { IProductionStatusParams } from '../api/productionOrderApi';
import type { IProductionOrder } from '../types/productionOrderTypes';
import type { FilterItem } from '../components/FilterSearchBar';

export const useProductionOrders = () => {
  const [data, setData] = useState<IProductionOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Định nghĩa initialParams
  const initialParams: IProductionStatusParams = {
    page: 1,
    limit: 20,
    dateFrom: dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    dateTo: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
    searchQuery: undefined,
    pos: undefined,
    processAreas: undefined,
    shifts: undefined,
    statuses: undefined,
  };

  // 2. Thay thế useUrlState bằng useState cho params
  const [params, setParams] = useState<IProductionStatusParams>(initialParams);

  // 3. Thay thế useUrlState bằng useState cho viewMode
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0, stopped: 0 });
  const [total, setTotal] = useState(0);
  const [poInput, setPoInput] = useState(params.pos || '');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IProductionOrder | null>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);

  const fetchData = useCallback(async (currentParams: IProductionStatusParams) => {
    setLoading(true);
    try {
      const res: any = await productionOrderApi.search(currentParams);
      if (res) {
        const items = res.items ?? res.Items ?? res.data?.items ?? res.data?.Items ?? (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
        setData(items);
        setTotal(res.total ?? res.Total ?? res.data?.total ?? res.data?.Total ?? 0);
      }

      const statsRes: any = await productionOrderApi.getStats(currentParams);
      if (statsRes) {
        const s = statsRes.data ?? statsRes;
        setStats({
          total: s.total ?? s.Total ?? 0,
          inProgress: s.inProgress ?? s.InProgress ?? 0,
          completed: s.completed ?? s.Completed ?? 0,
          stopped: s.stopped ?? s.Stopped ?? 0
        });
      }
    } catch {
      message.error('Không thể tải danh sách lệnh sản xuất');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(params);
  }, [fetchData, params]);

  const onFilterChange = (key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const onPageChange = (page: number, pageSize: number) => {
    setParams(prev => ({ ...prev, page, limit: pageSize }));
  };

  const onPoSearch = (val: string) => {
    setParams(prev => ({ ...prev, pos: val || undefined, page: 1 }));
  };

  const showDetail = async (record: IProductionOrder) => {
    setSelectedOrder(record);
    setIsModalOpen(true);
    setBatchLoading(true);
    try {
      const res: any = await productionOrderApi.getBatches(record.productionOrderId);
      const items = res?.items ?? res?.Items ?? res?.data?.items ?? res?.data?.Items ?? (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setBatches(items);
    } catch {
      setBatches([]);
    } finally {
      setBatchLoading(false);
    }
  };

  const filterConfig: FilterItem[] = useMemo(() => [
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
      options: [
        { value: 'P01', label: 'P01' },
        { value: 'P02', label: 'P02' },
      ],
    },
    {
      type: 'checkboxSelect',
      key: 'shifts',
      placeholder: 'Ca làm',
      minWidth: 120,
      options: [
        { value: 'Ca 1', label: 'Ca 1' },
        { value: 'Ca 2', label: 'Ca 2' },
        { value: 'Ca 3', label: 'Ca 3' },
      ],
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
    data,
    loading,
    total,
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