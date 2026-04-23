import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { consumptionApi } from '../api/consumptionApi';
import type { IConsumptionRecord, IConsumptionSearchParams } from '../types/consumption';
import type { FilterItem } from '../components/FilterSearchBar';
import { useSearch, useNavigate } from '@tanstack/react-router';

export const useConsumptionLog = () => {
  // 1. Quản lý trạng thái URL thông qua TanStack Router
  const params = useSearch({ from: '/consumption-log' });
  const navigate = useNavigate({ from: '/consumption-log' });

  // 2. Trạng thái debounce để giảm tần suất gọi API khi nhập liệu
  const [debouncedParams, setDebouncedParams] = useState(params);
  const debounceTimerRef = useRef<any>(null);

  // 3. Các trạng thái giao diện nội bộ
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IConsumptionRecord | null>(null);

  // Hiệu ứng Debounce: Chỉ cập nhật tham số gọi API sau 500ms ngừng thao tác
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedParams(params);
    }, 400);
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [params]);

  // Helper cập nhật Search Params lên URL
  const setParams = useCallback((updater: (prev: IConsumptionSearchParams) => IConsumptionSearchParams) => {
    navigate({
      search: (prev) => updater(prev as IConsumptionSearchParams),
      replace: true,
    });
  }, [navigate]);

  // Query: Lấy danh sách Nhật Ký Tiêu Thụ và Tổng số lượng (Stats) song song
  const { data: consumptionData, isLoading: loading, refetch: fetchData } = useQuery({
    queryKey: ['consumptionLog', debouncedParams],
    queryFn: async () => {
      const finalParams = {
        ...debouncedParams,
        dateFrom: debouncedParams.dateFrom || dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        dateTo: debouncedParams.dateTo || dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      };

      const cleanParams = Object.fromEntries(
        Object.entries(finalParams).filter(([_, v]) =>
          v !== undefined && v !== null && v !== '' && v !== 'undefined'
        )
      ) as unknown as IConsumptionSearchParams;

      // Gọi đồng thời cả dữ liệu và thống kê để tối ưu hóa thời gian chờ
      const [searchRes, statsRes] = await Promise.all([
        consumptionApi.search(cleanParams),
        consumptionApi.getStats(cleanParams)
      ]);

      const itemsData = searchRes.data ?? searchRes;
      const statsData = statsRes.data ?? statsRes;

      return {
        items: Array.isArray(itemsData) ? itemsData : (itemsData.items ?? itemsData.Items ?? []),
        total: statsData.total ?? statsData.Total ?? 0
      };
    },
    placeholderData: keepPreviousData, // Giữ lại dữ liệu cũ trong lúc tải dữ liệu mới để tránh bị "khựng"
    staleTime: 30000, // Caching dữ liệu trong 30 giây
  });

  // Query: Lấy danh sách Ca làm việc thực tế từ API dựa trên khoảng thời gian
  const { data: shiftOptions = [] } = useQuery({
    queryKey: ['consumptionShifts', params.dateFrom, params.dateTo],
    queryFn: async () => {
      const res: any = await consumptionApi.getShifts({
        dateFrom: params.dateFrom,
        dateTo: params.dateTo
      });
      const data = res.data ?? res;
      return Array.isArray(data) ? data : (data.items || []);
    },
    staleTime: 3600000, // Danh sách ca thường ít thay đổi, cache trong 1 giờ
  });

  // Xử lý thay đổi bộ lọc từ giao diện
  const onFilterChange = useCallback((key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value || undefined, page: 1 }));
  }, [setParams]);

  // Xử lý thay đổi trang và giới hạn hiển thị
  const onPageChange = useCallback((page: number, pageSize: number) => {
    setParams(prev => ({ ...prev, page, pageSize }));
  }, [setParams]);

  // Hiển thị Modal chi tiết cho một bản ghi tiêu thụ
  const showDetail = (record: IConsumptionRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  // Cấu hình các trường lọc cho FilterSearchBar
  const filterConfig: FilterItem[] = useMemo(() => [
    {
      type: 'dateRange',
      key: ['dateFrom', 'dateTo'],
      placeholder: ['Từ ngày', 'Đến ngày'],
    },
    {
      type: 'autocomplete',
      key: 'productionOrderNumber',
      table: 'ProductionOrders',
      column: 'ProductionOrderNumber,ProductCode',
      placeholder: 'Tìm Lệnh Sản Xuất, Mã SP...',
      width: 250,
    },
    {
      type: 'autocomplete',
      key: 'batchCode',
      table: 'MESMaterialConsumption',
      column: 'BatchCode',
      placeholder: 'Tìm Mã Lô (Batch)...',
      width: 180,
    },
    {
      type: 'autocomplete',
      key: 'ingredientCode',
      table: 'ProductMasters',
      column: 'ItemCode,ItemName',
      placeholder: 'Tìm Mã Vật Liệu, Tên...',
      width: 220,
    },
    {
      type: 'checkboxSelect',
      key: 'shift',
      placeholder: 'Ca làm việc',
      minWidth: 160,
      options: shiftOptions.map((s: any) => {
        const val = typeof s === 'object' ? (s.value || s.Value || s.shift || '') : s;
        return {
          label: val,
          value: val
        };
      }),
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
  ], [shiftOptions]);

  return {
    data: consumptionData?.items || [],
    total: consumptionData?.total || 0,
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