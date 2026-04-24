import { CheckCircleOutlined, CloseCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Card, Col, Row } from 'antd';
import React, { useMemo } from 'react';
import CommonDrawer from '../components/CommonDrawer';
import { getConsumptionLogColumns } from '../components/ConsumptionLog/ConsumptionLogColumns';
import ConsumptionLogDetail from '../components/ConsumptionLog/ConsumptionLogDetail';
import FilterSearchBar from '../components/FilterSearchBar';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import { useConsumptionLog } from '../hooks/useConsumptionLog';
import { useResponsive } from '../hooks/useResponsive';


const ConsumptionLog: React.FC = () => {
  const { isMobile } = useResponsive();
  const {
    data,
    total,
    success,
    failed,
    loading,
    params,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedRecord,
    onFilterChange,
    onPageChange,
    showDetail,
    filterConfig,
  } = useConsumptionLog();

  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['consumptionLogs'] });
  };

  const columns = useMemo(() => getConsumptionLogColumns(showDetail), [showDetail]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Nhật Ký Tiêu Hao</h2>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Tổng số bản ghi"
            value={total}
            icon={<HistoryOutlined />}
            color="#1677ff"
            subText="Lịch sử tiêu hao vật liệu"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Thành công"
            value={success}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
            subText="Bản ghi đã truyền thành công"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Lỗi/Thất bại"
            value={failed}
            icon={<CloseCircleOutlined />}
            color="#ff4d4f"
            subText="Bản ghi truyền thất bại hoặc bị lỗi"
          />
        </Col>
      </Row>

      <Card variant="borderless" className="shadow-sm">
        <FilterSearchBar
          filters={filterConfig}
          values={params as any}
          onChange={onFilterChange}
          onRefresh={handleRefresh}
        />
        <Table
          rowKey="id"
          data={data}
          columns={columns}
          isLoading={loading}
          totalPages={Math.ceil(total / (params.pageSize || 20))}
          currentPage={params.page}
          pageSize={params.pageSize}
          onPageChange={onPageChange}
        />
      </Card>

      <CommonDrawer
        title="Chi tiết tiêu hao vật liệu"
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        size={isMobile ? 'default' : 'large'}
      >
        {selectedRecord && <ConsumptionLogDetail selectedRecord={selectedRecord} />}
      </CommonDrawer>
    </div>
  );
};

export default ConsumptionLog;
