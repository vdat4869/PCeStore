import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product.productId);
      if (existing) {
        return prev.map(i =>
          i.productId === product.productId
            ? { ...i, quantity: i.quantity + (product.quantity || 1) }
            : i
        );
      }
      const newItem = { ...product, quantity: product.quantity || 1 };
      // Tự động chọn item mới thêm vào
      setSelectedItems(s => [...s, product.productId]);
      return [...prev, newItem];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(i => i.productId !== productId));
    setSelectedItems(prev => prev.filter(id => id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(i => i.productId === productId ? { ...i, quantity } : i)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedItems([]);
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, selectedItems, setSelectedItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
