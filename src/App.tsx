import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { ToastProvider } from './context/ToastContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ConfigProvider
          locale={viVN}
          theme={{
            token: {
              colorPrimary: '#1677ff',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              borderRadius: 8,
              colorBgContainer: '#ffffff',
              colorBgLayout: '#f8fafc',
            },
          }}
        >
          <RouterProvider router={router} />
        </ConfigProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
