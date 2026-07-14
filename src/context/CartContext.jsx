import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { cartLineKey } from '../utils/formatPrice';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const LOCAL_KEY = 'herviva-cart';

const loadLocal = () => {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(loadLocal);
  const [cartOpen, setCartOpen] = useState(false);

  // --- Fetch cart from Supabase when user logs in ---
  const fetchFromDB = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId);

    if (!error && data && data.length > 0) {
      // Map DB rows back to cart item shape
      const items = data.map(row => ({
        id: row.product_id,
        name: row.name,
        price: row.price,
        image: row.image,
        category: row.category,
        size: row.size,
        qty: row.qty,
        lineKey: cartLineKey(row.product_id, row.size),
      }));
      setCart(items);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchFromDB(user.id);
    } else {
      setCart(loadLocal());
    }
  }, [user, fetchFromDB]);

  // Persist to localStorage (always, as a fast cache)
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(cart));
  }, [cart]);

  // --- Sync helpers ---
  const syncCartToDB = useCallback(async (updatedCart, userId) => {
    if (!userId) return;
    // Delete all existing rows for user and reinsert
    await supabase.from('carts').delete().eq('user_id', userId);
    if (updatedCart.length > 0) {
      const rows = updatedCart.map(item => ({
        user_id: userId,
        product_id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category || '',
        size: item.size,
        qty: item.qty,
      }));
      await supabase.from('carts').insert(rows);
    }
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const addToCart = (product, size) => {
    const lineKey = cartLineKey(product.id, size);
    setCart((prev) => {
      const existing = prev.find((item) => item.lineKey === lineKey);
      let updated;
      if (existing) {
        updated = prev.map((item) =>
          item.lineKey === lineKey ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        updated = [...prev, { ...product, size, lineKey, qty: 1 }];
      }
      if (user) syncCartToDB(updated, user.id);
      return updated;
    });
    setCartOpen(true);
  };

  const removeFromCart = (lineKey) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.lineKey !== lineKey);
      if (user) syncCartToDB(updated, user.id);
      return updated;
    });
  };

  const updateQty = (lineKey, qty) => {
    if (qty < 1) {
      removeFromCart(lineKey);
      return;
    }
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.lineKey === lineKey ? { ...item, qty } : item
      );
      if (user) syncCartToDB(updated, user.id);
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    if (user) syncCartToDB([], user.id);
  };

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
