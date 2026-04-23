import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export const useSuggestions = (table: string, column: string) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  // Debounce searchText 300ms trước khi đưa vào TanStack Query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Sử dụng TanStack Query để quản lý caching và fetching
  const { data: options = [], isLoading: loading } = useQuery({
    queryKey: ['suggestions', table, column, debouncedSearchText],
    queryFn: async () => {
      if (!debouncedSearchText || debouncedSearchText.length < 1) return [];

      const response: any = await axiosClient.get(`/Common/suggestions`, {
        params: { table, column, q: debouncedSearchText }
      });

      if (Array.isArray(response)) {
        return response.map((item: any) => ({
          label: item.label ?? item.Label,
          value: item.value ?? item.Value
        }));
      }
      return [];
    },
    enabled: debouncedSearchText.length >= 1,
    staleTime: 5 * 60 * 1000, // Cache kết quả trong 5 phút
    gcTime: 10 * 60 * 1000,   // Giữ trong bộ nhớ cache 10 phút
  });

  return {
    options,
    loading,
    fetchSuggestions: setSearchText // Giữ nguyên tên hàm để không phải sửa các component khác
  };
};
