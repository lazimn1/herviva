import { supabase } from '../utils/supabase';

/**
 * This service isolates all database interactions for the admin dashboard.
 * It now connects directly to the live Supabase backend.
 */
export const dbService = {
  // --- DASHBOARD OVERVIEW ---
  getOverviewStats: async () => {
    try {
      // Aggregate data from multiple tables
      const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { data: products } = await supabase.from('products').select('stock');
      const { data: orders } = await supabase.from('orders').select('total');

      const outOfStockItems = products?.filter(p => p.stock === 0).length || 0;
      
      const totalRevenue = orders?.reduce((sum, order) => sum + (Number(order.total) || 0), 0) || 0;
      const averageOrderValue = orders?.length > 0 ? (totalRevenue / orders.length) : 0;

      return {
        totalRevenue: totalRevenue,
        totalOrders: totalOrders || 0,
        averageOrderValue: averageOrderValue,
        outOfStockItems: outOfStockItems
      };
    } catch (error) {
      console.error("Error fetching overview stats:", error);
      return { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, outOfStockItems: 0 };
    }
  },
  
  getSalesTrend: async () => {
    // For a real app, you would query orders grouped by date. 
    // This is a placeholder structure until date-grouping is implemented in the DB.
    try {
      // In a real scenario, you'd fetch last 7 days orders and reduce them by day
      // Returning static format for the chart compatibility while connected to Supabase
      return [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 5000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 8900 },
        { name: 'Sat', sales: 6390 },
        { name: 'Sun', sales: 7490 },
      ];
    } catch (error) {
      console.error("Error fetching sales trend:", error);
      return [];
    }
  },

  // --- PRODUCTS MANAGEMENT ---
  getProducts: async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }
    return data;
  },

  addProduct: async (productData) => {
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) {
      console.error("Error adding product:", error);
      throw error;
    }
    return data[0];
  },

  updateProduct: async (id, updatedData) => {
    const { data, error } = await supabase.from('products').update(updatedData).eq('id', id).select();
    if (error) {
      console.error("Error updating product:", error);
      throw error;
    }
    return data[0];
  },

  deleteProduct: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
    return { success: true };
  },

  // --- SITE CONTENT MANAGEMENT ---
  getSiteContent: async () => {
    // Assuming site content is stored in a single row with id = 1
    const { data, error } = await supabase.from('site_content').select('*').eq('id', 1).single();
    if (error) {
      console.error("Error fetching site content:", error);
      return {
        announcementBar: '',
        heroHeading: '',
        heroSubheading: '',
        aboutUs: ''
      };
    }
    return data;
  },

  updateSiteContent: async (updatedData) => {
    const { data, error } = await supabase.from('site_content').upsert({ id: 1, ...updatedData }).select();
    if (error) {
      console.error("Error updating site content:", error);
      throw error;
    }
    return data[0];
  },

  // --- ORDERS TRACKER ---
  getOrders: async () => {
    const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
    return data;
  },

  // --- STORAGE ---
  uploadImage: async (file, fileName) => {
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/webp'
      });
      
    if (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
      
    return publicUrl;
  }
};
