import React from 'react';
import { Card, Tag, Typography, Progress, Button, Row, Col } from 'antd';
import { PlayCircleFilled, RightOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface IDetailItem {
  label: string;
  value: React.ReactNode;
  span?: number;
}

interface ICardCommonProps {
  title: string;
  onTitleClick?: () => void;
  statusText: string;
  statusColor?: string;
  statusIcon?: React.ReactNode;
  productCode: string;
  productName: string;
  subInfo?: string;
  details: IDetailItem[];
  progress: number;
  onActionClick?: () => void;
  actionText?: string;
  currentBatch?: number;
  totalBatch?: number;
}

export const CardCommon: React.FC<ICardCommonProps> = ({
  title,
  onTitleClick,
  statusText,
  statusColor = 'orange',
  statusIcon = <PlayCircleFilled />,
  productCode,
  productName,
  subInfo,
  details,
  progress,
  onActionClick,
  actionText = 'Xem Chi tiết',
  currentBatch = 0,
  totalBatch = 0
}) => {
  return (
    <Card
      hoverable
      className="shadow-sm rounded-xl overflow-hidden border-gray-100"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div
          onClick={onTitleClick}
          className="cursor-pointer text-gray-900 hover:text-blue-600 m-0 text-[15px] font-bold tracking-tight"
        >
          {title}
        </div>
        <Tag
          icon={statusIcon}
          className="m-0 border-none px-3 py-1 flex items-center gap-1 rounded-full text-white font-medium shadow-sm"
          style={{
            background: statusColor === 'orange' ? 'linear-gradient(90deg, #FF8C00 0%, #FFA500 100%)' : statusColor,
          }}
        >
          {statusText}
        </Tag>
      </div>

      {/* Product Info */}
      <div className="mb-4 min-h-[60px]">
        <div className="text-[15px] text-gray-800 leading-snug">
          <span className="font-bold text-gray-700">Product Code:</span> <span className="font-normal text-gray-900">{productCode}</span>
          {productName && <span className="text-gray-600 font-normal"> - {productName}</span>}
        </div>
        {subInfo && <div className="text-gray-500 text-[13px] mt-1">{subInfo}</div>}
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5">
        {details.map((item, index) => (
          <div key={index} className={item.span === 2 ? 'col-span-2' : ''}>
            <div className="text-gray-700 font-bold text-[12px] tracking-wide mb-1">
              {item.label}
            </div>
            <div className="text-gray-800 font-normal text-[12px] bg-gray-50 px-2 py-1 rounded inline-block min-w-[40px] border border-gray-100">
              {item.value !== undefined && item.value !== null ? item.value : '-'}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="text-gray-700 font-bold text-[12px] tracking-wide mb-2">
          Tiến độ
        </div>
        <Progress
          percent={progress}
          size="small"
          strokeColor="#5b4ce8"
          trailColor="#f0f0f0"
          format={(percent) => (
            <span className="text-[12px] text-gray-500 font-medium">
              {Math.round(percent || 0)}%
              <span className="text-gray-400 font-normal ml-1">({currentBatch}/{totalBatch})</span>
            </span>
          )}
        />
      </div>

      {/* Footer Action */}
      <div className="mt-auto">
        <Button
          type="primary"
          block
          className="h-[42px] bg-[#5b4ce8] border-none rounded-lg font-medium text-[15px] flex items-center justify-center hover:bg-[#4a3bc7]"
          onClick={onActionClick}
        >
          {actionText}
        </Button>
      </div>
    </Card>
  );
};

export default CardCommon;
