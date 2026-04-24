import { useCallback } from 'react';

/**
 * Hook dùng chung để quản lý logic lọc và phân trang đồng bộ với URL
 * @param navigate Hàm navigate từ TanStack Router
 * @param setParams (Tùy chọn) Nếu muốn tùy biến cách set params
 */
export const useTableFilters = (navigate: any) => {
  
  const onFilterChange = useCallback((keyOrUpdates: string | Record<string, any>, value?: any) => {
    navigate({
      search: (prev: any) => {
        const updates = typeof keyOrUpdates === 'string' 
          ? { [keyOrUpdates]: value } 
          : keyOrUpdates;
        
        const newParams = { ...prev, ...updates, page: 1 };
        
        // Dọn dẹp URL: Xóa các tham số trống
        Object.keys(updates).forEach(key => {
          const val = updates[key];
          if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
            delete (newParams as any)[key];
          }
        });
        
        return newParams;
      },
      replace: true,
    });
  }, [navigate]);

  const onPageChange = useCallback((page: number, pageSize?: number) => {
    navigate({
      search: (prev: any) => ({ 
        ...prev, 
        page, 
        limit: pageSize || prev.limit, 
        pageSize: pageSize || prev.pageSize 
      }),
      replace: true,
    });
  }, [navigate]);

  return {
    onFilterChange,
    onPageChange,
  };
};
