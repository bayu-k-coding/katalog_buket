import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Verifikasi dan sinkronisasi session dengan server backend saat aplikasi dimuat
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } catch (error) {
          // Token tidak valid atau server menolak
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsInitializing(false);
    };

    verifySession();
  }, []);

  /**
   * Login pengguna via API Laravel Sanctum
   */
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      // Backend mengembalikan: { message, user, token }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setIsLoading(false);
      return { success: true, user: data.user, message: data.message };
    } catch (error) {
      setIsLoading(false);
      let errorMsg = 'Email atau password yang Anda masukkan salah.';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const firstKey = Object.keys(error.response.data.errors)[0];
        errorMsg = error.response.data.errors[firstKey][0];
      } else if (error.message) {
        errorMsg = error.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Register pelanggan baru via API Laravel Sanctum
   */
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setIsLoading(false);
      return { success: true, user: data.user, message: data.message };
    } catch (error) {
      setIsLoading(false);
      let errorMsg = 'Pendaftaran akun gagal. Silakan periksa kembali data Anda.';
      if (error.response?.data?.errors) {
        const firstKey = Object.keys(error.response.data.errors)[0];
        errorMsg = error.response.data.errors[firstKey][0];
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Logout pengguna dari backend dan hapus sesi lokal
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (e) {
      // Ignore network error on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setIsLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isInitializing,
      login,
      register,
      logout,
      isAuthenticated: Boolean(token && user),
      isAdmin,
      isSuperAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
