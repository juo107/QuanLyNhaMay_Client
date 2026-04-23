import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import { mesCompleteBatchApi } from '../api/mesCompleteBatchApi';
import type { IMESCompleteBatchParams } from '../api/mesCompleteBatchApi';
import type { FilterItem } from '../components/FilterSearchBar';

export const useMESCompleteBatch = () => {
  const params = useSearch({ from: '/mes-complete-batch' });
  const navigate = useNavigate({ from: '/mes-complete-batch' });

  const setParams = useCallback((updater: (prev: any) => any) => {
    navigate({
      search: (prev) => updater(prev),
      replace: true,
    });
  }, [navigate]);

  const { data, isLoading: loading, refetch: fetchData } = useQuery({
    queryKey: ['mesCompleteBatch', params],
    queryFn: () => mesCompleteBatchApi.search(params as IMESCompleteBatchParams),
  });

  // Fetch unique batch numbers and machine codes for Select filters
  const { data: batchNumbers } = useQuery({
    queryKey: ['mesCompleteBatch', 'unique', 'BatchNumber'],
    queryFn: () => mesCompleteBatchApi.getUniqueValues('BatchNumber'),
    staleTime: 1000 * 60 * 5,
  });

  const { data: machineCodes } = useQuery({
    queryKey: ['mesCompleteBatch', 'unique', 'MachineCode'],
    queryFn: () => mesCompleteBatchApi.getUniqueValues('MachineCode'),
    staleTime: 1000 * 60 * 5,
  });

  const onFilterChange = useCallback((key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value || undefined, page: 1 }));
  }, [setParams]);

  const onPageChange = useCallback((page: number, pageSize: number) => {
    setParams(prev => ({ ...prev, page, limit: pageSize }));
  }, [setParams]);

  // Helper function for natural sorting (handles strings with numbers correctly)
  const naturalSort = (a: string, b: string) => {
    return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });
  };

  const filterConfig: FilterItem[] = useMemo(() => [
    {
      type: 'autocomplete',
      key: 'searchQuery',
      table: 'MESCompleteBatch',
      column: 'ProductionOrder,BatchNumber,ProductCode,MachineCode',
      placeholder: 'Tìm kiếm lệnh, lô, máy...',
      width: 250,
    },
    {
      type: 'select',
      key: 'batchNumber',
      placeholder: 'Số lô (Batch)',
      minWidth: 150,
      options: (batchNumbers || [])
        .sort(naturalSort)
        .map(val => ({ value: val, label: val })),
    },
    {
      type: 'select',
      key: 'machineCode',
      placeholder: 'Mã máy',
      minWidth: 130,
      options: (machineCodes || [])
        .sort(naturalSort)
        .map(val => ({ value: val, label: val })),
    },
    {
      type: 'dateRange',
      key: ['dateFrom', 'dateTo'],
      placeholder: ['Từ ngày', 'Đến ngày'],
    },
    {
      type: 'select',
      key: 'transferStatus',
      placeholder: 'Trạng thái truyền',
      minWidth: 160,
      options: [
        { value: 'Sent', label: 'Đã gửi (Sent)' },
        { value: 'Success', label: 'Thành công' },
        { value: 'Pending', label: 'Đang chờ' },
        { value: 'Error', label: 'Lỗi (Error)' },
      ],
    },
  ], [batchNumbers, machineCodes]);

  return {
    data: data?.data || [],
    total: data?.total || 0,
    loading,
    params,
    onFilterChange,
    onPageChange,
    filterConfig,
    fetchData,
  };
};
