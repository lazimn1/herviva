/**
 * This service isolates authentication logic for the admin dashboard.
 * It's currently mocked so you can easily wire it up to Supabase, Firebase, or a custom backend later.
 */

// Mock delay to simulate network request
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock User Data
const MOCK_ADMIN_USER = {
  id: 'admin_123',
  email: 'admin@herviva.com',
  name: 'Admin User',
  role: 'admin',
  isAdmin: true,
};

export const authService = {
  /**
   * Fetches the currently logged-in user session and checks admin privileges.
   * @returns {Promise<{ user: Object|null, isAdmin: boolean, error: string|null }>}
   */
  checkAdminSession: async () => {
    try {
      await delay(500); // Simulate API latency
      
      // TODO: Replace with real Supabase Auth check
      // const { data: { session }, error } = await supabase.auth.getSession();
      // if (error) throw error;
      // const user = session?.user;
      // const isAdmin = user?.user_metadata?.role === 'admin';
      
      // Returning the mock user for now to allow development
      return { user: MOCK_ADMIN_USER, isAdmin: MOCK_ADMIN_USER.isAdmin, error: null };
      
      // To test the 403 screen, change to:
      // return { user: { ...MOCK_ADMIN_USER, isAdmin: false }, isAdmin: false, error: null };
    } catch (error) {
      console.error("Auth Service Error:", error);
      return { user: null, isAdmin: false, error: error.message };
    }
  },

  /**
   * Terminates the current admin session.
   */
  logoutAdmin: async () => {
    try {
      await delay(300);
      // TODO: Replace with real Supabase logout
      // await supabase.auth.signOut();
      console.log("Admin logged out successfully.");
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
