import {
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { Table as AntdTable, Button, Card, Col, Pagination, Radio, Row, Tag, Typography } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import CardCommon from '../components/CardCommon';
import FilterSearchBar from '../components/FilterSearchBar';
import Modal from '../components/Modal';
import { getProductionOrderColumns } from '../components/ProductionOrder/ProductionOrderColumns';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import { useProductionOrders } from '../hooks/useProductionOrders';
import { useResponsive } from '../hooks/useResponsive';
import type { IProductionOrder } from '../types/productionOrderTypes';
import { formatUnit } from '../utils/format';

const { Text } = Typography;

const ProductionOrders: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    viewMode,
    setViewMode,
    stats,
    data,
    loading,
    total,
    params,
    isModalOpen,
    setIsModalOpen,
    selectedOrder,
    batches,
    batchLoading,
    onFilterChange,
    onPageChange,
    showDetail,
    filterConfig,
  } = useProductionOrders();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    // Invalidate queries to force a fresh fetch from server (bypassing cache)
    await queryClient.invalidateQueries({ queryKey: ['productionOrders'] });
    await queryClient.invalidateQueries({ queryKey: ['productionOrdersStats'] });
  };

  const columns = useMemo(() => getProductionOrderColumns(showDetail), [showDetail]);

  const infoItem = (label: string, value: any) => (
    <div className="flex flex-col mb-4 px-2">
      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</span>
      <span className="text-[13px] text-gray-800 font-medium">{value || '-'}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Lệnh Sản Xuất</h2>
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
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng Lệnh SX (PO)"
            value={stats.total}
            icon={<AppstoreOutlined />}
            color="#1677ff"
            subText="Tổng số lệnh trong hệ thống"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Bình thường"
            value={stats.inProgress}
            icon={<PlayCircleOutlined />}
            color="#fa8c16"
            subText="Lệnh đang hoạt động"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Hoàn thành"
            value={stats.completed}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
            subText="Lệnh đã hoàn thành"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Đã hủy"
            value={stats.stopped}
            icon={<StopOutlined />}
            color="#1677ff"
            subText="Lệnh đã bị hủy bỏ"
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
              onClick: () => showDetail(record),
              style: { cursor: 'pointer' },
            })}
          />
        ) : data.length > 0 ? (
          <>
            <Row gutter={[20, 20]} className="mt-6 flex flex-wrap">
              {data.map((record: IProductionOrder) => {
                const isCancelled = record.status === -1;
                const statusText = isCancelled ? 'Đã hủy' : 'Bình thường';
                const statusColor = isCancelled ? '#ff4d4f' : '#52c41a';
                const statusIcon = isCancelled ? <CloseCircleOutlined /> : <CheckCircleOutlined />;

                return (
                  <Col xs={24} sm={12} md={12} lg={8} xl={6} key={record.productionOrderId} style={{ display: 'flex' }}>
                    <CardCommon
                      title={record.productionOrderNumber}
                      statusText={statusText}
                      statusColor={statusColor}
                      statusIcon={statusIcon}
                      productCode={record.productCode}
                      productName={record.productName || (record as any).ProductName || (record as any).itemName || (record as any).ItemName || (record as any).productDescription || (record as any).ProductDescription}
                      subInfo={`${record.quantity} ${record.unitOfMeasurement}`}
                      currentBatch={Number(record.currentBatch)}
                      totalBatch={Number(record.totalBatches)}
                      progress={record.status === 2 ? 100 : ((Number(record.totalBatches) || 0) > 0 ? (Number(record.currentBatch || 0) / Number(record.totalBatches || 1)) * 100 : 0)}
                      onActionClick={() => showDetail(record)}
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
                              <Tag color="red" className="!m-0 opacity-50">Hạn: N/A</Tag>
                            </div>
                          )
                        },
                      ]}
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
                showSizeChanger
                showTotal={(totalCount) => `Tổng cộng ${totalCount} lệnh`}
              />
            </div>
          </>
        ) : (
          <div className="py-20 flex justify-center items-center">
            <Text type="secondary">Không tìm thấy lệnh sản xuất nào</Text>
          </div>
        )}
      </Card>

      <Modal
        title="Chi tiết Lệnh Sản Xuất"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width={isMobile ? '100%' : isTablet ? 600 : 750}
        hideFooter
      >
        {selectedOrder && (
          <div className="px-2 py-4">
            <Row gutter={[32, 0]}>
              <Col xs={24} sm={12}>
                {infoItem('Mã Lệnh SX', selectedOrder.productionOrderNumber)}
                {infoItem('Dây Chuyền', selectedOrder.productionLine)}
                {infoItem('Phiên bản công thức', selectedOrder.recipeVersion)}
                {infoItem('Số Lượng', selectedOrder.quantity?.toLocaleString())}
                {infoItem('Ngày bắt đầu', selectedOrder.plannedStart ? dayjs(selectedOrder.plannedStart).format('DD/MM/YYYY') : '-')}
                {infoItem('Ca làm', selectedOrder.shift)}
                {infoItem('Plant', selectedOrder.plant)}
                {infoItem('Shop Floor', selectedOrder.shopfloor || 'WP2')}
              </Col>
              <Col xs={24} sm={12}>
                {infoItem('Mã Sản Phẩm', `${selectedOrder.productCode} - ${selectedOrder.productName}`)}
                {infoItem('Công thức', `${selectedOrder.recipeCode} - ${selectedOrder.recipeName}`)}
                {infoItem('Lô SX', selectedOrder.lotNumber)}
                {infoItem('Đơn vị', formatUnit(selectedOrder.unitOfMeasurement))}
                {infoItem('Ngày kết thúc', selectedOrder.plannedEnd ? dayjs(selectedOrder.plannedEnd).format('DD/MM/YYYY') : '-')}
                {infoItem('Trạng thái', selectedOrder.status === -1 ? 'Đang chạy' : 'Đang chờ')}
                {infoItem('Process Area', selectedOrder.processArea)}
              </Col>
            </Row>

            <div className="mt-6 border-t pt-6">
              <h4 className="text-[16px] font-bold text-gray-800 mb-4">Danh sách Batches</h4>
              <AntdTable
                dataSource={batches}
                loading={batchLoading}
                pagination={false}
                rowKey="batchId"
                size="middle"
                columns={[
                  { title: 'Batch Number', dataIndex: 'batchNumber', key: 'batchNumber', align: 'center' },
                  { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'center', render: (val) => val?.toLocaleString() },
                  { title: 'UOM', dataIndex: 'unitOfMeasurement', key: 'unitOfMeasurement', align: 'center' },
                  { title: 'Status', dataIndex: 'status', key: 'status', align: 'center' }
                ]}
              />
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={() => setIsModalOpen(false)}
                size="large"
                className="bg-gray-100 hover:bg-gray-200 border-none text-gray-700 px-8 rounded-md font-medium"
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductionOrders;
