import { CheckCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';
import React, { useMemo } from 'react';
import CommonDrawer from '../components/CommonDrawer';
import { getConsumptionLogColumns } from '../components/ConsumptionLog/ConsumptionLogColumns';
import ConsumptionLogDetail from '../components/ConsumptionLog/ConsumptionLogDetail';
import FilterSearchBar from '../components/FilterSearchBar';
import Table from '../components/Table';
import { useConsumptionLog } from '../hooks/useConsumptionLog';
import { useResponsive } from '../hooks/useResponsive';


const ConsumptionLog: React.FC = () => {
  const { isMobile } = useResponsive();
  const {
    data,
    total,
    loading,
    params,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedRecord,
    onFilterChange,
    onPageChange,
    showDetail,
    filterConfig,
    fetchData,
  } = useConsumptionLog();

  const columns = useMemo(() => getConsumptionLogColumns(showDetail), [showDetail]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Nhật Ký Tiêu Hao</h2>
        <p className="text-gray-500 text-sm">Xem lịch sử sử dụng nguyên vật liệu từ SCADA</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={12} lg={6}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic title="Tổng số bản ghi" value={total} styles={{ content: { color: '#1677ff' } }} prefix={<HistoryOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title="Thành công"
              value={data.filter((i: any) => (i.response || i.respone)?.toLowerCase().includes('success')).length}
              suffix={`/ ${data.length}`}
              styles={{ content: { color: '#3f8600' } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" className="shadow-sm">
        <FilterSearchBar
          filters={filterConfig}
          values={params as any}
          onChange={onFilterChange}
          onRefresh={() => fetchData()}
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
