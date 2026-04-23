import { Card, Progress, Typography } from 'antd';
import React from 'react';

const { Title, Text, Paragraph } = Typography;

interface IStatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subText?: string;
  percent?: number;
  loading?: boolean;
}

const StatCard: React.FC<IStatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  subText, 
  percent, 
  loading 
}) => {
  return (
    <Card 
      variant="borderless" 
      className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full"
      style={{ borderRadius: '12px', borderLeft: `4px solid ${color}` }}
      loading={loading}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Text type="secondary" className="text-[11px] font-bold uppercase tracking-wider block mb-1 opacity-70">
            {title}
          </Text>
          <div className="flex items-baseline gap-2">
            <Title level={3} className="!m-0 font-extrabold tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Title>
            {percent !== undefined && (
              <div 
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${percent > 90 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}
              >
                {percent}%
              </div>
            )}
          </div>
          {subText && (
            <Paragraph className="text-gray-400 text-[11px] !m-0 mt-2 line-clamp-1">
              {subText}
            </Paragraph>
          )}
        </div>
        <div 
          className="p-3 rounded-xl flex items-center justify-center" 
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          {icon && React.cloneElement(icon as React.ReactElement, { 
            style: { fontSize: '22px' } 
          })}
        </div>
      </div>
      
      {percent !== undefined && (
        <div className="mt-4">
          <Progress 
            percent={percent} 
            size="small" 
            showInfo={false} 
            strokeColor={color} 
            trailColor={`${color}10`}
            strokeWidth={4}
          />
        </div>
      )}
    </Card>
  );
};

export default StatCard;
