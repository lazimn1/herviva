-- 1. Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT,
    price NUMERIC NOT NULL,
    stock INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active',
    image TEXT,
    category TEXT,
    sizes JSONB,
    fallback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_content (
    id INTEGER PRIMARY KEY,
    "announcementBar" TEXT,
    "heroHeading" TEXT,
    "heroSubheading" TEXT,
    "aboutUs" TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total NUMERIC,
    customer JSONB,
    items JSONB,
    status TEXT DEFAULT 'Processing'
);

-- Enable RLS (and add permissive policies so Admin works)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Drop existing policies to prevent conflict errors if they exist
    DROP POLICY IF EXISTS "Enable full access for everyone on products" ON public.products;
    DROP POLICY IF EXISTS "Enable full access for everyone on site_content" ON public.site_content;
    DROP POLICY IF EXISTS "Enable full access for everyone on orders" ON public.orders;

    -- Create policies
    CREATE POLICY "Enable full access for everyone on products" ON public.products FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Enable full access for everyone on site_content" ON public.site_content FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Enable full access for everyone on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
END $$;


-- 2. Seed Products
INSERT INTO public.products (id, name, sku, price, stock, status, image, category, sizes, fallback)
VALUES 
(1, 'Sage Linen Kurta', 'HRV-001', 3499, 25, 'Active', '/images/product-1.webp', 'Kurtas', '["S", "M", "L", "XL"]'::jsonb, '/images/fallback.svg'),
(2, 'Terracotta Flow Tunic', 'HRV-002', 2899, 15, 'Active', '/images/product-2.webp', 'Tunics', '["S", "M", "L", "XL"]'::jsonb, '/images/fallback.svg'),
(3, 'Burgundy Festive Set', 'HRV-003', 5999, 10, 'Active', '/images/product-3.webp', 'Occasion', '["S", "M", "L"]'::jsonb, '/images/fallback.svg'),
(4, 'Cream Palazzo Set', 'HRV-004', 4299, 30, 'Active', '/images/product-4.webp', 'Fusion', '["S", "M", "L", "XL"]'::jsonb, '/images/fallback.svg'),
(5, 'Olive Drape Dress', 'HRV-005', 3799, 20, 'Active', '/images/product-5.webp', 'Dresses', '["S", "M", "L"]'::jsonb, '/images/fallback.svg'),
(6, 'Gold Embroidered Kurta', 'HRV-006', 6499, 5, 'Active', '/images/product-6.webp', 'Occasion', '["S", "M", "L"]'::jsonb, '/images/fallback.svg'),
(7, 'Everyday Cotton Tunic', 'HRV-007', 2199, 50, 'Active', '/images/product-7.webp', 'Essentials', '["S", "M", "L", "XL", "XXL"]'::jsonb, '/images/fallback.svg'),
(8, 'Printed Silk Scarf Set', 'HRV-008', 1899, 45, 'Active', '/images/product-8.webp', 'Accessories', '["One Size"]'::jsonb, '/images/fallback.svg')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    price = EXCLUDED.price, 
    stock = EXCLUDED.stock, 
    category = EXCLUDED.category;

-- Reset sequence for products to avoid ID conflicts when adding new products
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- 3. Seed Site Content
INSERT INTO public.site_content (id, "announcementBar", "heroHeading", "heroSubheading", "aboutUs")
VALUES (
    1, 
    'Free shipping on orders over ₹2999!', 
    'Discover Timeless Elegance', 
    'Elevate your wardrobe with our meticulously crafted pieces designed for the modern woman.',
    'Herviva is born from a desire to blend traditional craftsmanship with contemporary design.'
)
ON CONFLICT (id) DO UPDATE SET 
    "heroHeading" = EXCLUDED."heroHeading",
    "heroSubheading" = EXCLUDED."heroSubheading";

-- 4. Seed Dummy Orders
INSERT INTO public.orders (id, total, customer, items, status, date)
VALUES 
(1001, 3499.00, '{"name": "Alice Johnson", "email": "alice@example.com", "phone": "555-0123", "address": "123 Lane, Delhi"}'::jsonb, '[{"id": 1, "name": "Sage Linen Kurta", "qty": 1, "price": 3499}]'::jsonb, 'Processing', NOW() - INTERVAL '1 day'),
(1002, 5999.00, '{"name": "Bob Smith", "email": "bob@example.com", "phone": "555-0987", "address": "456 Street, Mumbai"}'::jsonb, '[{"id": 3, "name": "Burgundy Festive Set", "qty": 1, "price": 5999}]'::jsonb, 'Shipped', NOW() - INTERVAL '3 days'),
(1003, 7198.00, '{"name": "Clara Davis", "email": "clara@example.com", "phone": "555-0456", "address": "789 Road, Bangalore"}'::jsonb, '[{"id": 4, "name": "Cream Palazzo Set", "qty": 1, "price": 4299}, {"id": 2, "name": "Terracotta Flow Tunic", "qty": 1, "price": 2899}]'::jsonb, 'Delivered', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for orders
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));
