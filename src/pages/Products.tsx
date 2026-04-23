import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Button, Spin } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, InboxOutlined, CheckCircleOutlined, TagsOutlined, GroupOutlined } from '@ant-design/icons';
import Table from '../components/Table';
import FilterSearchBar from '../components/FilterSearchBar';
import Modal from '../components/Modal';
import { useProducts } from '../hooks/useProducts';
import { getProductColumns } from '../components/Product/ProductColumns';
import ProductDetail from '../components/Product/ProductDetail';
import { useResponsive } from '../hooks/useResponsive';

const Products: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();
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

      <Row gutter={[16, 16]}>
        {/* Responsive bằng cách sử dụng hook hoặc truyền trực tiếp vào Col đều được */}
        <Col xs={12} sm={12} lg={6}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic title="Tổng Sản Phẩm" value={stats.totalProducts} styles={{ content: { color: '#1677ff' } }} prefix={<InboxOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic title="Sản Phẩm Hoạt Động" value={stats.activeProducts} styles={{ content: { color: '#3f8600' } }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic title="Phân Loại (Type)" value={stats.totalTypes} styles={{ content: { color: '#fa8c16' } }} prefix={<TagsOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic title="Nhóm (Group)" value={stats.totalGroups} styles={{ content: { color: '#722ed1' } }} prefix={<GroupOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" className="shadow-sm">
        <FilterSearchBar
          filters={filterConfig}
          values={params as Record<string, any>}
          onChange={onFilterChange}
          onRefresh={() => fetchProducts()}
          extraActions={
            // Ẩn 2 nút chức năng này nếu đang ở màn hình điện thoại cho gọn
            !isMobile && (
              <>
                <Button type="default" icon={<UnorderedListOutlined />} />
                <Button type="default" icon={<AppstoreOutlined />} />
              </>
            )
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
        // Tuỳ chỉnh width tự động theo thiết bị:
        // - isMobile (Điện thoại): width full 100%
        // - isTablet (iPad): width 700px
        // - PC: width 980px
        width={isMobile ? '100%' : isTablet ? 700 : 980}
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
