import {
  ArrowLeftOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Alert, Breadcrumb, Button, Card, Col, Descriptions, Empty, Row, Spin, Tabs, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import Modal from '../components/Modal';
import {
  getByProductColumns,
  getIngredientColumns,
  getParameterColumns
} from '../components/RecipeDetail/RecipeDetailColumns';
import { useResponsive } from '../hooks/useResponsive';
import { formatVersionDisplay } from '../helpers/recipeHelper';
import { useRecipeDetail } from '../hooks/useRecipeDetail';
import Table from '../components/Table';

const { Text } = Typography;

const RecipeDetail: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();
  const { id } = useParams({ from: '/recipes/$id' });
  const navigate = useNavigate();

  const {
    loading,
    error,
    data,
    isProductModalOpen,
    setIsProductModalOpen,
    selectedProduct,
    productLoading,
    openProductModal,
    filteredIngredients,
    filteredByProducts,
    filteredParameters
  } = useRecipeDetail(id);

  const backToRecipes = () => {
    navigate({
      to: '/recipes',
      search: {
        page: 1,
        limit: 20
      },
      state: {
        reopenDrawer: true,
        selectedRecipe: data?.recipe
      } as any
    });
  };

  const ingredientColumns = useMemo(() => getIngredientColumns(openProductModal), [openProductModal]);
  const byProductColumns = useMemo(() => getByProductColumns(openProductModal), [openProductModal]);
  const parameterColumns = useMemo(() => getParameterColumns(), []);

  return (
    <div className="space-y-4 w-full">
      <Breadcrumb
        items={[
          { title: 'Tổng quan' },
          { title: <span onClick={backToRecipes} className="cursor-pointer">Công thức</span> },
          { title: `Chi tiết #${id}` },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Recipe Detail</h2>
          <p className="text-gray-500 text-sm">Chi tiết công thức và thành phần sản xuất</p>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={backToRecipes}
          className={isMobile ? "w-full" : ""}
        >
          Quay lại
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center"><Spin size="large" /></div>
      ) : error ? (
        <Alert type="error" showIcon message={error} />
      ) : !data?.recipe ? (
        <Empty description="Không có dữ liệu công thức" />
      ) : (
        <>
          <Card title="Thông tin chung" variant="borderless" className="shadow-sm">
            <div className="overflow-x-auto">
              <Descriptions
                column={isMobile ? 1 : isTablet ? 2 : 3}
                bordered
                size="middle"
                layout={isMobile ? 'vertical' : 'horizontal'}
                className="w-full"
              >
                {/* Hàng 1 */}
                <Descriptions.Item label={<Text strong>Mã công thức</Text>}><div className="break-words">{data.recipe.recipeCode || '-'}</div></Descriptions.Item>
                <Descriptions.Item label={<Text strong>Tên công thức</Text>}><div className="break-words">{data.recipe.recipeName || '-'}</div></Descriptions.Item>
                <Descriptions.Item label={<Text strong>Phiên bản</Text>}>
                  <Tag color="blue" className="font-bold m-0">{formatVersionDisplay(data.recipe.version)}</Tag>
                </Descriptions.Item>

                {/* Hàng 2 */}
                <Descriptions.Item label={<Text strong>Mã sản phẩm</Text>}><div className="break-words">{data.recipe.productCode || '-'}</div></Descriptions.Item>
                <Descriptions.Item label={<Text strong>Tên sản phẩm</Text>}><div className="break-words">{data.recipe.productName || '-'}</div></Descriptions.Item>
                <Descriptions.Item label={<Text strong>Trạng thái</Text>}>
                  <Tag color={data.recipe.recipeStatus === 'Active' ? 'success' : 'default'} className="font-medium m-0">
                    {data.recipe.recipeStatus || '-'}
                  </Tag>
                </Descriptions.Item>

                {/* Hàng 3 */}
                <Descriptions.Item label={<Text strong>Recipe ID</Text>}>{data.recipe.recipeDetailsId || '-'}</Descriptions.Item>
                <Descriptions.Item label={<Text strong>Số quy trình</Text>}>{(data.processes || []).length} bước</Descriptions.Item>
                <Descriptions.Item label={<Text strong>Cập nhật</Text>}>
                  {data.recipe.timestamp ? dayjs(data.recipe.timestamp).format('DD/MM/YYYY HH:mm:ss') : '-'}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Card>

          <Card title="Processes" variant="borderless">
            <div className="mb-4">
              <Text type="secondary">Danh sách quy trình sản xuất ({data.processes.length} bước)</Text>
            </div>
            <Row gutter={[16, 16]}>
              {(data.processes || []).map((process, idx) => {
                const product = data.products.find(p => p.processId === process.processId) || data.products[idx];

                return (
                  <Col xs={24} sm={12} lg={8} key={process.processId || `proc-${idx}`}>
                    <Card size="small" className="h-full" hoverable>
                      <div className="space-y-1.5">
                        <div><Text strong className="text-indigo-600" style={{ fontSize: '16px' }}>Process: {process.processId}</Text></div>
                        <div><Text strong>Code:</Text> {process.processCode || 'N/A'}</div>
                        <div><Text strong>Name:</Text> {process.processName || '-'}</div>
                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                          <span><Text strong>Duration:</Text> {process.duration ?? '0'}</span>
                          <span><Text strong>UoM:</Text> {process.durationUoM || 'N/A'}</span>
                        </div>

                        <div className="pt-2 border-t mt-2">
                          {product ? (
                            <div className="space-y-1">
                              <div className="text-xs text-gray-400">ID: {product.productId} | Code: {product.productCode}</div>
                              <div style={{ minHeight: '2.5em' }} className="flex items-center">
                                <div className="text-sm line-clamp-2">
                                  <Text strong>Product:</Text> {product.itemName}
                                </div>
                              </div>
                              <div className="bg-gray-50 py-1 px-2 rounded border border-dashed border-gray-200">
                                <Text strong>Plan:</Text> <span className="text-blue-600 font-medium">{product.planQuantity}</span> {product.unitOfMeasurement}
                              </div>
                              <div className="flex w-full mt-4">
                                <Button
                                  type="primary"
                                  size="small"
                                  className="bg-indigo-600 flex items-center justify-center gap-2 px-6 py-2 h-9 shadow-md hover:shadow-lg transition-all"
                                  icon={<EyeOutlined />}
                                  onClick={() => openProductModal(product.productCode)}
                                >
                                  Xem chi tiết
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="py-4 text-center text-gray-400 text-xs italic">
                              Không có sản phẩm đầu ra
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Card>

          <Card variant="borderless">
            <Tabs
              items={[
                {
                  key: 'ingredients',
                  label: `Ingredients (${filteredIngredients.length})`,
                  children: (
                    <Table
                      rowKey={(record, idx) => String(record.ingredientId || `ing-${idx}`)}
                      pagination={{ pageSize: 8 }}
                      data={filteredIngredients}
                      columns={ingredientColumns}
                      scroll={{ x: 1000 }}
                    />
                  ),
                },
                {
                  key: 'byproducts',
                  label: `ByProducts (${filteredByProducts.length})`,
                  children: (
                    <Table
                      rowKey={(record, idx) => String(record.byProductId || `byproc-${idx}`)}
                      pagination={{ pageSize: 8 }}
                      data={filteredByProducts}
                      columns={byProductColumns}
                      scroll={{ x: 1000 }}
                    />
                  ),
                },
                {
                  key: 'parameters',
                  label: `Parameters (${filteredParameters.length})`,
                  children: (
                    <Table
                      rowKey={(record, idx) => String(record.code || `param-${idx}`)}
                      pagination={{ pageSize: 8 }}
                      data={filteredParameters}
                      columns={parameterColumns}
                      scroll={{ x: 1000 }}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}

      <Modal
        title="Chi tiết sản phẩm"
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        width={isMobile ? '100%' : 800}
        hideFooter
      >
        {productLoading ? (
          <div className="py-10 text-center"><Spin /></div>
        ) : selectedProduct ? (
          <div className="space-y-6">
            <div className="space-y-3">
              {[
                { label: 'ID', value: selectedProduct.productMasterId },
                { label: 'Mã SP', value: selectedProduct.itemCode },
                { label: 'Tên SP', value: selectedProduct.itemName },
                { label: 'Loại', value: selectedProduct.itemType },
                { label: 'Nhóm', value: selectedProduct.group },
                { label: 'Brand', value: selectedProduct.brand },
                { label: 'Đơn vị cơ sở', value: selectedProduct.baseUnit },
                { label: 'Đơn vị tồn kho', value: selectedProduct.inventoryUnit },
                { label: 'Trạng thái', value: selectedProduct.itemStatus },
                {
                  label: 'Ngày cập nhật',
                  value: selectedProduct.timestamp
                    ? dayjs(selectedProduct.timestamp).format('DD/MM/YYYY HH:mm:ss.SSS')
                    : '-',
                },
              ].map((item) => (
                <div key={item.label} className={`grid ${isMobile ? 'grid-cols-1 gap-0.5' : 'grid-cols-[150px_1fr] gap-2'} text-sm`}>
                  <span className="font-semibold text-gray-600">{item.label}:</span>
                  <span className="text-gray-800">{item.value || '-'}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t mt-4">
              <h4 className="text-base font-bold text-blue-600 mb-3">Quy đổi đơn vị (MHUTypes)</h4>
              <Table
                rowKey="mhuTypeId"
                data={selectedProduct.mhuTypes || []}
                pagination={false}
                size="small"
                scroll={{ x: 600 }}
                columns={[
                  { title: 'MHUTypeId', dataIndex: 'mhuTypeId', key: 'mhuTypeId', width: 100 },
                  { title: 'Từ đơn vị', dataIndex: 'fromUnit', key: 'fromUnit', width: 120 },
                  { title: 'Đến đơn vị', dataIndex: 'toUnit', key: 'toUnit', width: 120 },
                  { title: 'Tỷ lệ quy đổi', dataIndex: 'conversion', key: 'conversion', width: 120 },
                ]}
              />
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={() => setIsProductModalOpen(false)} type="primary" className="bg-indigo-600">Đóng</Button>
            </div>
          </div>
        ) : (
          <Empty description="Không tìm thấy thông tin sản phẩm" />
        )}
      </Modal>
    </div>
  );
};



export default RecipeDetail;
