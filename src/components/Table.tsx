import React, { useMemo, useState, useEffect } from 'react';
import { Table as AntdTable, Popover, Checkbox, Button, Tooltip, Divider } from 'antd';
import type { TableProps } from 'antd';
import { SettingOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Resizable } from 'react-resizable';
import './Table.css';

const ResizableTitle = (props: any) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

export interface ICommonTableProps<T> extends TableProps<T> {
  data: T[];
  columns: any[];
  isLoading?: boolean;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  rowKey?: string | ((record: T, index?: number) => string);
  hidePagination?: boolean;
}

export function Table<T extends object>({
  data,
  columns: initialColumns,
  isLoading = false,
  totalPages = 1,
  currentPage: externalPage,
  pageSize: externalPageSize,
  onPageChange,
  rowKey = 'id',
  hidePagination = false,
  ...props
}: ICommonTableProps<T>) {
  const [cols, setCols] = useState(initialColumns);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  
  // Internal pagination state for client-side support
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(10);

  // Sync with external pagination if provided
  useEffect(() => {
    if (externalPage) setInternalPage(externalPage);
  }, [externalPage]);

  useEffect(() => {
    if (externalPageSize) setInternalPageSize(externalPageSize);
  }, [externalPageSize]);

  // Sync state if initialColumns change from outside and initialize visible keys
  useEffect(() => {
    setCols(initialColumns);
    const keys = initialColumns.map((c, idx) => c.key || c.dataIndex || `col-${idx}`);
    setVisibleKeys(keys);
  }, [initialColumns]);

  const handleResize = (index: number) => (e: any, { size }: any) => {
    const nextColumns = [...cols];
    nextColumns[index] = {
      ...nextColumns[index],
      width: size.width,
    };
    setCols(nextColumns);
  };

  const processedColumns = useMemo(() => {
    return cols
      .map((col, index) => {
        const colKey = col.key || col.dataIndex || `col-${index}`;
        if (!visibleKeys.includes(colKey)) return null;

        let finalCol = { ...col };

        // If column has dataIndex and no sorter, add a default client-side sorter
        if (col.dataIndex && col.sorter === undefined) {
          finalCol = {
            ...finalCol,
            sorter: (a: any, b: any) => {
              const getVal = (record: any, dataIndex: string | string[]) => {
                if (Array.isArray(dataIndex)) {
                  return dataIndex.reduce((obj, key) => obj?.[key], record);
                }
                return record[dataIndex];
              };

              const aVal = getVal(a, col.dataIndex);
              const bVal = getVal(b, col.dataIndex);

              if (typeof aVal === 'number' && typeof bVal === 'number') {
                return aVal - bVal;
              }
              const strA = String(aVal || '').toLowerCase();
              const strB = String(bVal || '').toLowerCase();
              return strA.localeCompare(strB);
            },
          };
        }

        // Add resizing props
        return {
          ...finalCol,
          onHeaderCell: (column: any) => ({
            width: column.width,
            onResize: handleResize(index),
          }),
        };
      })
      .filter(Boolean) as any[];
  }, [cols, visibleKeys]);

  const components = {
    header: {
      cell: ResizableTitle,
    },
  };

  const columnSettingsContent = (
    <div className="min-w-[200px]">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="font-bold text-gray-700">Hiển thị cột</span>
        <Button 
          type="link" 
          size="small" 
          onClick={() => setVisibleKeys(cols.map((c, idx) => c.key || c.dataIndex || `col-${idx}`))}
        >
          Hiện tất cả
        </Button>
      </div>
      <Divider className="my-2" />
      <div className="max-h-[300px] overflow-y-auto px-1">
        {cols.map((col, idx) => {
          const colKey = col.key || col.dataIndex || `col-${idx}`;
          const isVisible = visibleKeys.includes(colKey);
          return (
            <div key={colKey} className="py-1 hover:bg-gray-50 flex items-center justify-between group">
              <Checkbox
                checked={isVisible}
                onChange={(e) => {
                  if (e.target.checked) {
                    setVisibleKeys([...visibleKeys, colKey]);
                  } else {
                    setVisibleKeys(visibleKeys.filter(k => k !== colKey));
                  }
                }}
              >
                {col.title || `Cột ${idx + 1}`}
              </Checkbox>
              {isVisible ? <EyeOutlined className="text-blue-500 opacity-50" /> : <EyeInvisibleOutlined className="text-gray-300" />}
            </div>
          );
        })}
      </div>
    </div>
  );

  const handlePageChange = (page: number, pageSize: number) => {
    setInternalPage(page);
    setInternalPageSize(pageSize);
    if (onPageChange) {
      onPageChange(page, pageSize);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
      <div className="flex justify-end p-2 bg-gray-50 border-b border-gray-200">
        <Popover
          content={columnSettingsContent}
          trigger="click"
          placement="bottomRight"
          overlayClassName="column-settings-popover"
        >
          <Tooltip title="Cài đặt hiển thị cột">
            <Button
              type="text"
              icon={<SettingOutlined style={{ fontSize: '18px', color: '#5b4ce8' }} />}
              className="hover:bg-blue-50 flex items-center justify-center"
            />
          </Tooltip>
        </Popover>
      </div>
      <AntdTable
        columns={processedColumns}
        components={components}
        dataSource={data}
        loading={isLoading}
        rowKey={rowKey}
        pagination={
          hidePagination
            ? false
            : {
                current: internalPage,
                pageSize: internalPageSize,
                total: totalPages > 1 ? totalPages * internalPageSize : data.length,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
                onChange: handlePageChange,
              }
        }
        scroll={{ x: 'max-content' }}
        size="middle"
        {...props}
      />
    </div>
  );
}

export default Table;
