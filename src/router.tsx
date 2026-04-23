import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router';
import { z } from 'zod';

// Import Pages
import AdminLayout from './components/AdminLayout';
import ConsumptionLog from './pages/ConsumptionLog';
import ProductionOrderDetail from './pages/ProductionOrderDetail';
import ProductionOrders from './pages/ProductionOrders';
import ProductionStatus from './pages/ProductionStatus';
import Products from './pages/Products';
import RecipeDetail from './pages/RecipeDetail';
import Recipes from './pages/Recipes';
import NotFound from './pages/NotFound';

// 1. Root Route - Sử dụng AdminLayout làm khung chính
const rootRoute = createRootRoute({
  component: AdminLayout,
  notFoundComponent: NotFound,
});

// 2. Định nghĩa các trang con
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: '/production-orders',
      search: { page: 1, limit: 20 }
    });
  },
});

// Helper để xử lý các tham số tìm kiếm có thể là chuỗi đơn hoặc mảng (như statuses, types, v.v.)
const arraySearchSchema = z.preprocess(
  (val) => (val === undefined ? undefined : Array.isArray(val) ? val : [val]),
  z.array(z.string()).optional()
);

// 3. Định nghĩa Search Schema cho Consumption Log (Đây là phần "ăn tiền" nhất)
const consumptionSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(20),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  productionOrderNumber: z.string().optional(),
  batchCode: z.string().optional(),
  ingredientCode: z.string().optional(),
  shift: arraySearchSchema,
  respone: arraySearchSchema,
});

const consumptionLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'consumption-log',
  component: ConsumptionLog,
  validateSearch: (search) => consumptionSearchSchema.parse(search),
});

// 4. Các route khác
const productionStatusSearchSchema = z.object({
  page: z.number().catch(1),
  limit: z.number().catch(20),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  searchQuery: z.string().optional(),
  processAreas: arraySearchSchema,
  shifts: arraySearchSchema,
  statuses: arraySearchSchema,
});

const productionStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'production-status',
  component: ProductionStatus,
  validateSearch: (search) => productionStatusSearchSchema.parse(search),
});

const productionOrdersSearchSchema = z.object({
  page: z.number().catch(1),
  limit: z.number().catch(20),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  pos: z.string().optional(),
  searchQuery: z.string().optional(),
  statuses: arraySearchSchema,
});

const productionOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'production-orders',
  component: ProductionOrders,
  validateSearch: (search) => productionOrdersSearchSchema.parse(search),
});

const productionOrderDetailSearchSchema = z.object({
  tab: z.enum(['batches', 'materials']).catch('batches'),
  batchFilter: z.string().optional(),
});

const productionOrderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'production-status/$id',
  component: ProductionOrderDetail,
  validateSearch: (search) => productionOrderDetailSearchSchema.parse(search),
});

const productsSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(20),
  q: z.string().optional(),
  types: arraySearchSchema,
  statuses: arraySearchSchema,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'products',
  component: Products,
  validateSearch: (search) => productsSearchSchema.parse(search),
});

const recipesSearchSchema = z.object({
  page: z.number().catch(1),
  limit: z.number().catch(20),
  search: z.string().optional(),
  statuses: arraySearchSchema,
});

const recipesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'recipes',
  component: Recipes,
  validateSearch: (search) => recipesSearchSchema.parse(search),
});

const recipeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'recipes/$id',
  component: RecipeDetail,
});

// 5. Tạo Route Tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  productionStatusRoute,
  productionOrdersRoute,
  productionOrderDetailRoute,
  productsRoute,
  recipesRoute,
  recipeDetailRoute,
  consumptionLogRoute,
]);

// 6. Khởi tạo Router
export const router = createRouter({ routeTree });

// Đăng ký router cho TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
