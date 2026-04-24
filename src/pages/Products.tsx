import { AppstoreOutlined, CheckCircleOutlined, GroupOutlined, InboxOutlined, TagsOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Spin } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import FilterSearchBar from '../components/FilterSearchBar';
import Modal from '../components/Modal';
import { getProductColumns } from '../components/Product/ProductColumns';
import ProductDetail from '../components/Product/ProductDetail';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import { useProducts } from '../hooks/useProducts';
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
  } = useProducts();

  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['products'] });
    await queryClient.invalidateQueries({ queryKey: ['productStats'] });
  };

  const columns = useMemo(() => getProductColumns(openDetailModal), [openDetailModal]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Danh Mục Sản Phẩm</h2>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng Sản Phẩm"
            value={stats.totalProducts}
            icon={<InboxOutlined />}
            color="#1677ff"
            subText="Sản phẩm trong danh mục"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Sản Phẩm Hoạt Động"
            value={stats.activeProducts}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
            subText="Sản phẩm đang kinh doanh"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Phân Loại (Type)"
            value={stats.totalTypes}
            icon={<TagsOutlined />}
            color="#fa8c16"
            subText="Các loại sản phẩm khác nhau"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Nhóm (Group)"
            value={stats.totalGroups}
            icon={<GroupOutlined />}
            color="#722ed1"
            subText="Các nhóm sản phẩm chính"
          />
        </Col>
      </Row>

      <Card variant="borderless" className="shadow-sm">
        <FilterSearchBar
          filters={filterConfig}
          values={params as Record<string, any>}
          onChange={onFilterChange}
          onRefresh={handleRefresh}
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
