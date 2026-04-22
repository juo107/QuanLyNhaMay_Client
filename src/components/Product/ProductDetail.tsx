import React from 'react';
import { Table } from 'antd';
import dayjs from 'dayjs';
import type { IProduct } from '../../types/product';

interface Props {
  selectedProduct: IProduct;
}

const ProductDetail: React.FC<Props> = ({ selectedProduct }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {[
          { label: 'ProductMasterId', value: selectedProduct.productMasterId },
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
          <div key={item.label} className="grid grid-cols-[180px_1fr] gap-4">
            <span className="font-semibold text-gray-800">{item.label}</span>
            <span>{item.value || '-'}</span>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-xl font-semibold text-blue-600 mb-3">MHUTypes</h4>
        <Table
          rowKey="mhuTypeId"
          dataSource={selectedProduct.mhuTypes || []}
          pagination={false}
          size="small"
          columns={[
            { title: 'MHUTypeId', dataIndex: 'mhuTypeId', key: 'mhuTypeId' },
            { title: 'FromUnit', dataIndex: 'fromUnit', key: 'fromUnit' },
            { title: 'ToUnit', dataIndex: 'toUnit', key: 'toUnit' },
            { title: 'Conversion', dataIndex: 'conversion', key: 'conversion' },
          ]}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
