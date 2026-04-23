import React from 'react';
import { useParams, useNavigate, useRouterState } from '@tanstack/react-router';
import { Card, Descriptions, Tag, Button, Tabs, Spin, Typography, Breadcrumb } from 'antd';
import { ArrowLeftOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import BatchesTab from '../components/ProductionOrderDetail/BatchesTab';
import MaterialsTab from '../components/ProductionOrderDetail/MaterialsTab';
import { formatUnit } from '../utils/format';
import { useProductionOrderDetail } from '../hooks/useProductionOrderDetail';
import { useResponsive } from '../hooks/useResponsive';

const { Title, Text, Link } = Typography;
const { Item } = Descriptions;

const ProductionOrderDetail: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();
  const { id } = useParams({ from: '/production-status/$id' });
  const navigate = useNavigate();
  const routerState = useRouterState();
  const isFromStatus = routerState.location.pathname.startsWith('/production-status');

  const {
    loading,
    batchLoading,
    order,
    batches,
    activeTab,
    setActiveTab,
    isHeaderExpanded,
    setIsHeaderExpanded,
    batchFilter,
    setBatchFilter,
  } = useProductionOrderDetail(id);

  if (loading && !order) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Spin size="large" description="Đang tải thông tin lệnh..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center mt-10">
        <Typography.Title level={4} type="danger">Không tìm thấy Lệnh Sản Xuất</Typography.Title>
        <Button onClick={() => navigate({ to: '..' })}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { title: 'Trang chủ', href: '/' },
          {
            title: isFromStatus ? 'Trạng thái sản xuất' : 'Lệnh sản xuất',
            href: isFromStatus ? '/production-status' : '/production-orders'
          },
          { title: `Chi tiết ${isFromStatus ? 'Trạng thái' : 'Lệnh sản xuất'} - ${id}` },
        ]}
      />
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
        {/* Main Header Row */}
        <div className="p-6 border-b border-gray-50 flex flex-wrap justify-between items-start gap-4 bg-gradient-to-r from-white to-gray-50/30">
          <div className="flex items-start gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate({ to: '..' })}
              className="mt-1 shadow-sm border-gray-100 hover:text-[#5b4ce8] hover:border-[#5b4ce8]"
            />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Title level={3} className="!mb-0 text-[#5b4ce8] tracking-tight">
                  {order.productionOrderNumber || '-'}
                </Title>
                <div className="flex items-center gap-2">
                  {order.status === 1 && <Tag color="blue" className="rounded-full px-3 py-0.5 m-0 border-none bg-blue-50 text-blue-600 font-medium">Đang chạy</Tag>}
                  {order.status === -1 && <Tag color="error" className="rounded-full px-3 py-0.5 m-0 border-none bg-red-50 text-red-600 font-medium">Đã hủy</Tag>}
                  {order.status === 2 && <Tag color="success" className="rounded-full px-3 py-0.5 m-0 border-none bg-green-50 text-green-600 font-medium">Hoàn thành</Tag>}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Text className="text-[16px] font-bold text-gray-800">
                    {order.productCode}
                  </Text>
                  <Text className="text-[16px] text-gray-600 font-medium">
                    - {order.productName}
                  </Text>
                </div>
                <Text className="text-gray-400 font-medium" style={{ fontSize: '12px' }}>
                  Hệ thống Quản lý Sản xuất & Trạng thái Chi tiết
                </Text>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-white p-3 rounded-xl border border-gray-50 shadow-inner">
            <div className="flex flex-col items-center px-4">
              <Text className="text-gray-400 uppercase font-bold tracking-widest mb-1" style={{ fontSize: '10px' }}>Sản lượng</Text>
              <Text className="font-bold text-gray-800" style={{ fontSize: '18px' }}>
                {order.quantity || 0} <span className="text-gray-400 text-xs font-normal ml-1">{formatUnit(order.unitOfMeasurement)}</span>
              </Text>
            </div>
            <Button
              type="text"
              icon={isHeaderExpanded ? <UpOutlined /> : <DownOutlined />}
              onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
              className="text-gray-400 hover:text-[#5b4ce8] hover:bg-blue-50 h-10 w-10 rounded-lg"
            />
          </div>
        </div>

        {/* Expandable Info Grid */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isHeaderExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-6 bg-gray-50/30 overflow-x-auto">
            <Descriptions 
              bordered 
              column={isMobile ? 1 : isTablet ? 2 : 3} 
              size="middle" 
              className={`bg-white rounded-lg shadow-sm ${isMobile ? 'w-full' : 'min-w-[800px]'}`}
              styles={{ label: { fontWeight: 'bold', color: '#6b7280', width: '140px' }, content: { color: '#374151', fontWeight: '500' } }}
            >
              {/* Hàng 1 */}
              <Item label="Ca Làm Việc">
                <Tag className="m-0 font-bold bg-gray-100 text-gray-700 border-none px-3 py-0.5">{order.shift || '-'}</Tag>
              </Item>
              <Item label="Dây Chuyền">{order.productionLine || '-'}</Item>
              <Item label="Khu Vực">{order.processArea || '-'}</Item>

              {/* Hàng 2 */}
              <Item label="Mã Lô (Lot)">{order.lotNumber || '-'}</Item>
              <Item label="Mã Công Thức">
                <Link
                  className="!text-[#5b4ce8] font-bold hover:underline"
                  onClick={() => order.recipeDetailsId && navigate({ to: '/recipes/$id', params: { id: String(order.recipeDetailsId) } })}
                >
                  {order.recipeCode || '-'}
                </Link>
              </Item>
              <Item label="Phiên Bản">
                <Link
                  className="!text-blue-500 font-bold hover:underline"
                  onClick={() => order.recipeDetailsId && navigate({ to: '/recipes/$id', params: { id: String(order.recipeDetailsId) } })}
                >
                  v{order.recipeVersion || '7.00'}
                </Link>
              </Item>

              {/* Hàng 3 */}
              <Item label="Tên Công Thức">{order.recipeName || '-'}</Item>
              <Item label="TG Bắt Đầu">
                <span className="text-gray-700">{order.plannedStart ? dayjs(order.plannedStart).format('DD/MM/YYYY HH:mm') : '-'}</span>
              </Item>
              <Item label="TG Kết Thúc">
                <span className="text-gray-700">{order.plannedEnd ? dayjs(order.plannedEnd).format('DD/MM/YYYY HH:mm') : '-'}</span>
              </Item>
            </Descriptions>
          </div>
        </div>
      </div>

      <Card variant="borderless" className="shadow-sm" styles={{ body: { paddingTop: 0 } }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          destroyOnHidden={true}
          items={[
            {
              key: 'batches',
              label: 'Lô Sản Xuất (Batches)',
              children: activeTab === 'batches' ? (
                <BatchesTab
                  batches={batches}
                  loading={batchLoading}
                  onViewMaterials={(batchCode) => {
                    setBatchFilter(batchCode || "");
                    setActiveTab('materials');
                  }}
                />
              ) : null
            },
            {
              key: 'materials',
              label: 'Tiêu Hao Vật Liệu (Materials)',
              children: activeTab === 'materials' ? (
                <MaterialsTab
                  order={order}
                  batches={batches}
                  batchFilter={batchFilter}
                  onClearFilter={() => setBatchFilter(null)}
                  onChangeBatchFilter={(code) => setBatchFilter(code)}
                />
              ) : null
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default ProductionOrderDetail;