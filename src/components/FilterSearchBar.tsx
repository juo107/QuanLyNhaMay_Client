import { ReloadOutlined } from '@ant-design/icons';
import { Button, DatePicker, Input, Select } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
import CheckboxSelect from './CheckboxSelect';

const { RangePicker } = DatePicker;

interface IOption {
  value: string;
  label: string;
}

interface ISearchFilter {
  type: 'search';
  key: string;
  placeholder?: string;
  width?: number;
}

interface ICheckboxSelectFilter {
  type: 'checkboxSelect';
  key: string;
  placeholder?: string;
  options: IOption[];
  minWidth?: number;
}

interface ISelectFilter {
  type: 'select';
  key: string;
  placeholder?: string;
  options: IOption[];
  width?: number;
}

interface IDateRangeFilter {
  type: 'dateRange';
  key: [string, string];
  placeholder?: [string, string];
}

interface IAutoCompleteFilter {
  type: 'autocomplete';
  key: string;
  table: string;
  column: string;
  placeholder?: string;
  width?: number;
}

export type FilterItem = ISearchFilter | ICheckboxSelectFilter | ISelectFilter | IDateRangeFilter | IAutoCompleteFilter;

import CommonAutoComplete from './CommonAutoComplete';

interface IFilterSearchBarProps {
  filters: FilterItem[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onRefresh?: () => void;
  extraActions?: React.ReactNode;
}

export const FilterSearchBar: React.FC<IFilterSearchBarProps> = ({
  filters,
  values,
  onChange,
  onRefresh,
  extraActions,
}) => {
  const { isMobile } = useResponsive();
  const renderFilter = (filter: FilterItem, index: number) => {
    switch (filter.type) {
      case 'search':
        return (
          <Input
            key={index}
            placeholder={filter.placeholder || 'Tìm kiếm...'}
            onPressEnter={(e) => onChange(filter.key, (e.target as HTMLInputElement).value)}
            onBlur={(e) => onChange(filter.key, e.target.value)}
            onChange={(e) => {
              if (!e.target.value) onChange(filter.key, undefined);
            }}
            style={{ width: isMobile ? '100%' : (filter.width || 260) }}
            allowClear
          />
        );

      case 'checkboxSelect': {
        const rawValue = values[filter.key];
        const arrayValue = Array.isArray(rawValue)
          ? rawValue
          : (typeof rawValue === 'string' && rawValue ? rawValue.split(',') : []);

        return (
          <CheckboxSelect
            key={index}
            placeholder={filter.placeholder}
            style={{ width: isMobile ? '100%' : (filter.minWidth || 180), minWidth: isMobile ? '100%' : (filter.minWidth || 180) }}
            value={arrayValue}
            onChange={(selected: string[]) => onChange(filter.key, selected)}
            options={filter.options}
          />
        );
      }

      case 'select':
        return (
          <Select
            key={index}
            placeholder={filter.placeholder}
            style={{ width: isMobile ? '100%' : (filter.width || 180) }}
            value={values[filter.key] || undefined}
            onChange={(val) => onChange(filter.key, val)}
            allowClear
            options={filter.options}
          />
        );

      case 'dateRange': {
        const startValue = values[filter.key[0]] ? dayjs(values[filter.key[0]]) : null;
        const endValue = values[filter.key[1]] ? dayjs(values[filter.key[1]]) : null;

        if (isMobile) {
          return (
            <div key={index} className="flex flex-col gap-2 w-full">
              <DatePicker
                placeholder={filter.placeholder?.[0] || 'Từ ngày'}
                value={startValue}
                onChange={(_, dateString) => onChange(filter.key[0], dateString)}
                className="w-full"
              />
              <DatePicker
                placeholder={filter.placeholder?.[1] || 'Đến ngày'}
                value={endValue}
                onChange={(_, dateString) => onChange(filter.key[1], dateString)}
                className="w-full"
              />
            </div>
          );
        }

        return (
          <RangePicker
            key={index}
            style={{ width: isMobile ? '100%' : 'auto' }}
            placeholder={filter.placeholder || ['Từ ngày', 'Đến ngày']}
            value={startValue && endValue ? [startValue, endValue] : null}
            onChange={(_: any, dateStrings: [string, string] | null) => {
              onChange(filter.key[0], dateStrings ? dateStrings[0] : '');
              onChange(filter.key[1], dateStrings ? dateStrings[1] : '');
            }}
            presets={[
              { label: 'Hôm nay', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
              { label: 'Hôm qua', value: [dayjs().subtract(1, 'd').startOf('day'), dayjs().subtract(1, 'd').endOf('day')] },
              { label: '7 ngày qua', value: [dayjs().subtract(7, 'd'), dayjs()] },
              { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
            ]}
          />
        );
      }

      case 'autocomplete':
        return (
          <div key={index} style={{ width: isMobile ? '100%' : (filter.width || 200) }}>
            <CommonAutoComplete
              table={filter.table}
              column={filter.column}
              placeholder={filter.placeholder}
              value={values[filter.key] || ''}
              onChange={(val) => onChange(filter.key, val)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
        {filters.map((filter, index) => renderFilter(filter, index))}
      </div>
      <div className="flex gap-2 w-full sm:w-auto justify-end">
        {onRefresh && (
          <Button icon={<ReloadOutlined />} onClick={onRefresh} className={isMobile ? "flex-1" : ""}>Làm mới</Button>
        )}
        {extraActions}
      </div>
    </div>
  );
};

export default FilterSearchBar;
