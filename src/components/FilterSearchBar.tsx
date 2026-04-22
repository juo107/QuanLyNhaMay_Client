import React from 'react';
import { Input, Button, DatePicker, Select } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import CheckboxSelect from './CheckboxSelect';
import dayjs from 'dayjs';

const { Search } = Input;
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

export type FilterItem = ISearchFilter | ICheckboxSelectFilter | ISelectFilter | IDateRangeFilter;

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
  const renderFilter = (filter: FilterItem, index: number) => {
    switch (filter.type) {
      case 'search':
        return (
          <Input
            key={index}
            placeholder={filter.placeholder || 'Tìm kiếm...'}
            onPressEnter={(e) => onChange(filter.key, (e.target as HTMLInputElement).value)}
            onBlur={(e) => onChange(filter.key, e.target.value)}
            style={{ width: filter.width || 260 }}
            allowClear
          />
        );

      case 'checkboxSelect':
        return (
          <CheckboxSelect
            key={index}
            placeholder={filter.placeholder}
            style={{ minWidth: filter.minWidth || 180 }}
            value={values[filter.key] ? values[filter.key].split(',') : []}
            onChange={(selected: string[]) => onChange(filter.key, selected.join(','))}
            options={filter.options}
          />
        );

      case 'select':
        return (
          <Select
            key={index}
            placeholder={filter.placeholder}
            style={{ width: filter.width || 180 }}
            value={values[filter.key] || undefined}
            onChange={(val) => onChange(filter.key, val)}
            allowClear
            options={filter.options}
          />
        );

      case 'dateRange':
        return (
          <RangePicker
            key={index}
            placeholder={filter.placeholder || ['Từ ngày', 'Đến ngày']}
            value={values[filter.key[0]] && values[filter.key[1]] ? [dayjs(values[filter.key[0]]), dayjs(values[filter.key[1]])] : null}
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

      default:
        return null;
    }
  };

  return (
    <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
      <div className="flex gap-3 items-center flex-wrap">
        {filters.map((filter, index) => renderFilter(filter, index))}
      </div>
      <div className="flex gap-2">
        {onRefresh && (
          <Button icon={<ReloadOutlined />} onClick={onRefresh}>Làm mới</Button>
        )}
        {extraActions}
      </div>
    </div>
  );
};

export default FilterSearchBar;
