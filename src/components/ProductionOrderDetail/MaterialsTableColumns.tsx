import React from 'react';
import { Tag, Tooltip, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { IGroupedMaterial, IMaterialConsumption } from '../../types/productionOrderTypes';

interface GetColumnsProps {
  onView: (record: IGroupedMaterial) => void;
}

export const getMaterialsTableColumns = ({ onView }: GetColumnsProps) => [
  {
    title: 'ID',
    key: 'ids',
    width: 100,
    align: 'center' as const,
    render: (_: any, record: IGroupedMaterial) => {
      const count = record.items.length;
      if (count >= 2) return <span className="font-bold text-gray-800">{count} items</span>;
      return <span className="text-gray-400 font-medium">{record.ids[0] || '-'}</span>;
    }
  },
  {
    title: 'Batch Number',
    dataIndex: 'batchCode',
    key: 'batchCode',
    width: 160,
    render: (text: string) => {
      if (!text || text === '-') return <span className="text-gray-300 italic">-</span>;
      const batches = text.split(',').map(b => b.trim());
      
      // Nếu số lượng Batch ít (<= 5) thì hiện ra hết cho đẹp
      if (batches.length <= 5) {
        return (
          <div className="flex flex-wrap gap-1">
            {batches.map(b => (
              <Tag key={b} className="m-0 bg-blue-50 text-blue-600 border-blue-100 font-bold text-[11px]">
                {b}
              </Tag>
            ))}
          </div>
        );
      }
      return (
        <Tooltip 
          title={
            <div className="flex flex-wrap gap-1 p-1">
              {batches.map(b => (
                <Tag key={b} color="blue" className="m-0 font-bold text-[11px]">{b}</Tag>
              ))}
            </div>
          }
          overlayClassName="batch-tooltip"
        >
          <div className="flex items-center gap-1 cursor-help">
            <Tag className="m-0 bg-blue-50 text-blue-600 border-blue-100 font-bold text-[11px]">
              {batches[0]}
            </Tag>
            <Tag className="m-0 bg-blue-50 text-blue-600 border-blue-100 font-bold text-[11px]">
              {batches[1]}...
            </Tag>
            <span className="text-[10px] text-blue-500 font-medium">(+{batches.length - 2})</span>
          </div>
        </Tooltip>
      );
    }
  },
  {
    title: 'Nguyên vật liệu',
    dataIndex: 'ingredientCode',
    key: 'ingredientCode',
    width: 400,
    render: (text: string) => (
      <span className="text-[15px] font-medium text-gray-800 leading-relaxed block whitespace-normal">
        {text}
      </span>
    ),
  },
  {
    title: 'Lot',
    dataIndex: 'lot',
    key: 'lot',
    width: 100,
    align: 'center' as const,
    render: (text: string) => text ? <span className="text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{text}</span> : <span className="text-gray-300">-</span>,
  },
  {
    title: 'Plan Qty',
    key: 'totalPlanQuantity',
    align: 'right' as const,
    width: 140,
    render: (_: any, record: IGroupedMaterial) => (
      <div className="flex justify-end items-center gap-1.5">
        <span className="text-[13px] text-gray-800 font-medium">
          {record.totalPlanQuantity <= 0 ? 'N/A' : record.totalPlanQuantity.toFixed(2)}
        </span>
        <span className="text-[10px] text-gray-700 uppercase font-bold">{record.unitOfMeasurement}</span>
      </div>
    ),
  },
  {
    title: 'Actual Qty',
    key: 'totalQuantity',
    align: 'right' as const,
    width: 140,
    render: (_: any, record: IGroupedMaterial) => (
      <div className="flex justify-end items-center gap-1.5">
        <span className={`text-[13px] font-bold ${record.totalQuantity > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
          {record.totalQuantity <= 0 ? 'N/A' : record.totalQuantity.toFixed(2)}
        </span>
        <span className={`text-[10px] uppercase font-bold ${record.totalQuantity > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
          {record.unitOfMeasurement}
        </span>
      </div>
    ),
  },
  {
    title: 'Last Date',
    dataIndex: 'latestDatetime',
    key: 'latestDatetime',
    width: 150,
    align: 'center' as const,
    render: (text: string) => (
      <div className="flex flex-col items-center">
        <span className="text-[13px] text-gray-800 font-bold">{text ? dayjs(text).format('DD/MM/YYYY') : '-'}</span>
        <span className="text-[11px] text-gray-600 font-medium">{text ? dayjs(text).format('HH:mm:ss') : ''}</span>
      </div>
    ),
  },
  {
    title: 'Status',
    key: 'response',
    width: 110,
    align: 'center' as const,
    render: (_: any, record: IGroupedMaterial) => {
      const status = record.response;
      if (status === 'Success') return <span className="text-green-600 font-medium">Success</span>;
      if (status === 'Failed') return <span className="text-red-600 font-medium">Failed</span>;
      return <span className="text-gray-300">-</span>;
    }
  },
  {
    title: 'Actions',
    key: 'action',
    width: 60,
    align: 'center' as const,
    render: (_: any, record: IGroupedMaterial) => (
      <Tooltip title="Chi tiết">
        <Button
          type="text"
          shape="circle"
          className="flex items-center justify-center hover:bg-gray-100"
          icon={<EyeOutlined style={{ color: '#5b4ce8', fontSize: '18px' }} />}
          onClick={() => onView(record)}
        />
      </Tooltip>
    ),
  },
];
