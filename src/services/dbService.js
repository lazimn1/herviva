/**
 * This service isolates all database interactions for the admin dashboard.
 * It uses mocked data that can be replaced with real backend calls (Supabase, Firebase, REST API) later.
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Database State
let MOCK_PRODUCTS = [
  { id: 'p_1', name: 'Premium Cotton T-Shirt', sku: 'TS-COT-01', price: 29.99, stock: 150, status: 'Active', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80' },
  { id: 'p_2', name: 'Classic Denim Jacket', sku: 'JK-DEN-02', price: 89.99, stock: 45, status: 'Active', image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=300&q=80' },
  { id: 'p_3', name: 'Slim Fit Chinos', sku: 'CH-SL-03', price: 49.99, stock: 0, status: 'Draft', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=300&q=80' },
  { id: 'p_4', name: 'Leather Crossbody Bag', sku: 'BG-LTH-04', price: 119.99, stock: 12, status: 'Active', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=300&q=80' },
];

let MOCK_SITE_CONTENT = {
  announcementBar: 'Huge Summer Sale! 50% Off Everything!',
  heroHeading: 'Discover Your Unique Style',
  heroSubheading: 'Shop the latest trends and timeless classics carefully curated just for you.',
  aboutUs: 'We believe fashion should be accessible, sustainable, and empowering.'
};

const MOCK_ORDERS = [
  { id: 'ORD-1001', customerEmail: 'alice@example.com', total: 119.98, date: '2026-07-09T14:20:00Z', status: 'Delivered' },
  { id: 'ORD-1002', customerEmail: 'bob@example.com', total: 49.99, date: '2026-07-10T09:15:00Z', status: 'Pending' },
  { id: 'ORD-1003', customerEmail: 'charlie@example.com', total: 29.99, date: '2026-07-10T11:45:00Z', status: 'Cancelled' },
  { id: 'ORD-1004', customerEmail: 'diana@example.com', total: 179.98, date: '2026-07-10T12:30:00Z', status: 'Pending' },
];

const MOCK_SALES_TREND = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 8900 },
  { name: 'Sat', sales: 6390 },
  { name: 'Sun', sales: 7490 },
];

export const dbService = {
  // --- DASHBOARD OVERVIEW ---
  getOverviewStats: async () => {
    await delay(600);
    const outOfStockCount = MOCK_PRODUCTS.filter(p => p.stock === 0).length;
    return {
      totalRevenue: 34560.50,
      totalOrders: 284,
      averageOrderValue: 121.69,
      outOfStockItems: outOfStockCount
    };
  },
  
  getSalesTrend: async () => {
    await delay(400);
    return MOCK_SALES_TREND;
  },

  // --- PRODUCTS MANAGEMENT ---
  getProducts: async () => {
    await delay(500);
    return [...MOCK_PRODUCTS];
  },

  addProduct: async (productData) => {
    await delay(700);
    const newProduct = {
      ...productData,
      id: 'p_' + Math.random().toString(36).substr(2, 9), // Mock ID generation
    };
    MOCK_PRODUCTS.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id, updatedData) => {
    await delay(700);
    const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Product not found");
    MOCK_PRODUCTS[index] = { ...MOCK_PRODUCTS[index], ...updatedData };
    return MOCK_PRODUCTS[index];
  },

  deleteProduct: async (id) => {
    await delay(600);
    MOCK_PRODUCTS = MOCK_PRODUCTS.filter(p => p.id !== id);
    return { success: true };
  },

  // --- SITE CONTENT MANAGEMENT ---
  getSiteContent: async () => {
    await delay(500);
    return { ...MOCK_SITE_CONTENT };
  },

  updateSiteContent: async (updatedData) => {
    await delay(800);
    MOCK_SITE_CONTENT = { ...MOCK_SITE_CONTENT, ...updatedData };
    return MOCK_SITE_CONTENT;
  },

  // --- ORDERS TRACKER ---
  getOrders: async () => {
    await delay(600);
    return [...MOCK_ORDERS];
  }
};
