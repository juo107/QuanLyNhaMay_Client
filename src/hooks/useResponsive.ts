import { Grid } from 'antd';

const { useBreakpoint } = Grid;

/**
 * Hook chung để xử lý Responsive dựa trên hệ thống Breakpoint của Ant Design.
 * - xs: < 576px
 * - sm: >= 576px
 * - md: >= 768px
 * - lg: >= 992px
 * - xl: >= 1200px
 * - xxl: >= 1600px
 */
export const useResponsive = () => {
  const screens = useBreakpoint();

  // Các cờ (flags) định nghĩa sẵn thiết bị, sử dụng !! để ép kiểu về boolean thuần tuý
  // Tránh trường hợp ở lần render đầu tiên screens chưa kịp khởi tạo khiến biến trả về undefined
  const isMobile = !!((screens.xs || screens.sm) && !screens.md); // Màn hình nhỏ gọn (Điện thoại)
  const isTablet = !!(screens.md && !screens.lg); // Màn hình vừa (iPad, Máy tính bảng)
  const isDesktop = !!screens.lg; // Màn hình máy tính trở lên
  const isLargeDesktop = !!screens.xl; // Màn hình máy tính kích thước lớn

  return {
    // Trả về đối tượng raw screens của Ant Design { xs, sm, md, lg, xl, xxl }
    screens,

    // Trả về cờ tiện lợi
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
  };
};

export default useResponsive;
