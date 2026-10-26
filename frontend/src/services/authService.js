import apiClient from './apiClient';

export const authService = {
  /**
   * Login user via backend Laravel Sanctum
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: Object, token: string, message: string }>}
   */
  login: async (email, password) => {
    const response = await apiClient.post('/login', { email, password });
    return response.data;
  },

  /**
   * Register new customer account
   * @param {Object} userData
   * @returns {Promise<{ user: Object, token: string, message: string }>}
   */
  register: async (userData) => {
    const response = await apiClient.post('/register', userData);
    return response.data;
  },

  /**
   * Request password reset link via email
   * @param {string} email
   * @returns {Promise<{ message: string, debug_reset_url?: string }>}
   */
  forgotPassword: async (email) => {
    const response = await apiClient.post('/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   * @param {{ token: string, email: string, password: string, password_confirmation: string }} data
   * @returns {Promise<{ message: string }>}
   */
  resetPassword: async (data) => {
    const response = await apiClient.post('/reset-password', data);
    return response.data;
  },

  /**
   * Get current authenticated user details
   * @returns {Promise<Object>}
   */
  getProfile: async () => {
    const response = await apiClient.get('/user');
    return response.data;
  },

  /**
   * Update profile details
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  updateProfile: async (data) => {
    const response = await apiClient.put('/profile', data);
    return response.data;
  },

  /**
   * Change authenticated user password
   * @param {{ current_password: string, password: string, password_confirmation: string }} data
   * @returns {Promise<{ message: string }>}
   */
  changePassword: async (data) => {
    const response = await apiClient.put('/change-password', data);
    return response.data;
  },

  /**
   * Revoke current token / Logout
   * @returns {Promise<Object>}
   */
  logout: async () => {
    try {
      const response = await apiClient.post('/logout');
      return response.data;
    } catch (e) {
      // Abaikan error jika token di server sudah tidak valid
      return { message: 'Logged out locally' };
    }
  }
};

export default authService;
