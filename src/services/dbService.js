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
  
  getSalesTrend: async (range = 'days') => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*');

      if (error) throw error;

      let startDate = new Date();
      const buckets = [];
      const now = new Date();

      if (range === 'days') {
        startDate.setDate(startDate.getDate() - 7);
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          buckets.push({ name: d.toLocaleDateString(undefined, { weekday: 'short' }), sales: 0 });
        }
      } else if (range === 'weeks') {
        startDate.setDate(startDate.getDate() - 28);
        for (let i = 3; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - (i * 7));
          d.setDate(d.getDate() - d.getDay()); // Sunday start
          buckets.push({ name: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), sales: 0 });
        }
      } else if (range === 'month') {
        startDate.setMonth(startDate.getMonth() - 11); // Last 12 months including current
        startDate.setDate(1); // Start of the month
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now);
          d.setMonth(d.getMonth() - i);
          buckets.push({ name: d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }), sales: 0 });
        }
      } else {
        startDate.setFullYear(startDate.getFullYear() - 4); // Last 5 years including current
        startDate.setMonth(0);
        startDate.setDate(1);
        for (let i = 4; i >= 0; i--) {
          const d = new Date(now);
          d.setFullYear(d.getFullYear() - i);
          buckets.push({ name: d.getFullYear().toString(), sales: 0 });
        }
      }

      const filteredOrders = (orders || []).filter(o => {
        const orderDate = new Date(o.date || o.created_at || o.createdAt);
        return orderDate >= startDate;
      });

      filteredOrders.forEach(order => {
        const d = new Date(order.date || order.created_at || order.createdAt);
        let key = '';
        if (range === 'days') {
          key = d.toLocaleDateString(undefined, { weekday: 'short' });
        } else if (range === 'weeks') {
          const weekStart = new Date(d);
          weekStart.setDate(d.getDate() - d.getDay());
          key = weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } else if (range === 'month') {
          key = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        } else {
          key = d.getFullYear().toString();
        }

        const bucket = buckets.find(b => b.name === key);
        if (bucket) {
          bucket.sales += (Number(order.total) || 0);
        }
      });

      return buckets;
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

  updateOrderStatus: async (id, status) => {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select();
    if (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
    return data[0];
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
