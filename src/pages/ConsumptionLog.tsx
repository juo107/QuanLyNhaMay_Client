import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { HistoryOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Table from '../components/Table';
import FilterSearchBar from '../components/FilterSearchBar';
import CommonDrawer from '../components/CommonDrawer';
import { useConsumptionLog } from '../hooks/useConsumptionLog';
import { getConsumptionLogColumns } from '../components/ConsumptionLog/ConsumptionLogColumns';
import ConsumptionLogDetail from '../components/ConsumptionLog/ConsumptionLogDetail';

const { Text } = Typography;

const ConsumptionLog: React.FC = () => {
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

      <Row gutter={16}>
        <Col span={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Tổng số bản ghi" value={total} valueStyle={{ color: '#1677ff' }} prefix={<HistoryOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic 
              title="Thành công" 
              value={data.filter(i => i.response?.toLowerCase().includes('success')).length} 
              suffix={`/ ${data.length}`} 
              valueStyle={{ color: '#3f8600' }} 
              prefix={<CheckCircleOutlined />} 
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="shadow-sm">
        <FilterSearchBar
          filters={filterConfig}
          values={params as any}
          onChange={onFilterChange}
          onRefresh={() => fetchData(params)}
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
        />
      </Card>

      <CommonDrawer
        title="Chi tiết tiêu hao vật liệu"
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        width={650}
      >
        {selectedRecord && <ConsumptionLogDetail selectedRecord={selectedRecord} />}
      </CommonDrawer>
    </div>
  );
};

export default ConsumptionLog;
