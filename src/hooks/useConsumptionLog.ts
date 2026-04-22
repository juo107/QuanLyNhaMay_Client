import { useState, useCallback, useEffect, useMemo } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { consumptionApi } from '../api/consumptionApi';
import type { IConsumptionRecord, IConsumptionSearchParams } from '../types/consumption';
import type { FilterItem } from '../components/FilterSearchBar';

export const useConsumptionLog = () => {
  const [data, setData] = useState<IConsumptionRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 1. Định nghĩa initialParams (Không cần useMemo vì dùng cho useState)
  const initialParams: IConsumptionSearchParams = {
    page: 1,
    limit: 20,
    dateFrom: dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    dateTo: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
    productionOrderNumber: undefined,
    batchCode: undefined,
    ingredientCode: undefined,
    shift: undefined,
    respone: undefined,
  };

  // 2. Chuyển useUrlState sang useState thông thường
  const [params, setParams] = useState<IConsumptionSearchParams>(initialParams);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IConsumptionRecord | null>(null);

  const fetchData = useCallback(async (currentParams: IConsumptionSearchParams) => {
    setLoading(true);
    try {
      const res: any = await consumptionApi.search(currentParams);
      if (res) {
        const rawItems = res.items ?? res.Items ?? res.data?.items ?? res.data?.Items ?? (Array.isArray(res) ? res : []);
        setData(Array.isArray(rawItems) ? rawItems : []);
      }

      const statsRes: any = await consumptionApi.getStats(currentParams);
      if (statsRes) {
        const totalCount = statsRes.total ?? statsRes.Total ?? statsRes.data?.total ?? statsRes.data?.Total ?? 0;
        setTotal(totalCount);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu nhật ký:', err);
      message.error('Không thể tải dữ liệu nhật ký tiêu hao');
    } finally {
      setLoading(false);
    }
  }, []);

  // Giữ nguyên logic debounce fetch khi params thay đổi
  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchData(params);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [fetchData, params]);

  const onFilterChange = (key: string, value: any) => {
    setParams(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1 // Luôn về trang 1 khi thay đổi bộ lọc
    }));
  };

  const onPageChange = (page: number, pageSize: number) => {
    setParams(prev => ({ ...prev, page, limit: pageSize }));
  };

  const showDetail = (record: IConsumptionRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const filterConfig: FilterItem[] = useMemo(() => [
    {
      type: 'dateRange',
      key: ['dateFrom', 'dateTo'],
      placeholder: ['Từ ngày', 'Đến ngày'],
    },
    {
      type: 'search',
      key: 'productionOrderNumber',
      placeholder: 'Tìm Lệnh Sản Xuất...',
      width: 200,
    },
    {
      type: 'search',
      key: 'batchCode',
      placeholder: 'Tìm Mã Lô (Batch)...',
      width: 180,
    },
    {
      type: 'search',
      key: 'ingredientCode',
      placeholder: 'Tìm Mã Vật Liệu...',
      width: 180,
    },
    {
      type: 'select',
      key: 'shift',
      placeholder: 'Ca làm việc',
      width: 130,
      options: [
        { label: 'Ca 1', value: 'Ca 1' },
        { label: 'Ca 2', value: 'Ca 2' },
        { label: 'Ca 3', value: 'Ca 3' },
      ],
    },
    {
      type: 'checkboxSelect',
      key: 'respone',
      placeholder: 'Kết quả',
      minWidth: 140,
      options: [
        { value: 'Success', label: 'Thành công' },
        { value: 'Failed', label: 'Lỗi' },
      ],
    },
  ], []);

  return {
    data,
    total,
    loading,
    params,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedRecord,
    onFilterChange,
    onPageChange,
    showDetail,
    filterConfig,
    fetchData,
  };
};