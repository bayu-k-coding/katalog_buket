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
  getAll: async (params = {}) => {
    try {
      const res = await apiClient.get('/products', { params });
      return res.data;
    } catch (e) {
      console.warn('API /products unavailable, using fallback data:', e);
      return { data: mockProducts };
    }
  },
  getById: async (id) => {
    try {
      const res = await apiClient.get(`/products/${id}`);
      return res.data;
    } catch (e) {
      return { data: mockProducts.find(p => p.id_produk === Number(id)) };
    }
  },
  create: async (data) => {
    const res = await apiClient.post('/admin/products', data);
    return res.data;
  },
  update: async (id, data) => {
    if (data instanceof FormData) {
      if (!data.has('_method')) {
        data.append('_method', 'PUT');
      }
      const res = await apiClient.post(`/admin/products/${id}`, data);
      return res.data;
    }
    const res = await apiClient.put(`/admin/products/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/admin/products/${id}`);
    return res.data;
  }
};

export const paymentMethodService = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/payment-methods');
      return res.data;
    } catch (e) {
      console.warn('API /payment-methods unavailable, using fallback data:', e);
      return { data: mockPaymentMethods };
    }
  },
  getAdminAll: async () => {
    const res = await apiClient.get('/admin/payment-methods');
    return res.data;
  },
  update: async (id, data) => {
    if (data instanceof FormData) {
      if (!data.has('_method')) {
        data.append('_method', 'PUT');
      }
      const res = await apiClient.post(`/admin/payment-methods/${id}`, data);
      return res.data;
    }
    const res = await apiClient.put(`/admin/payment-methods/${id}`, data);
    return res.data;
  },
  toggleStatus: async (id) => {
    const res = await apiClient.patch(`/admin/payment-methods/${id}/toggle-status`);
    return res.data;
  }
};

export const paymentGatewayService = {
  getInvoice: async (orderId) => {
    const res = await apiClient.get(`/payment-gateway/${orderId}`);
    return res.data;
  },
  pay: async (orderId, channel = 'QRIS Instan') => {
    const res = await apiClient.post(`/payment-gateway/${orderId}/pay`, { channel });
    return res.data;
  },
  createMidtransToken: async (orderId) => {
    const res = await apiClient.post(`/payment-gateway/${orderId}/midtrans-token`);
    return res.data;
  }
};

export const orderService = {
  create: async (data) => {
    const res = await apiClient.post('/orders', data);
    return res.data;
  },
  getAll: async () => {
    try {
      const res = await apiClient.get('/admin/orders');
      return res.data;
    } catch (e) {
      try {
        const res = await apiClient.get('/orders');
        return res.data;
      } catch (err) {
        console.warn('API /orders unavailable, using fallback:', err);
        return { data: mockOrders };
      }
    }
  },
  getMyOrders: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await apiClient.get('/my-orders');
        return res.data;
      }
      const res = await apiClient.get('/my-orders-preview');
      return res.data;
    } catch (e) {
      console.warn('API /my-orders unavailable, using fallback:', e);
      return { data: mockOrders };
    }
  },
  getById: async (id) => {
    try {
      const res = await apiClient.get(`/orders/${id}`);
      return res.data;
    } catch (e) {
      return { data: mockOrders.find(o => o.id_pesanan === Number(id)) };
    }
  },
  updateStatus: async (id, status) => {
    const res = await apiClient.patch(`/admin/orders/${id}/status`, { status_pesanan: status });
    return res.data;
  },
  verifyPayment: async (id, paymentStatus) => {
    const res = await apiClient.patch(`/admin/orders/${id}/payment`, { status_pembayaran: paymentStatus });
    return res.data;
  },
  uploadProof: async (id, formDataOrData) => {
    const res = await apiClient.post(`/orders/${id}/upload-proof`, formDataOrData);
    return res.data;
  }
};

export const shopProfileService = {
  get: async () => {
    try {
      const res = await apiClient.get('/shop-profile');
      return res.data;
    } catch (e) {
      console.warn('API /shop-profile unavailable, using fallback data:', e);
      return { data: mockShopProfile };
    }
  },
  update: async (data) => {
    if (data instanceof FormData) {
      if (!data.has('_method')) {
        data.append('_method', 'PUT');
      }
      const res = await apiClient.post('/admin/shop-profile', data);
      return res.data;
    }
    const res = await apiClient.put('/admin/shop-profile', data);
    return res.data;
  }
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
  paymentGatewayService,
  shopProfileService,
  userService
};
