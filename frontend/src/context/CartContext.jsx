import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('intan_buket_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Default initial mock cart items matching wireframe
    return [
      {
        id_produk: 1,
        nama_produk: 'Buket Wisuda Mawar Merah & Boneka Teddy',
        harga: 150000,
        jumlah: 1,
        foto: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80'
      },
      {
        id_produk: 2,
        nama_produk: 'Buket Uang Tower 10 Lembar Floral Gold',
        harga: 200000,
        jumlah: 1,
        foto: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('intan_buket_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id_produk === product.id_produk);
      if (existing) {
        return prev.map(item =>
          item.id_produk === product.id_produk
            ? { ...item, jumlah: item.jumlah + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id_produk: product.id_produk,
          nama_produk: product.nama_produk,
          harga: product.harga,
          jumlah: quantity,
          foto: product.foto
        }
      ];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) => {
      return prev
        .map(item => {
          if (item.id_produk === productId) {
            const newQty = item.jumlah + delta;
            return newQty > 0 ? { ...item, jumlah: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id_produk !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.jumlah, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItems,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
