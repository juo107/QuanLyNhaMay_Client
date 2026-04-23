import { Descriptions, Divider, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { IMESCompleteBatch } from '../../api/mesCompleteBatchApi';
import CommonDrawer from '../CommonDrawer';

const { Text, Paragraph } = Typography;

interface IMESCompleteBatchDetailProps {
  record: IMESCompleteBatch | null;
  isOpen: boolean;
  onClose: () => void;
}

const MESCompleteBatchDetail: React.FC<IMESCompleteBatchDetailProps> = ({ record, isOpen, onClose }) => {
  if (!record) return null;

  const renderStatus = (status: string) => {
    const lowerStatus = (status || '').toLowerCase();
    switch (lowerStatus) {
      case 'success':
      case 'sent':
        return <Tag color="success" className="rounded-full px-4">{status}</Tag>;
      case 'pending':
      case 'waiting':
        return <Tag color="warning" className="rounded-full px-4">{status}</Tag>;
      case 'error':
      case 'failed':
        return <Tag color="error" className="rounded-full px-4">{status}</Tag>;
      default:
        return <Tag className="rounded-full px-4">{status || 'N/A'}</Tag>;
    }
  };

  return (
    <CommonDrawer
      title="Chi tiết Hoàn thành Batch"
      isOpen={isOpen}
      onClose={onClose}
      size="large"
    >
      <div className="space-y-8">
        <Descriptions 
          bordered 
          column={1}
          labelStyle={{ fontWeight: 'bold', width: '160px', backgroundColor: '#fafafa' }}
          contentStyle={{ wordBreak: 'break-word', backgroundColor: '#fff' }}
          size="middle"
        >
          <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
          <Descriptions.Item label="Lệnh Sản Xuất">
            <Text strong className="text-[#5b4ce8] break-all">{record.productionOrder || 'N/A'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Số Lô (Batch)" className="break-all">{record.batchNumber || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Mã Sản Phẩm" className="break-all">{record.productCode || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Tên Sản Phẩm" className="break-all">
            <Text strong>{record.productName || 'N/A'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Số Lượng">{record.batchSize} {record.batchUOM}</Descriptions.Item>
          <Descriptions.Item label="Mã Máy">{record.machineCode || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Thời gian bắt đầu">
            {record.startTime ? dayjs(record.startTime).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian kết thúc">
            {record.endTime ? dayjs(record.endTime).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {renderStatus(record.transferStatus)}
          </Descriptions.Item>
          <Descriptions.Item label="Lần thử lại">{record.retryCount}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm:ss')}
          </Descriptions.Item>
        </Descriptions>

        <div>
          <Divider orientation="left" className="!m-0 !mb-4">
            <Text strong className="text-gray-700 text-base">Dữ liệu Phản hồi (Response)</Text>
          </Divider>
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-inner">
            <Paragraph className="!m-0 font-mono text-[13px] text-gray-700 leading-relaxed">
              {record.responseContent || 'Không có dữ liệu phản hồi'}
            </Paragraph>
          </div>
        </div>

        <div>
          <Divider orientation="left" className="!m-0 !mb-4">
            <Text strong className="text-gray-700 text-base">Dữ liệu Yêu cầu (Request JSON)</Text>
          </Divider>
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-inner overflow-auto">
            <pre className="text-gray-700 text-[12px] !m-0 whitespace-pre-wrap leading-relaxed font-mono">
              {record.requestJson ? JSON.stringify(JSON.parse(record.requestJson), null, 2) : 'Không có dữ liệu yêu cầu'}
            </pre>
          </div>
        </div>
      </div>
    </CommonDrawer>
  );
};

export default MESCompleteBatchDetail;
