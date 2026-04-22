import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Tabs, Spin, Typography, Breadcrumb } from 'antd';
import { ArrowLeftOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import BatchesTab from '../components/ProductionOrderDetail/BatchesTab';
import MaterialsTab from '../components/ProductionOrderDetail/MaterialsTab';
import { formatUnit } from '../utils/format';
import { useProductionOrderDetail } from '../hooks/useProductionOrderDetail';

const { Title, Text, Link } = Typography;
const { Item } = Descriptions;

const ProductionOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isFromStatus = location.pathname.startsWith('/production-status');

  const {
    loading,
    order,
    batches,
    activeTab,
    setActiveTab,
    isHeaderExpanded,
    setIsHeaderExpanded,
    batchFilter,
    setBatchFilter,
  } = useProductionOrderDetail(id);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center mt-10">
        <Typography.Title level={4} type="danger">Không tìm thấy Lệnh Sản Xuất</Typography.Title>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
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
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
            <div>
              <Title level={4} className="!mb-0 text-[#5b4ce8]">
                {order.productionOrderNumber || '-'}
              </Title>
              <div className="flex flex-col">
                <Text className="text-gray-800">
                  {order.productCode} - {order.productName}
                </Text>
                <Text className="text-gray-600" style={{ fontSize: '12px' }}>
                  Chi Tiết {isFromStatus ? 'Trạng Thái Sản Xuất' : 'Lệnh Sản Xuất'}
                </Text>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <Text className="text-gray-600 uppercase tracking-tight" style={{ fontSize: '11px' }}>Tiến độ lô</Text>
              <Text style={{ fontSize: '16px', color: '#5b4ce8' }}>
                {order.currentBatch || 0} / {order.totalBatches || 0}
              </Text>
            </div>
            <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>
            <div className="flex items-center gap-2">
              {order.status === 1 && <Tag color="blue" className="rounded-full px-4 py-1 m-0">Đang chạy</Tag>}
              {order.status === -1 && <Tag color="error" className="rounded-full px-4 py-1 m-0">Đã hủy</Tag>}
              {order.status === 2 && <Tag color="success" className="rounded-full px-4 py-1 m-0">Hoàn thành</Tag>}
            </div>
          </div>
        </div>

        <Card 
          bordered={false} 
          className="shadow-sm overflow-hidden border border-gray-100"
          title={<span className="text-base font-bold text-[#5b4ce8]">Thông tin chung</span>}
          extra={
            <Button 
              type="text" 
              icon={isHeaderExpanded ? <UpOutlined /> : <DownOutlined />} 
              onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
              className="text-[#5b4ce8] hover:bg-blue-50"
            />
          }
        >
          <Descriptions 
            bordered={false}
            layout="vertical"
            column={isHeaderExpanded ? { xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 } : { xxl: 3, xl: 3, lg: 3, md: 3, sm: 1, xs: 1 }} 
            size="small"
            labelStyle={{ 
              fontWeight: 'bold', 
              color: '#374151',
              fontSize: '14px',
              marginBottom: '4px'
            }}
            contentStyle={{
              fontSize: '15px',
              color: '#111827',
              paddingBottom: '16px',
              fontWeight: 'normal'
            }}
          >
            <Item label="Mã lệnh">
              <span className="text-gray-800">{order.productionOrderNumber || '-'}</span>
            </Item>
            <Item label="Sản Phẩm">
              <span className="text-gray-800">{order.productCode}</span>
              <span className="ml-2 text-gray-800">{order.productName}</span>
            </Item>
            <Item label="Ca Làm Việc">
              <Tag color="cyan" className="m-0 px-3 border-none font-medium bg-cyan-50 text-cyan-600">
                {order.shift || '-'}
              </Tag>
            </Item>
            
            {isHeaderExpanded && (
              <>
                <Item label="Dây Chuyền">{order.productionLine || '-'}</Item>
                <Item label="Công Thức (Recipe)">
                  <div className="flex flex-col">
                    <Link 
                      className="!p-0 !m-0 h-auto text-[#5b4ce8] text-[15px] hover:underline"
                      onClick={() => order.recipeDetailsId && navigate(`/recipes/${order.recipeDetailsId}`)}
                    >
                      {order.recipeCode}
                    </Link>
                    <Text className="text-gray-600" style={{ fontSize: '12px' }}>{order.recipeName}</Text>
                  </div>
                </Item>
                <Item label="Phiên Bản">{order.recipeVersion || '7.00'}</Item>
                <Item label="Mã Lô (LotNumber)">{order.lotNumber || '-'}</Item>
                <Item label="Sản Lượng (Planned Quantity)">
                  <Text>{order.quantity || 0} {formatUnit(order.unitOfMeasurement)}</Text>
                </Item>
                <Item label="TG Bắt Đầu Dự Kiến">
                  <span className="text-[15px] text-gray-800">{order.plannedStart ? dayjs(order.plannedStart).format('DD/MM/YYYY HH:mm') : '-'}</span>
                </Item>
                <Item label="TG Kết Thúc Dự Kiến">
                  <span className="text-[15px] text-gray-800">{order.plannedEnd ? dayjs(order.plannedEnd).format('DD/MM/YYYY HH:mm') : '-'}</span>
                </Item>
                <Item label="Khu Vực">{order.processArea || '-'}</Item>
              </>
            )}
          </Descriptions>
        </Card>

        <Card bordered={false} className="shadow-sm" bodyStyle={{ paddingTop: 0 }}>
          <Tabs 
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'batches',
                label: 'Lô Sản Xuất (Batches)',
                children: <BatchesTab 
                  batches={batches} 
                  loading={loading} 
                  onViewMaterials={(batchCode) => {
                    setBatchFilter(batchCode || "");
                    setActiveTab('materials');
                  }}
                />
              },
              {
                key: 'materials',
                label: 'Tiêu Hao Vật Liệu (Materials)',
                children: <MaterialsTab 
                  order={order} 
                  batches={batches} 
                  batchFilter={batchFilter}
                  onClearFilter={() => setBatchFilter(null)}
                />
              }
            ]} 
          />
        </Card>
      </div>
    </div>
  );
};

export default ProductionOrderDetail;