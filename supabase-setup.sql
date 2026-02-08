-- =============================================
-- Luxury Select - Supabase Database Setup
-- =============================================

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  availability TEXT DEFAULT 'pronta-entrega' CHECK (availability IN ('pronta-entrega', 'por-encomenda')),
  description TEXT,
  in_stock BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Credentials Table (for admin login)
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- 4. Insert default admin credentials
INSERT INTO credentials (username, password)
VALUES ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for public read access (products and categories)
CREATE POLICY "Allow public read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow public read products" ON products
  FOR SELECT USING (true);

-- 7. Create policies for public write access (for admin operations)
-- Note: In production, you'd want proper authentication
CREATE POLICY "Allow public insert categories" ON categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update categories" ON categories
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete categories" ON categories
  FOR DELETE USING (true);

CREATE POLICY "Allow public insert products" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update products" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete products" ON products
  FOR DELETE USING (true);

CREATE POLICY "Allow public read credentials" ON credentials
  FOR SELECT USING (true);

CREATE POLICY "Allow public update credentials" ON credentials
  FOR UPDATE USING (true);

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create trigger for products updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
