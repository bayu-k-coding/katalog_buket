import {
  mockCategories,
  mockProducts,
  mockShopProfile,
  mockPaymentMethods,
  mockOrders,
  mockUsers
} from './mockData';

// Pure UI Services — Menyajikan data visual langsung tanpa ketergantungan server/backend logic
export const categoryService = {
  getAll: () => Promise.resolve({ data: mockCategories }),
  getById: (id) => Promise.resolve({ data: mockCategories.find(c => c.id_kategori === Number(id)) })
};

export const productService = {
  getAll: () => Promise.resolve({ data: mockProducts }),
  getById: (id) => Promise.resolve({ data: mockProducts.find(p => p.id_produk === Number(id)) })
};

export const orderService = {
  getAll: () => Promise.resolve({ data: mockOrders }),
  getMyOrders: () => Promise.resolve({ data: mockOrders }),
  getById: (id) => Promise.resolve({ data: mockOrders.find(o => o.id_pesanan === Number(id)) })
};

export const paymentMethodService = {
  getAll: () => Promise.resolve({ data: mockPaymentMethods })
};

export const shopProfileService = {
  get: () => Promise.resolve({ data: mockShopProfile })
};

export const userService = {
  getAll: () => Promise.resolve({ data: mockUsers })
};

export default {
  categoryService,
  productService,
  orderService,
  paymentMethodService,
  shopProfileService,
  userService
};
