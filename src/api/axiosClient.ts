import axios from 'axios';
import { toastNative } from '../utils/toastManager';

const axiosClient = axios.create({
  baseURL: 'https://localhost:7103/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();

      Object.entries(params || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;

        if (Array.isArray(value)) {
          if (value.length === 0) return;
          searchParams.append(key, value.join(','));
          return;
        }

        searchParams.append(key, String(value));
      });

      return searchParams.toString();
    },
  },
});

axiosClient.interceptors.response.use(
  (response) => {
    const res = response.data;
    
    // Check for standardized ApiResponse structure (handle both camelCase and PascalCase)
    const code = res?.code ?? res?.Code;
    const data = res?.data ?? res?.Data;
    const msg = res?.message ?? res?.Message;

    if (res && typeof res === 'object' && code !== undefined && data !== undefined) {
      if (code === '200' || code === 200) {
        return data;
      }
      // If code is not 200, it's an API-level error
      toastNative.error(msg || 'API Error', 'Lỗi hệ thống');
      return Promise.reject(new Error(msg || 'API Error'));
    }
    
    // Fallback for raw responses or non-standard structures
    return res;
  },
  (error) => {
    const errorMsg = error.response?.data?.Message || error.response?.data?.message || error.message || 'Lỗi kết nối server';
    console.error('API Error:', errorMsg);
    // Use custom toast
    toastNative.error(errorMsg, 'Lỗi kết nối'); 
    throw error;
  }
);

export default axiosClient;
