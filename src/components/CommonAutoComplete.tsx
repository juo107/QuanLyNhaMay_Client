import React from 'react';
import { AutoComplete, Input } from 'antd';
import { useSuggestions } from '../hooks/useSuggestions';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';

interface CommonAutoCompleteProps {
  table: string;
  column: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}

const CommonAutoComplete: React.FC<CommonAutoCompleteProps> = ({
  table,
  column,
  placeholder = 'Tìm kiếm...',
  value,
  onChange,
  style
}) => {
  const [inputValue, setInputValue] = React.useState(value || '');
  const { options, loading, fetchSuggestions } = useSuggestions(table, column);

  // Cập nhật giá trị nội bộ khi giá trị từ props (URL) thay đổi (ví dụ: khi nhấn Clear)
  React.useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleSearch = (val: string) => {
    setInputValue(val);
    fetchSuggestions(val);
  };

  const handleSelect = (val: string) => {
    setInputValue(val);
    if (onChange) onChange(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onChange) onChange(inputValue);
    }
  };

  const handleValueChange = (val: string) => {
    setInputValue(val);
    // Nếu người dùng xóa sạch text (nhấn nút x), cập nhật ngay lên Router để đồng bộ URL
    if (!val && onChange) {
      onChange('');
    }
  };

  return (
    <AutoComplete
      options={options}
      onSearch={handleSearch}
      onSelect={handleSelect}
      value={inputValue}
      onChange={handleValueChange}
      filterOption={false}
      popupMatchSelectWidth={false}
      style={{ width: '100%', ...style }}
    >
      <Input
        placeholder={placeholder}
        allowClear
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        suffix={loading ? <LoadingOutlined spin /> : null}
        onKeyDown={handleKeyDown}
      />
    </AutoComplete>
  );
};

export default CommonAutoComplete;
