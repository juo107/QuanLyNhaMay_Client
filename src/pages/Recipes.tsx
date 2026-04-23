import { CheckCircleOutlined, ExperimentOutlined, HistoryOutlined } from '@ant-design/icons';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Table as AntdTable, Card, Col, Descriptions, Empty, Row, Spin, Statistic, Tabs, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo } from 'react';
import CommonDrawer from '../components/CommonDrawer';
import FilterSearchBar from '../components/FilterSearchBar';
import { getRecipeColumns, getRecipeFilters } from '../components/Recipe/RecipeColumns';
import Table from '../components/Table';
import { formatVersionDisplay } from '../helpers/recipeHelper';
import { useRecipes } from '../hooks/useRecipes';
import type { IRecipe } from '../types/recipeTypes';

const { Text } = Typography;

const Recipes: React.FC = () => {
  const navigate = useNavigate({ from: '/recipes' });
  const routerState = useRouterState();
  const locationState = (routerState.location.state as any);

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
    const state = locationState as { reopenDrawer?: boolean; selectedRecipe?: IRecipe } | null;
    if (!state?.reopenDrawer || !state.selectedRecipe || restoredRef.current) return;

    restoredRef.current = true;
    openDetailDrawer(state.selectedRecipe);
    navigate({ to: '/recipes', search: params as any, replace: true });
  }, [locationState, navigate, openDetailDrawer, restoredRef]);

  const filterConfig = useMemo(() => getRecipeFilters(), []);
  const columns = useMemo(() => getRecipeColumns(openDetailDrawer), [openDetailDrawer]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Công Thức</h2>
        <p className="text-gray-500 text-sm">Quản lý dữ liệu chính công thức sản xuất</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={12} md={8}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic title="Tổng số Công thức" value={stats.total} styles={{ content: { color: '#1677ff' } }} prefix={<ExperimentOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={8}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic title="Công thức Hoạt động" value={stats.active} styles={{ content: { color: '#3f8600' } }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={8}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic title="Tổng Phiên bản" value={stats.totalVersions} styles={{ content: { color: '#fa8c16' } }} prefix={<HistoryOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" className="shadow-sm">
        <FilterSearchBar
          filters={filterConfig}
          values={params as Record<string, any>}
          onChange={onFilterChange}
          onRefresh={() => fetchRecipes()}
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
          onRow={(record: any) => ({
            onClick: () => {
              openDetailDrawer(record);
            },
            className: 'cursor-pointer hover:bg-gray-50 transition-colors',
          })}
        />
      </Card>

      <CommonDrawer
        title="Chi tiết công thức"
        isOpen={isDetailDrawerOpen}
        onClose={closeDetailDrawer}
      >
        {selectedRecipe && (
          <Tabs
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: 'Thông tin',
                children: (
                  <Descriptions column={2} bordered size="middle" styles={{ label: { width: 180, fontWeight: 'bold' } }}>
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
                        tableLayout="auto"
                        onRow={(record: any) => ({
                          onClick: () => {
                            closeDetailDrawer();
                            navigate({
                              to: '/recipes/$id',
                              params: { id: String(record.recipeDetailsId) },
                              state: {
                                fromDrawer: true,
                                selectedRecipe: record,
                              } as any,
                            });
                          },
                          className: 'cursor-pointer hover:bg-gray-50 transition-colors',
                        })}
                        columns={[
                          { title: 'ID', dataIndex: 'recipeDetailsId', key: 'recipeDetailsId', width: 60 },
                          { title: 'Version', dataIndex: 'version', key: 'version', width: 90, render: (v: string) => <Tag color="blue" className="m-0">{formatVersionDisplay(v)}</Tag> },
                          {
                            title: 'Recipe Name',
                            dataIndex: 'recipeName',
                            key: 'recipeName',
                            render: (value: string) => (
                              <div className="font-medium text-gray-800 break-words whitespace-normal py-1">
                                {value || '-'}
                              </div>
                            ),
                          },
                          {
                            title: 'Status',
                            dataIndex: 'recipeStatus',
                            key: 'recipeStatus',
                            width: 100,
                            render: (status: string) => <Tag color={status === 'Active' ? 'success' : 'default'} className="m-0">{status || '-'}</Tag>,
                          },
                          {
                            title: 'Cập nhật',
                            dataIndex: 'timestamp',
                            key: 'timestamp',
                            width: 140,
                            render: (ts: string) => (ts ? dayjs(ts).format('DD/MM/YYYY HH:mm') : '-'),
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
