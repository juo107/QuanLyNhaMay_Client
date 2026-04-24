import { Card, Progress, Typography } from 'antd';
import React, { cloneElement, isValidElement } from 'react';
import CountUp from 'react-countup';

const { Title, Text, Paragraph } = Typography;

// Fix for ESM/CJS interop issues with react-countup in some environments
const CountUpComponent = (CountUp as any).default || CountUp;

interface IStatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subText?: string;
  percent?: number;
}

const StatCard: React.FC<IStatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  subText, 
  percent 
}) => {
  return (
    <Card 
      variant="borderless" 
      className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full"
      style={{ borderRadius: '12px', borderLeft: `4px solid ${color}` }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Text type="secondary" className="text-[11px] font-bold uppercase tracking-wider block mb-1 opacity-70">
            {title}
          </Text>
          <div className="flex items-baseline gap-2">
            <Title level={3} className="!m-0 font-extrabold tracking-tight">
              {typeof value === 'number' ? (
                <CountUpComponent end={value} duration={1.5} separator="," />
              ) : value}
            </Title>
            {percent !== undefined && (
              <div 
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${percent > 90 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}
              >
                <CountUpComponent end={percent} duration={1.5} />%
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
          {isValidElement(icon) ? cloneElement(icon as React.ReactElement<{ style?: React.CSSProperties }>, { 
            style: { fontSize: '22px' } 
          }) : icon}
        </div>
      </div>
      
      {percent !== undefined && (
        <div className="mt-4">
          <Progress 
            percent={percent} 
            size={4} 
            showInfo={false} 
            strokeColor={color} 
            railColor={`${color}10`}
          />
        </div>
      )}
    </Card>
  );
};

export default StatCard;
