import apiClient from './apiClient';
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
  getAll: async () => {
    try {
      const res = await apiClient.get('/categories');
      return res.data;
    } catch (e) {
      console.warn('API /categories unavailable, using mock data:', e);
      return { data: mockCategories };
    }
  },
  getById: async (id) => {
    try {
      const res = await apiClient.get(`/categories/${id}`);
      return res.data;
    } catch (e) {
      return { data: mockCategories.find(c => c.id_kategori === Number(id)) };
    }
  },
  create: async (data) => {
    const res = await apiClient.post('/admin/categories', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/admin/categories/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/admin/categories/${id}`);
    return res.data;
  }
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
  getAll: async () => {
    const res = await apiClient.get('/admin/users');
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/admin/users/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/admin/users', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/admin/users/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/admin/users/${id}`);
    return res.data;
  },
  toggleStatus: async (id) => {
    const res = await apiClient.patch(`/admin/users/${id}/toggle-status`);
    return res.data;
  }
};

export default {
  categoryService,
  productService,
  orderService,
  paymentMethodService,
  shopProfileService,
  userService
};
