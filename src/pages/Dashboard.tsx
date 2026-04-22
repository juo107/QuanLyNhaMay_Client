import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, message } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import { productionOrderApi } from '../api/productionOrderApi';
import Table from '../components/Table';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({ total: 0, inProgress: 0, completed: 0, stopped: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes: any = await productionOrderApi.getStats();
      if (statsRes) {
        // Hỗ trợ cả cấu trúc cũ và mới
        const s = statsRes.stats || statsRes.data || statsRes;
        setStats({
          total: s.total ?? s.Total ?? 0,
          inProgress: s.inProgress ?? s.InProgress ?? 0,
          completed: s.completed ?? s.Completed ?? 0,
          stopped: s.stopped ?? s.Stopped ?? 0
        });
      }

      const ordersRes: any = await productionOrderApi.search({ limit: 5, page: 1 });
      if (ordersRes) {
        const items = ordersRes.items ?? ordersRes.Items ?? ordersRes.data?.items ?? ordersRes.data?.Items ?? (Array.isArray(ordersRes.data) ? ordersRes.data : (Array.isArray(ordersRes) ? ordersRes : []));
        setRecentOrders(items);
      }
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu từ server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const columns = [
    { title: 'Mã Lệnh', dataIndex: 'productionOrderNumber', key: 'productionOrderNumber' },
    { title: 'Sản Phẩm', dataIndex: 'productCode', key: 'productCode' },
    { title: 'Khu vực', dataIndex: 'processArea', key: 'processArea' },
    { 
      title: 'Trạng Thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: number) => status === 1 ? 'Đang chạy' : (status === 2 ? 'Hoàn thành' : 'Đang chờ')
    },
    { 
      title: 'Tiến Độ', 
      key: 'progress',
      render: (_: any, record: any) => `${record.currentBatch || 0} / ${record.totalBatches || 0}` 
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Tổng quan Nhà Máy</h2>
      
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Tổng Lệnh Sản Xuất"
              value={stats.total}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Lệnh Đang Chạy"
              value={stats.inProgress}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Lệnh Đã Hoàn Thành"
              value={stats.completed}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Lệnh Sản Xuất Gần Đây" className="shadow-sm mt-6" bordered={false}>
        <Table 
          rowKey="productionOrderId" 
          data={recentOrders} 
          columns={columns} 
          isLoading={loading} 
          hidePagination={true} 
        />
      </Card>
    </div>
  );
};

export default Dashboard;
