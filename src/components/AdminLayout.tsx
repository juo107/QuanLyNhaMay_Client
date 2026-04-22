import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  ContainerOutlined,
  ExperimentOutlined,
  BarChartOutlined,
  OrderedListOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/Logo_bieu tuong kem ten.png';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const siderWidth = collapsed ? 80 : 220;
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout className="h-screen overflow-hidden">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        className="shadow-md"
        width={220}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          height: '100vh',
          zIndex: 20,
        }}
      >
        <div className="h-24 flex items-center justify-center p-2 mb-4 overflow-hidden">
          <img 
            src={logo} 
            alt="Logo" 
            className={`transition-all duration-300 ${collapsed ? 'h-10 w-10 object-contain' : 'h-20 w-full object-contain px-2'}`}
          />
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          className="border-none"
          items={[
            {
              key: '/production-status',
              icon: <BarChartOutlined />,
              label: 'Trạng thái SX',
            },
            {
              key: '/production-orders',
              icon: <OrderedListOutlined />,
              label: 'Lệnh sản xuất',
            },
            {
              key: '/products',
              icon: <ContainerOutlined />,
              label: 'Sản phẩm',
            },
            {
              key: '/recipes',
              icon: <ExperimentOutlined />,
              label: 'Công thức',
            },
            {
              key: '/consumption-log',
              icon: <HistoryOutlined />,
              label: 'Nhật ký tiêu thụ',
            },
          ]}
        />
      </Sider>
      <Layout style={{ marginLeft: siderWidth, transition: 'all 0.2s' }}>
        <Header style={{ padding: 0, background: colorBgContainer }} className="flex items-center justify-between px-4 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg w-12 h-12 flex items-center justify-center"
            />
            <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>
            <Title level={4} className="!mb-0 text-[#5b4ce8] whitespace-nowrap ml-2">
              Quản Lý Nhà Máy
            </Title>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700">Admin User</span>
          </div>
        </Header>
        <Content className="p-6 overflow-auto" style={{ height: 'calc(100vh - 64px)' }}>
          <div
            className="p-6 min-h-full"
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
