import { supabase } from '../utils/supabase';

/**
 * This service handles authentication logic for the admin dashboard
 * using the live Supabase backend.
 */
export const authService = {
  /**
   * Fetches the currently logged-in user session and checks admin privileges.
   * @returns {Promise<{ user: Object|null, isAdmin: boolean, error: string|null }>}
   */
  checkAdminSession: async () => {
    try {
      // 1. Get the current active session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Supabase Auth Error:", error.message);
        return { user: null, isAdmin: false, error: error.message };
      }

      if (!session) {
        return { user: null, isAdmin: false, error: 'No active session' };
      }

      const user = session.user;
      
      // 2. Check if the user has the admin role in their metadata
      // (This requires you to set user_metadata.role = 'admin' in Supabase for your admin users)
      const isAdmin = user?.user_metadata?.role === 'admin';
      
      // Fallback/Test check: You could also check if their email matches a hardcoded admin list
      // const isAdmin = user?.email === 'admin@yourstore.com';

      return { 
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || 'Admin',
          role: user.user_metadata?.role || 'user'
        }, 
        isAdmin, 
        error: null 
      };
      
    } catch (error) {
      console.error("Auth Service Exception:", error);
      return { user: null, isAdmin: false, error: error.message };
    }
  },

  /**
   * Terminates the current admin session via Supabase.
   */
  logoutAdmin: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Logout Error:", error.message);
      return { success: false, error: error.message };
    }
  }
};
