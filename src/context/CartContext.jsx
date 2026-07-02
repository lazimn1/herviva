import { createContext, useContext, useEffect, useState } from 'react';
import { cartLineKey } from '../utils/formatPrice';

const CartContext = createContext(null);
const STORAGE_KEY = 'herviva-cart';

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const addToCart = (product, size) => {
    const lineKey = cartLineKey(product.id, size);
    setCart((prev) => {
      const existing = prev.find((item) => item.lineKey === lineKey);
      if (existing) {
        return prev.map((item) =>
          item.lineKey === lineKey ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, size, lineKey, qty: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (lineKey) => {
    setCart((prev) => prev.filter((item) => item.lineKey !== lineKey));
  };

  const updateQty = (lineKey, qty) => {
    if (qty < 1) {
      removeFromCart(lineKey);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.lineKey === lineKey ? { ...item, qty } : item))
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartOpen,
        setCartOpen,
        cartCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
