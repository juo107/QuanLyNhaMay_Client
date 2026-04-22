/**
 * Chuyển đổi mã đơn vị sang tiếng Việt có dấu
 * @param unit Mã đơn vị (ví dụ: 'cai', 'lit', 'kg')
 * @returns Tên đơn vị có dấu (ví dụ: 'Cái', 'Lít', 'Kg')
 */
export const formatUnit = (unit: string | undefined): string => {
  if (!unit) return '';
  
  const unitMap: Record<string, string> = {
    'cai': 'Cái',
    'lit': 'Lít',
    'kg': 'Kg',
    'm': 'Mét',
    'g': 'Gam',
    'thung': 'Thùng',
    'bao': 'Bao',
    'cuon': 'Cuộn',
    'pallet': 'Pallet',
    'set': 'Bộ',
    'unit': 'Đơn vị',
  };

  const normalizedUnit = unit.toLowerCase().trim();
  return unitMap[normalizedUnit] || unit;
};

/**
 * Định dạng số với phân tách hàng nghìn
 * @param val Giá trị số
 * @returns Chuỗi định dạng (ví dụ: "1,234.56")
 */
export const formatNumber = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '0';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0';
  
  return new Intl.NumberFormat('en-US').format(num);
};
