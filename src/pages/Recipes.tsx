import React, { useMemo, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Tag, Tooltip, Typography, Descriptions, Spin, Empty, Table as AntdTable, Tabs } from 'antd';
import { ExperimentOutlined, CheckCircleOutlined, HistoryOutlined, EyeOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Table from '../components/Table';
import FilterSearchBar from '../components/FilterSearchBar';
import CommonDrawer from '../components/CommonDrawer';
import { formatVersionDisplay } from '../helpers/recipeHelper';
import { useRecipes } from '../hooks/useRecipes';
import { getRecipeFilters, getRecipeColumns } from '../components/Recipe/RecipeColumns';
import type { IRecipe, IRecipeVersionItem } from '../types/recipeTypes';

const { Text } = Typography;

const Recipes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    stats,
    data,
    loading,
    params,
    total,
    selectedRecipe,
    isDetailDrawerOpen,
    versionRows,
    versionLoading,
    onFilterChange,
    onPageChange,
    openDetailDrawer,
    closeDetailDrawer,
    fetchRecipes,
    restoredRef
  } = useRecipes();

  useEffect(() => {
    const state = location.state as { reopenDrawer?: boolean; selectedRecipe?: IRecipe } | null;
    if (!state?.reopenDrawer || !state.selectedRecipe || restoredRef.current) return;

    restoredRef.current = true;
    openDetailDrawer(state.selectedRecipe);
    navigate('/recipes', { replace: true });
  }, [location.state, navigate, openDetailDrawer, restoredRef]);

  const filterConfig = useMemo(() => getRecipeFilters(), []);
  const columns = useMemo(() => getRecipeColumns(openDetailDrawer), [openDetailDrawer]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Công Thức</h2>
        <p className="text-gray-500 text-sm">Quản lý dữ liệu chính công thức sản xuất</p>
      </div>

      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Tổng số Công thức" value={stats.total} valueStyle={{ color: '#1677ff' }} prefix={<ExperimentOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Công thức Hoạt động" value={stats.active} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Tổng Phiên bản" value={stats.totalVersions} valueStyle={{ color: '#fa8c16' }} prefix={<HistoryOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="shadow-sm">
        <FilterSearchBar
          filters={filterConfig}
          values={params as Record<string, any>}
          onChange={onFilterChange}
          onRefresh={() => fetchRecipes(params)}
        />
        <Table
          rowKey="recipeDetailsId"
          data={data}
          columns={columns}
          isLoading={loading}
          tableLayout="fixed"
          totalPages={Math.ceil(total / (params.limit || 20))}
          currentPage={params.page}
          pageSize={params.limit}
          onPageChange={onPageChange}
        />
      </Card>

      <CommonDrawer
        title="Chi tiết công thức"
        isOpen={isDetailDrawerOpen}
        onClose={closeDetailDrawer}
        width={980}
      >
        {selectedRecipe && (
          <Tabs
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: 'Thông tin',
                children: (
                  <Descriptions column={2} bordered size="middle" labelStyle={{ width: 180 }}>
                    <Descriptions.Item label="ID">{selectedRecipe.recipeDetailsId || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Phiên bản hiện tại">
                      <Tag color="blue">v{selectedRecipe.version || '-'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã sản phẩm">{selectedRecipe.productCode || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Tên sản phẩm">{selectedRecipe.productName || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Mã công thức">{selectedRecipe.recipeCode || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Tên công thức">{selectedRecipe.recipeName || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag color={selectedRecipe.recipeStatus === 'Active' ? 'success' : 'default'}>
                        {selectedRecipe.recipeStatus || '-'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian cập nhật">
                      {selectedRecipe.timestamp ? dayjs(selectedRecipe.timestamp).format('DD/MM/YYYY HH:mm:ss') : '-'}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'versions',
                label: `Phiên bản (${versionRows.length})`,
                children: (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <Text strong>Danh sách phiên bản theo backend</Text>
                      <Tag color="purple">{versionRows.length} items</Tag>
                    </div>
                    {versionLoading ? (
                      <div className="py-8 text-center">
                        <Spin />
                      </div>
                    ) : versionRows.length === 0 ? (
                      <Empty description="Không có dữ liệu phiên bản" />
                    ) : (
                      <AntdTable
                        rowKey="recipeDetailsId"
                        size="small"
                        pagination={false}
                        dataSource={versionRows}
                        tableLayout="fixed"
                        columns={[
                          { title: 'ID', dataIndex: 'recipeDetailsId', key: 'recipeDetailsId', width: 90 },
                          { title: 'Version', dataIndex: 'version', key: 'version', width: 100, render: (v: string) => <Tag color="blue">{formatVersionDisplay(v)}</Tag> },
                          {
                            title: 'Product Code',
                            dataIndex: 'productCode',
                            key: 'productCode',
                            width: 160,
                            render: (value: string) => (
                              <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                {value || '-'}
                              </div>
                            ),
                          },
                          {
                            title: 'Product Name',
                            dataIndex: 'productName',
                            key: 'productName',
                            render: (value: string) => (
                              <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                {value || '-'}
                              </div>
                            ),
                          },
                          {
                            title: 'Recipe Name',
                            dataIndex: 'recipeName',
                            key: 'recipeName',
                            render: (value: string) => (
                              <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                {value || '-'}
                              </div>
                            ),
                          },
                          {
                            title: 'Status',
                            dataIndex: 'recipeStatus',
                            key: 'recipeStatus',
                            width: 120,
                            render: (status: string) => <Tag color={status === 'Active' ? 'success' : 'default'}>{status || '-'}</Tag>,
                          },
                          {
                            title: 'Cập nhật',
                            dataIndex: 'timestamp',
                            key: 'timestamp',
                            width: 160,
                            render: (ts: string) => (ts ? dayjs(ts).format('DD/MM/YYYY HH:mm') : '-'),
                          },
                          {
                            title: 'Chi tiết',
                            key: 'actions',
                            width: 90,
                            render: (_: unknown, row: IRecipeVersionItem) => (
                              <Tooltip title="Mở trang chi tiết">
                                <Button
                                  type="text"
                                  icon={<EyeOutlined style={{ color: '#5b4ce8', fontSize: '18px' }} />}
                                  onClick={() => {
                                    closeDetailDrawer();
                                    navigate(`/recipes/${row.recipeDetailsId}`, {
                                      state: {
                                        fromDrawer: true,
                                        selectedRecipe: row,
                                      },
                                    });
                                  }}
                                />
                              </Tooltip>
                            ),
                          },
                        ]}
                      />
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </CommonDrawer>
    </div>
  );
};

export default Recipes;
