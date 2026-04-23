import { EyeOutlined } from '@ant-design/icons';
import { Button, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import type { IProduct } from '../../types/product';

export const getProductColumns = (openDetailModal: (record: IProduct) => void) => [
  {
    title: 'Mã SP',
    dataIndex: 'itemCode',
    key: 'itemCode',
    sorter: (a: IProduct, b: IProduct) => (a.itemCode || '').localeCompare(b.itemCode || ''),
  },
  {
    title: 'Tên Sản Phẩm',
    dataIndex: 'itemName',
    key: 'itemName',
    sorter: (a: IProduct, b: IProduct) => (a.itemName || '').localeCompare(b.itemName || ''),
  },
  {
    title: 'Loại',
    dataIndex: 'itemType',
    key: 'itemType',
    sorter: (a: IProduct, b: IProduct) => (a.itemType || '').localeCompare(b.itemType || ''),
  },
  { title: 'Nhóm', dataIndex: 'group', key: 'group' },
  { title: 'ĐV Cơ Sở', dataIndex: 'baseUnit', key: 'baseUnit' },
  {
    title: 'Trạng Thái',
    dataIndex: 'itemStatus',
    key: 'itemStatus',
    render: (status: string) => {
      const isActive = status === 'ACTIVE';
      return (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      );
    },
  },
  {
    title: 'Cập Nhật',
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: (ts: string) => ts ? dayjs(ts).format('DD/MM/YYYY HH:mm') : '',
  },
  {
    title: 'Thao Tác',
    key: 'actions',
    render: (_: unknown, record: IProduct) => (
      <Tooltip title="Xem chi tiết">
        <Button
          type="text"
          icon={<EyeOutlined style={{ color: '#5b4ce8', fontSize: '18px' }} />}
          onClick={() => openDetailModal(record)}
        />
      </Tooltip>
    ),
  },
];
