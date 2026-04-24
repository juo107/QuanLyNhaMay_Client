import {
  AppstoreOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { Button, Card, Col, Empty, Modal, Pagination, Radio, Row, Tag, Typography } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import CardCommon from '../components/CardCommon';
import FilterSearchBar from '../components/FilterSearchBar';
import ProductionOrderDetailTable from '../components/ProductionStatus/ProductionOrderDetailTable';
import { getProductionStatusColumns } from '../components/ProductionStatus/ProductionStatusColumns';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import { useProductionStatus } from '../hooks/useProductionStatus';
import { useResponsive } from '../hooks/useResponsive';
import type { IProductionOrder } from '../types/productionOrderTypes';
import './ProductionStatus.css';

const { Text, Title } = Typography;

const ProductionStatus: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();
  const navigate = useNavigate();
  const {
    stats,
    data,
    loading,
    params,
    total,
    viewMode,
    setViewMode,
    isModalOpen,
    setIsModalOpen,
    selectedOrder,
    setSelectedOrder,
    onFilterChange,
    onPageChange,
    filterConfig,
  } = useProductionStatus();

  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['productionStatus'] });
    await queryClient.invalidateQueries({ queryKey: ['productionStatusStats'] });
  };

  const onShowDetail = (record: IProductionOrder) => {
    setSelectedOrder(record);
    setIsModalOpen(true);
  };

  const columns = useMemo(() => getProductionStatusColumns(navigate, onShowDetail), [navigate, onShowDetail]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Trạng Thái Sản Xuất</h2>
        </div>
        <Radio.Group
          value={viewMode}
          onChange={e => setViewMode(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          className="shadow-sm"
        >
          <Radio.Button value="table"><UnorderedListOutlined /></Radio.Button>
          <Radio.Button value="card"><AppstoreOutlined /></Radio.Button>
        </Radio.Group>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Tổng Lệnh SX"
            value={stats.Total}
            icon={<FileTextOutlined />}
            color="#1677ff"
            subText="Tổng số lệnh ghi nhận"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Đang Chạy"
            value={stats.InProgress}
            icon={<PlayCircleOutlined />}
            color="#fa8c16"
            subText="Lệnh đang hoạt động"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Đang Chờ"
            value={stats.Stopped}
            icon={<ClockCircleOutlined />}
            color="#1890ff"
            subText="Lệnh trong hàng đợi"
          />
        </Col>
      </Row>

      <Card variant="borderless" className="shadow-sm">
        <FilterSearchBar
          filters={filterConfig}
          values={params as Record<string, any>}
          onChange={onFilterChange}
          onRefresh={handleRefresh}
        />

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Text type="secondary">Đang tải dữ liệu...</Text>
          </div>
        ) : viewMode === 'table' ? (
          <Table
            rowKey="productionOrderId"
            data={data}
            columns={columns}
            isLoading={loading}
            totalPages={Math.ceil(total / (params.limit || 20))}
            currentPage={params.page}
            pageSize={params.limit}
            onPageChange={onPageChange}
            onRow={(record: IProductionOrder) => ({
              onClick: () => onShowDetail(record),
              className: 'cursor-pointer hover:bg-gray-50 transition-colors',
            })}
          />
        ) : data.length > 0 ? (
          <>
            <Row gutter={[20, 20]} className="mt-6 flex flex-wrap">
              {data.map((record: IProductionOrder) => {
                const isRunning = record.status === 1;
                const statusText = isRunning ? 'Đang chạy' : 'Đang chờ';
                const statusColor = isRunning ? '#fa8c16' : '#1677ff';
                const statusIcon = isRunning ? <PlayCircleOutlined /> : <ClockCircleOutlined />;

                return (
                  <Col xs={24} sm={12} md={12} lg={8} xl={6} key={record.productionOrderId} style={{ display: 'flex' }}>
                    <CardCommon
                      title={record.productionOrderNumber}
                      onTitleClick={() => navigate({ to: '/production-status/$id', params: { id: String(record.productionOrderId) }, search: (prev: any) => prev })}
                      statusText={statusText}
                      statusColor={statusColor}
                      statusIcon={statusIcon}
                      productCode={record.productCode}
                      productName={record.productName}
                      subInfo={`${record.quantity} ${record.unitOfMeasurement}`}
                      currentBatch={Number(record.currentBatch)}
                      totalBatch={Number(record.totalBatches)}
                      progress={(Number(record.totalBatches) || 0) > 0 ? (Number(record.currentBatch || 0) / Number(record.totalBatches || 1)) * 100 : 0}
                      details={[
                        { label: 'Công thức', value: record.recipeCode },
                        { label: 'Lô sx', value: record.lotNumber },
                        { label: 'Ca', value: record.shift },
                        { label: 'Process Area', value: record.processArea },
                        { label: 'Tổng batch', value: record.currentBatch },
                        {
                          label: 'Lịch trình', span: 2, value: (
                            <div className="flex justify-between items-center w-full">
                              <Tag className="bg-orange-50 border-orange-100 text-orange-600 !m-0">
                                {record.plannedStart ? dayjs(record.plannedStart).format('DD/MM/YYYY') : '-'}
                              </Tag>
                            </div>
                          )
                        }
                      ]}
                      onActionClick={() => onShowDetail(record)}
                    />
                  </Col>
                );
              })}
            </Row>
            <div className="mt-8 flex justify-end">
              <Pagination
                current={params.page}
                pageSize={params.limit}
                total={total}
                onChange={onPageChange}
                showSizeChanger={false}
              />
            </div>
          </>
        ) : (
          <div className="py-20 flex justify-center">
            <Empty description="Không có dữ liệu lệnh sản xuất" />
          </div>
        )}
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2 border-b pb-3 mb-0">
            <Title level={4} style={{ margin: 0, color: '#5b4ce8' }}>Chi Tiết Lệnh Sản Xuất</Title>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="full" type="primary" className="bg-[#5b4ce8]" onClick={() => {
            setIsModalOpen(false);
            if (selectedOrder) navigate({ to: '/production-status/$id', params: { id: String(selectedOrder.productionOrderId) }, search: (prev: any) => prev });
          }}>
            Xem Chi Tiết Đầy Đủ
          </Button>,
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={isMobile ? '100%' : isTablet ? 800 : 1000}
        centered
        className="premium-modal"
      >
        <div className="py-4">
          {selectedOrder && <ProductionOrderDetailTable selectedOrder={selectedOrder} />}
        </div>
      </Modal>
    </div>
  );
};

export default ProductionStatus;