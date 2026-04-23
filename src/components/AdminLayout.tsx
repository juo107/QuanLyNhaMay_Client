import {
  BarChartOutlined,
  ContainerOutlined,
  ExperimentOutlined,
  HistoryOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  OrderedListOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Button, Drawer, Layout, Menu, theme, Typography } from 'antd';
import React, { useState } from 'react';
import logo from '../assets/Logo_bieu tuong kem ten.png';
import { useResponsive } from '../hooks/useResponsive';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const menuItems = [
  { key: '/production-status', icon: <BarChartOutlined />, label: 'Trạng thái SX' },
  { key: '/production-orders', icon: <OrderedListOutlined />, label: 'Lệnh sản xuất' },
  { key: '/products', icon: <ContainerOutlined />, label: 'Sản phẩm' },
  { key: '/recipes', icon: <ExperimentOutlined />, label: 'Công thức' },
  { key: '/consumption-log', icon: <HistoryOutlined />, label: 'Nhật ký tiêu thụ' },
]

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isMobile } = useResponsive()

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const navigate = useNavigate()
  const location = useRouterState({ select: (s) => s.location })

  const siderWidth = collapsed ? 80 : 220

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate({ to: key })
    if (isMobile) setMobileOpen(false) // đóng drawer sau khi chọn menu
  }

  const MenuContent = (
    <>
      <div className="h-24 flex items-center justify-center p-2 mb-4 overflow-hidden">
        <img
          src={logo}
          alt="Logo"
          className={`transition-all duration-300 ${collapsed && !isMobile ? 'h-10 w-10 object-contain' : 'h-20 w-full object-contain px-2'
            }`}
        />
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={handleMenuClick}
        className="border-none"
        items={menuItems}
      />
    </>
  )

  return (
    <Layout className="h-screen overflow-hidden">

      {/* Desktop — Sider cố định */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="light"
          className="shadow-md"
          width={220}
          style={{
            position: 'fixed',
            left: 0, top: 0, bottom: 0,
            height: '100vh',
            zIndex: 20,
          }}
        >
          {MenuContent}
        </Sider>
      )}

      {/* Mobile — Drawer overlay */}
      {isMobile && (
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          width={220}
          styles={{ body: { padding: 0 } }}
          closable={false}
        >
          {MenuContent}
        </Drawer>
      )}

      {/* Main content */}
      <Layout style={{
        marginLeft: isMobile ? 0 : siderWidth, // mobile không margin
        transition: 'all 0.2s'
      }}>
        <Header
          style={{ padding: 0, background: colorBgContainer }}
          className="flex items-center justify-between px-4 shadow-sm z-10"
        >
          <div className="flex items-center gap-2">
            <Button
              type="text"
              icon={
                isMobile
                  ? <MenuUnfoldOutlined />  // mobile → toggle drawer
                  : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
              }
              onClick={() => isMobile ? setMobileOpen(true) : setCollapsed(!collapsed)}
              className="text-lg w-12 h-12 flex items-center justify-center"
            />
            <div className="h-8 w-[1px] bg-gray-200 mx-1" />
            <Title
              level={isMobile ? 5 : 4}
              className="!mb-0 text-[#5b4ce8] whitespace-nowrap ml-2"
            >
              {isMobile ? 'Nhà Máy' : 'Quản Lý Nhà Máy'}
            </Title>
          </div>
        </Header>

        <Content
          className="overflow-auto"
          style={{ height: 'calc(100vh - 64px)' }}
        >
          <div
            className={`min-h-full ${isMobile ? 'p-3' : 'p-6'}`}
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
  )
}

export default AdminLayout