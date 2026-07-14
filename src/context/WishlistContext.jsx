import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

const WishlistContext = createContext({});
export const useWishlist = () => useContext(WishlistContext);

const LOCAL_KEY = 'herviva_wishlist';

// Load from localStorage
const loadLocal = () => {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(loadLocal);
  const [syncing, setSyncing] = useState(false);

  // --- Fetch from Supabase when user logs in ---
  const fetchFromDB = useCallback(async (userId) => {
    setSyncing(true);
    const { data, error } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', userId);

    if (!error && data) {
      const ids = data.map(row => row.product_id);
      setWishlist(ids);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
    }
    setSyncing(false);
  }, []);

  // When auth state changes, sync wishlist from DB or clear
  useEffect(() => {
    if (user) {
      fetchFromDB(user.id);
    } else {
      // Guest — use localStorage
      setWishlist(loadLocal());
    }
  }, [user, fetchFromDB]);

  // Persist to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const toggleWishlist = async (productId) => {
    const isInList = wishlist.includes(productId);
    const updated = isInList
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];

    setWishlist(updated);

    if (user) {
      // Sync to Supabase
      if (isInList) {
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } else {
        await supabase
          .from('wishlists')
          .insert({ user_id: user.id, product_id: productId });
      }
    } else {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    }
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, syncing }}>
      {children}
    </WishlistContext.Provider>
  );
};
