import React from 'react';
import { Select, Checkbox } from 'antd';

interface IOption {
  value: string;
  label: string;
}

interface ICheckboxSelectProps {
  options: IOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const CheckboxSelect: React.FC<ICheckboxSelectProps> = ({ options, value = [], onChange, placeholder, style }) => {
  const validOptions = options.filter(o => o.value && o.value.trim() !== '');
  const isAllSelected = validOptions.length > 0 && value.length === validOptions.length;
  const isIndeterminate = value.length > 0 && value.length < validOptions.length;

  const onSelectAll = (e: any) => {
    if (e.target.checked) {
      onChange(validOptions.map(o => o.value));
    } else {
      onChange([]);
    }
  };

  const selectedLabels = value
    .map(v => validOptions.find(o => o.value === v)?.label || v)
    .join(', ');

  return (
    <Select
      mode="multiple"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
      maxTagCount={0}
      allowClear
      maxTagPlaceholder={() => selectedLabels || placeholder}
      popupRender={(menu) => (
        <>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
            <Checkbox
              indeterminate={isIndeterminate}
              checked={isAllSelected}
              onChange={onSelectAll}
              style={{ fontWeight: 600 }}
            >
              Select all
            </Checkbox>
          </div>
          {menu}
        </>
      )}
      options={validOptions}
      optionRender={(option) => (
        <div style={{ display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
          <Checkbox checked={value.includes(option.value as string)} style={{ marginRight: 8 }} />
          {option.label}
        </div>
      )}
    />
  );
};

export default CheckboxSelect;
