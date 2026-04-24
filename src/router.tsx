import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import dayjs from 'dayjs';

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
import MESCompleteBatch from './pages/MESCompleteBatch';

// ─────────────────────────────────────────────
// FIX 1: Dùng z.coerce.number() thay vì z.number()
// z.number().catch(1)  → không coerce string "1" → đôi khi fallback → queryKey nhảy
// z.coerce.number()    → luôn parse "1" → 1 đúng cách → queryKey ổn định
// ─────────────────────────────────────────────
const pageSchema = z.coerce.number().min(1).catch(1);
const limitSchema = z.coerce.number().min(1).catch(20);

// ─────────────────────────────────────────────
// FIX 2: arraySearchSchema chuẩn hơn
// Thêm z.coerce.string() để tránh trường hợp value là number bị lọc ra
// ─────────────────────────────────────────────
const arraySearchSchema = z.preprocess(
  (val) => {
    if (val === undefined || val === null || val === '') return undefined;
    if (Array.isArray(val)) return val.filter(Boolean); // lọc phần tử rỗng
    return [String(val)];
  },
  z.array(z.coerce.string()).optional()
);

// ─────────────────────────────────────────────
// Root Route
// ─────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: AdminLayout,
  notFoundComponent: NotFound,
});

// ─────────────────────────────────────────────
// Index Route → redirect về production-orders
// ─────────────────────────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: '/production-orders',
      search: {
        page: 1,
        limit: 20,
        dateFrom: dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        dateTo: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      },
    });
  },
});

// ─────────────────────────────────────────────
// Consumption Log
// ─────────────────────────────────────────────
const consumptionSearchSchema = z.object({
  page: pageSchema,
  pageSize: limitSchema,
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

// ─────────────────────────────────────────────
// Production Status
// ─────────────────────────────────────────────
const productionStatusSearchSchema = z.object({
  page: pageSchema,
  limit: limitSchema,
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

// ─────────────────────────────────────────────
// Production Orders
// FIX 3: Bỏ field pos riêng — dùng searchQuery thống nhất
// Nếu vẫn cần pos thì giữ, nhưng đảm bảo không trùng với searchQuery
// ─────────────────────────────────────────────
const productionOrdersSearchSchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  pos: z.string().optional(),
  searchQuery: z.string().optional(),
  productCode: z.string().optional(),
  processAreas: arraySearchSchema,
  shifts: arraySearchSchema,
  statuses: arraySearchSchema,
});

const productionOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'production-orders',
  component: ProductionOrders,
  validateSearch: (search) => productionOrdersSearchSchema.parse(search),
});

// ─────────────────────────────────────────────
// Production Order Detail
// ─────────────────────────────────────────────
const productionOrderDetailSearchSchema = z.object({
  tab: z.enum(['batches', 'materials']).catch('batches'),
  batchFilter: z.string().optional(),
}).passthrough();

const productionOrderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'production-status/$id',
  component: ProductionOrderDetail,
  validateSearch: (search) => productionOrderDetailSearchSchema.parse(search),
});

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────
const productsSearchSchema = z.object({
  page: pageSchema,
  pageSize: limitSchema,
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

// ─────────────────────────────────────────────
// Recipes
// ─────────────────────────────────────────────
const recipesSearchSchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  statuses: arraySearchSchema,
});

const recipesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'recipes',
  component: Recipes,
  validateSearch: (search) => recipesSearchSchema.parse(search),
});

// ─────────────────────────────────────────────
// MES Complete Batch
// ─────────────────────────────────────────────
const mesCompleteBatchSearchSchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  searchQuery: z.string().optional(),
  productionOrder: z.string().optional(),
  batchNumber: z.string().optional(),
  machineCode: z.string().optional(),
  transferStatus: z.string().optional(),
});

const mesCompleteBatchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'mes-complete-batch',
  component: MESCompleteBatch,
  validateSearch: (search) => mesCompleteBatchSearchSchema.parse(search),
});

// ─────────────────────────────────────────────
// Recipe Detail
// ─────────────────────────────────────────────
const recipeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'recipes/$id',
  component: RecipeDetail,
});

// ─────────────────────────────────────────────
// Route Tree & Router
// ─────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  productionStatusRoute,
  productionOrdersRoute,
  productionOrderDetailRoute,
  productsRoute,
  recipesRoute,
  recipeDetailRoute,
  consumptionLogRoute,
  mesCompleteBatchRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}