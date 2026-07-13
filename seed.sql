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

-- Safely add columns if the products table already existed
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sizes JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS fallback TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT;

-- Safely add columns if the site_content table already existed
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS "announcementBar" TEXT;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS "heroHeading" TEXT;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS "heroSubheading" TEXT;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS "aboutUs" TEXT;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS "heroSlides" JSONB;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS "collections" JSONB;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS "shopHeader" JSONB;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS "aboutUsConfig" JSONB;

-- Safely add columns if the orders table already existed
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Processing';

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
INSERT INTO public.products (name, sku, price, stock, status, image, category, sizes, fallback)
VALUES 
('Sage Linen Kurta', 'HRV-001', 3499, 25, 'Active', '/images/product-1.webp', 'Kurtas', '["S", "M", "L", "XL"]'::jsonb, '/images/fallback.svg'),
('Terracotta Flow Tunic', 'HRV-002', 2899, 15, 'Active', '/images/product-2.webp', 'Tunics', '["S", "M", "L", "XL"]'::jsonb, '/images/fallback.svg'),
('Burgundy Festive Set', 'HRV-003', 5999, 10, 'Active', '/images/product-3.webp', 'Occasion', '["S", "M", "L"]'::jsonb, '/images/fallback.svg'),
('Cream Palazzo Set', 'HRV-004', 4299, 30, 'Active', '/images/product-4.webp', 'Fusion', '["S", "M", "L", "XL"]'::jsonb, '/images/fallback.svg'),
('Olive Drape Dress', 'HRV-005', 3799, 20, 'Active', '/images/product-5.webp', 'Dresses', '["S", "M", "L"]'::jsonb, '/images/fallback.svg'),
('Gold Embroidered Kurta', 'HRV-006', 6499, 5, 'Active', '/images/product-6.webp', 'Occasion', '["S", "M", "L"]'::jsonb, '/images/fallback.svg'),
('Everyday Cotton Tunic', 'HRV-007', 2199, 50, 'Active', '/images/product-7.webp', 'Essentials', '["S", "M", "L", "XL", "XXL"]'::jsonb, '/images/fallback.svg'),
('Printed Silk Scarf Set', 'HRV-008', 1899, 45, 'Active', '/images/product-8.webp', 'Accessories', '["One Size"]'::jsonb, '/images/fallback.svg');

-- Removed sequence reset since we don't know if id is serial or uuid

-- 3. Seed Site Content
INSERT INTO public.site_content (id, "announcementBar", "heroHeading", "heroSubheading", "aboutUs", "heroSlides", "collections", "shopHeader")
VALUES (
    1, 
    'Free shipping on orders over ₹2999!', 
    'Discover Timeless Elegance', 
    'Elevate your wardrobe with our meticulously crafted pieces designed for the modern woman.',
    'Herviva is born from a desire to blend traditional craftsmanship with contemporary design.',
    '[{"tag": "New Season", "title": "Effortless elegance,\ncrafted for every her", "sub": "Discover flowing silhouettes and timeless pieces that move with you.", "image": "/images/hero-1.webp"}, {"tag": "Fusion Edit", "title": "Where tradition\nmeets modern grace", "sub": "Contemporary kurtas and tunics reimagined for the woman of today.", "image": "/images/hero-2.webp"}, {"tag": "The Collection", "title": "Your wardrobe,\nreimagined", "sub": "Premium fabrics, thoughtful details, and silhouettes made to last.", "image": "/images/hero-3.webp"}]'::jsonb,
    '[{"title": "Kurtas & Tunics", "desc": "Flowing fabrics, artisanal prints", "image": "/images/collection-1.webp", "color": "bg-sage/20", "accent": "text-sage-dark"}, {"title": "Fusion Wear", "desc": "East meets west, effortlessly", "image": "/images/collection-2.webp", "color": "bg-terracotta/15", "accent": "text-terracotta"}, {"title": "Occasion Edit", "desc": "Festive, formal & celebratory", "image": "/images/collection-3.webp", "color": "bg-burgundy/10", "accent": "text-burgundy"}, {"title": "Everyday Essentials", "desc": "Comfort meets quiet luxury", "image": "/images/collection-4.webp", "color": "bg-tan/20", "accent": "text-ink"}]'::jsonb,
    '{"tag": "Shop", "title": "New Arrivals", "description": "Pieces designed to drape beautifully, feel luxurious, and become staples in your wardrobe."}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    "heroHeading" = EXCLUDED."heroHeading",
    "heroSubheading" = EXCLUDED."heroSubheading",
    "heroSlides" = COALESCE(public.site_content."heroSlides", EXCLUDED."heroSlides"),
    "collections" = COALESCE(public.site_content."collections", EXCLUDED."collections"),
    "shopHeader" = COALESCE(public.site_content."shopHeader", EXCLUDED."shopHeader");

-- (Dummy orders removed because they are not necessary and conflict with custom table schemas)
