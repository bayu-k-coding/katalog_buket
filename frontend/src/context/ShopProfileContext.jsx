import React, { createContext, useContext, useState, useEffect } from 'react';
import { shopProfileService } from '../services/api';
import { mockShopProfile } from '../services/mockData';

const ShopProfileContext = createContext();

export const ShopProfileProvider = ({ children }) => {
  const [shopProfile, setShopProfile] = useState(() => {
    const saved = localStorage.getItem('intan_buket_shop_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return mockShopProfile;
      }
    }
    return mockShopProfile;
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await shopProfileService.get();
      if (res?.data) {
        setShopProfile(res.data);
        localStorage.setItem('intan_buket_shop_profile', JSON.stringify(res.data));
      }
    } catch (error) {
      console.warn('Gagal memuat profil toko:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateShopProfile = (newProfile) => {
    setShopProfile(newProfile);
    localStorage.setItem('intan_buket_shop_profile', JSON.stringify(newProfile));
  };

  const refreshShopProfile = async () => {
    await fetchProfile();
  };

  return (
    <ShopProfileContext.Provider
      value={{
        shopProfile,
        isLoading,
        updateShopProfile,
        refreshShopProfile
      }}
    >
      {children}
    </ShopProfileContext.Provider>
  );
};

export const useShopProfile = () => {
  const context = useContext(ShopProfileContext);
  if (!context) {
    return {
      shopProfile: mockShopProfile,
      isLoading: false,
      updateShopProfile: () => {},
      refreshShopProfile: () => {}
    };
  }
  return context;
};

export default ShopProfileContext;

