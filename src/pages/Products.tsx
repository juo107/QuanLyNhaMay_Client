import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Button, Spin } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, InboxOutlined, CheckCircleOutlined, TagsOutlined, GroupOutlined } from '@ant-design/icons';
import Table from '../components/Table';
import FilterSearchBar from '../components/FilterSearchBar';
import Modal from '../components/Modal';
import { useProducts } from '../hooks/useProducts';
import { getProductColumns } from '../components/Product/ProductColumns';
import ProductDetail from '../components/Product/ProductDetail';

const Products: React.FC = () => {
  const {
    stats,
    data,
    loading,
    params,
    total,
    isDetailModalOpen,
    detailLoading,
    selectedProduct,
    onFilterChange,
    onPageChange,
    openDetailModal,
    closeDetailModal,
    filterConfig,
    fetchProducts
  } = useProducts();

  const columns = useMemo(() => getProductColumns(openDetailModal), [openDetailModal]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Danh Mục Sản Phẩm</h2>
        <p className="text-gray-500 text-sm">Quản lý dữ liệu chính sản phẩm và quy đổi đơn vị</p>
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Tổng Sản Phẩm" value={stats.totalProducts} valueStyle={{ color: '#1677ff' }} prefix={<InboxOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Sản Phẩm Hoạt Động" value={stats.activeProducts} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Phân Loại (Type)" value={stats.totalTypes} valueStyle={{ color: '#fa8c16' }} prefix={<TagsOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Nhóm (Group)" value={stats.totalGroups} valueStyle={{ color: '#722ed1' }} prefix={<GroupOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="shadow-sm">
        <FilterSearchBar
          filters={filterConfig}
          values={params as Record<string, any>}
          onChange={onFilterChange}
          onRefresh={() => fetchProducts(params)}
          extraActions={
            <>
              <Button type="default" icon={<UnorderedListOutlined />} />
              <Button type="default" icon={<AppstoreOutlined />} />
            </>
          }
        />
        <Table
          rowKey="productMasterId"
          data={data}
          columns={columns}
          isLoading={loading}
          totalPages={Math.ceil(total / (params.pageSize || 20))}
          currentPage={params.page}
          pageSize={params.pageSize}
          onPageChange={onPageChange}
        />
      </Card>

      <Modal
        title="Chi tiết sản phẩm"
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        width={980}
        hideFooter
      >
        {detailLoading ? (
          <div className="py-10 text-center">
            <Spin />
          </div>
        ) : selectedProduct ? (
          <ProductDetail selectedProduct={selectedProduct} />
        ) : (
          <div className="text-gray-500">Không có dữ liệu chi tiết</div>
        )}
      </Modal>
    </div>
  );
};

export default Products;
