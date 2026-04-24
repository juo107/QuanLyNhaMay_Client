import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMemo } from 'react';
import type { IMESCompleteBatchParams } from '../api/mesCompleteBatchApi';
import { mesCompleteBatchApi } from '../api/mesCompleteBatchApi';
import type { FilterItem } from '../components/FilterSearchBar';
import { useTableFilters } from './useTableFilters';

export const useMESCompleteBatch = () => {
  const params = useSearch({ from: '/mes-complete-batch' });
  const navigate = useNavigate({ from: '/mes-complete-batch' });

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

  const { onFilterChange, onPageChange } = useTableFilters(navigate);

  // Helper function for natural sorting (handles strings with numbers correctly)
  const naturalSort = (a: string, b: string) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
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
        { value: 'Failed', label: 'Chưa gửi (Failed)' },
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
