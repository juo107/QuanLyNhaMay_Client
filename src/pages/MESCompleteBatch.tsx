import {
  CheckCircleFilled,
  CloseCircleFilled,
  DatabaseFilled,
  SyncOutlined
} from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Card, Col, Row, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import type { IMESCompleteBatch } from '../api/mesCompleteBatchApi';
import FilterSearchBar from '../components/FilterSearchBar';
import { getMESCompleteBatchColumns } from '../components/MESCompleteBatch/MESCompleteBatchColumns';
import MESCompleteBatchDetail from '../components/MESCompleteBatch/MESCompleteBatchDetail';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import { useMESCompleteBatch } from '../hooks/useMESCompleteBatch';

const { Text } = Typography;

const MESCompleteBatch: React.FC = () => {
  const {
    data,
    total,
    loading,
    params,
    onFilterChange,
    onPageChange,
    filterConfig,
  } = useMESCompleteBatch();

  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['mesCompleteBatches'] });
  };

  const [selectedRecord, setSelectedRecord] = useState<IMESCompleteBatch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = useMemo(() => getMESCompleteBatchColumns(), []);

  // Tính toán stats dựa trên dữ liệu hiện tại
  const stats = useMemo(() => {
    const successCount = data.filter(i => (i.transferStatus || '').toLowerCase() === 'success' || (i.transferStatus || '').toLowerCase() === 'sent').length;
    const failedCount = data.filter(i => (i.transferStatus || '').toLowerCase() === 'error' || (i.transferStatus || '').toLowerCase() === 'failed').length;
    const pendingCount = data.filter(i => (i.transferStatus || '').toLowerCase() === 'pending' || (i.transferStatus || '').toLowerCase() === 'waiting').length;
    
    const successRate = total > 0 ? (successCount / data.length) * 100 : 0;

    return {
      total,
      success: successCount,
      failed: failedCount,
      pending: pendingCount,
      successRate: Math.round(successRate)
    };
  }, [data, total]);

  const handleRowClick = (record: IMESCompleteBatch) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Lịch Sử Hoàn Thành Lô</h2>
        </div>
        <div className="flex gap-2 text-right">
          <Text type="secondary" className="text-[12px] italic block">
            Click vào dòng để xem chi tiết JSON
          </Text>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Tổng bản ghi" 
            value={total} 
            icon={<DatabaseFilled />} 
            color="#1890ff"
            subText="Tổng số lô đã ghi nhận"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Thành công" 
            value={stats.success} 
            icon={<CheckCircleFilled />} 
            color="#52c41a"
            subText="Số lô đã truyền thành công"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Thất bại" 
            value={stats.failed} 
            icon={<CloseCircleFilled />} 
            color="#ff4d4f"
            subText="Các bản ghi cần kiểm tra lại"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Đang xử lý" 
            value={stats.pending} 
            icon={<SyncOutlined spin={loading} />} 
            color="#faad14"
            subText="Dữ liệu đang trong hàng chờ"
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

        <Table
          rowKey="id"
          data={data}
          columns={columns}
          isLoading={loading}
          totalPages={Math.ceil(total / (params.limit || 20))}
          currentPage={params.page}
          pageSize={params.limit}
          onPageChange={onPageChange}
          size="middle"
          className="custom-table"
          onRow={(record: IMESCompleteBatch) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>

      <MESCompleteBatchDetail 
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default MESCompleteBatch;
