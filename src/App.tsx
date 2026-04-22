import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import ProductionOrders from './pages/ProductionOrders';
import ProductionStatus from './pages/ProductionStatus';
import ProductionOrderDetail from './pages/ProductionOrderDetail';
import ConsumptionLog from './pages/ConsumptionLog';

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          colorBgContainer: '#ffffff',
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="production-status" element={<ProductionStatus />} />
            <Route path="production-orders" element={<ProductionOrders />} />
            <Route path="production-status/:id" element={<ProductionOrderDetail />} />
            <Route path="products" element={<Products />} />
            <Route path="recipes" element={<Recipes />} />
            <Route path="recipes/:id" element={<RecipeDetail />} />
            <Route path="consumption-log" element={<ConsumptionLog />} />
            <Route path="settings" element={<div>Tính năng đang phát triển</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
