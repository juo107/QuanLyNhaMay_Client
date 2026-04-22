import React from 'react';
import { Typography, Descriptions, Divider, Tag, Button, message } from 'antd';
import { 
  HistoryOutlined, CheckCircleOutlined, CloseCircleOutlined, 
  CopyOutlined, SyncOutlined, CloudUploadOutlined, CheckOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { IConsumptionRecord } from '../../types/consumption';

const { Text } = Typography;

interface Props {
  selectedRecord: IConsumptionRecord;
}

const ConsumptionLogDetail: React.FC<Props> = ({ selectedRecord }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép vào bộ nhớ tạm');
  };

  const renderStatus = (val: string | undefined, type: 'response' | 'status' | 'status1') => {
    const text = val || '-';
    const lowerText = text.toLowerCase();
    
    if (type === 'response') {
      const isSuccess = lowerText.includes('success');
      return (
        <Tag icon={isSuccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />} color={isSuccess ? 'success' : 'error'}>
          {isSuccess ? 'Thành công' : 'Thất bại'}
        </Tag>
      );
    }
    
    if (type === 'status') {
      let color = 'default';
      let label = text;
      if (lowerText === 'pending') { color = 'warning'; label = 'Chờ xử lý'; }
      if (lowerText === 'completed') { color = 'success'; label = 'Hoàn thành'; }
      return <Tag color={color}>{label}</Tag>;
    }
    
    if (type === 'status1') {
      let color = 'default';
      let label = text;
      let icon = null;
      if (lowerText === 'sent') { color = 'geekblue'; label = 'Đã gửi'; icon = <CheckOutlined />; }
      if (lowerText === 'retrying') { color = 'orange'; label = 'Đang thử lại'; icon = <SyncOutlined spin />; }
      if (lowerText === 'failed') { color = 'red'; label = 'Lỗi gửi'; icon = <CloseCircleOutlined />; }
      return <Tag icon={icon} color={color}>{label}</Tag>;
    }
    
    return <Tag>{text}</Tag>;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Section 1: Thông tin bản ghi */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <HistoryOutlined className="text-blue-500" />
          <span className="font-bold text-gray-700 uppercase tracking-wider text-xs">Thông tin bản ghi</span>
        </div>
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="ID" span={2}>{selectedRecord.id}</Descriptions.Item>
          <Descriptions.Item label="Lệnh SX (PO)">{selectedRecord.productionOrderNumber || '-'}</Descriptions.Item>
          <Descriptions.Item label="Mã Lô (Batch)">{selectedRecord.batchCode || '-'}</Descriptions.Item>
          <Descriptions.Item label="Vật Liệu" span={2}>{selectedRecord.ingredientCode}</Descriptions.Item>
          <Descriptions.Item label="Số Lượng Thật">
            <Text strong className="text-blue-600">{selectedRecord.quantity} {selectedRecord.unitOfMeasurement}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Ca">{selectedRecord.shift || '-'}</Descriptions.Item>
          <Descriptions.Item label="Thời gian" span={2}>
            {selectedRecord.datetime ? dayjs(selectedRecord.datetime).format('DD/MM/YYYY HH:mm:ss') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </section>

      <Divider className="my-2" />

      {/* Section 2: Trạng thái hệ thống */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CloudUploadOutlined className="text-indigo-500" />
          <span className="font-bold text-gray-700 uppercase tracking-wider text-xs">Trạng thái hệ thống</span>
        </div>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div>
            <div className="text-gray-500 text-xs mb-1">Kết quả gửi (Response)</div>
            {renderStatus(selectedRecord.response, 'response')}
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">Truyền tin (Status1)</div>
            {renderStatus(selectedRecord.status1, 'status1')}
          </div>
          <div className="col-span-2">
            <div className="text-gray-500 text-xs mb-1">Quy trình (Status)</div>
            {renderStatus(selectedRecord.status, 'status')}
          </div>
        </div>
      </section>

      {/* Section 3: Dữ liệu JSON */}
      <section className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <CopyOutlined className="text-orange-500" />
            <span className="font-bold text-gray-700 uppercase tracking-wider text-xs">Dữ liệu truyền nhận</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Text type="secondary" style={{ fontSize: '12px' }}>Dữ liệu gửi đi (Request)</Text>
            <Button size="small" type="text" icon={<CopyOutlined />} onClick={() => copyToClipboard(selectedRecord.request || '')}>Copy</Button>
          </div>
          <pre className="bg-gray-50 text-gray-800 p-4 rounded border border-gray-200 text-xs overflow-auto max-h-60 font-mono">
            {(() => {
              try {
                return JSON.stringify(JSON.parse(selectedRecord.request || ''), null, 2);
              } catch {
                return selectedRecord.request || '-';
              }
            })()}
          </pre>
        </div>

        {selectedRecord.response?.toLowerCase() !== 'success' && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <Text type="secondary" style={{ fontSize: '12px' }}>Phản hồi chi tiết (Response)</Text>
              <Button size="small" type="text" icon={<CopyOutlined />} onClick={() => copyToClipboard(selectedRecord.response || '')}>Copy</Button>
            </div>
            <pre className="bg-gray-50 text-gray-800 p-4 rounded border border-gray-200 text-xs overflow-auto max-h-60 font-mono">
              {(() => {
                const fullContent = selectedRecord.response || '-';
                try {
                  const jsonPart = fullContent.includes('Body:') ? fullContent.split('Body:')[1] : fullContent;
                  return JSON.stringify(JSON.parse(jsonPart), null, 2);
                } catch {
                  return fullContent;
                }
              })()}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
};

export default ConsumptionLogDetail;
