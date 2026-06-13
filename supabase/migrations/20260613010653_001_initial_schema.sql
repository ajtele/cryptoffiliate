-- Categories/Verticals
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3b82f6',
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  affiliate_url TEXT,
  affiliate_commission TEXT,
  affiliate_details TEXT,
  pricing_type TEXT, -- 'free', 'freemium', 'paid', 'subscription'
  starting_price TEXT,
  overall_rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flexible key-value attributes for listings (enables filtering without schema migrations)
CREATE TABLE listing_attributes (
  id SERIAL PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  attribute_key TEXT NOT NULL,
  attribute_value TEXT NOT NULL,
  attribute_type TEXT DEFAULT 'text', -- 'text', 'boolean', 'number', 'array'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast attribute lookups
CREATE INDEX idx_listing_attributes_key_value ON listing_attributes(attribute_key, attribute_value);
CREATE INDEX idx_listing_attributes_listing ON listing_attributes(listing_id);

-- Comparisons (saved/user comparisons)
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_ids UUID[] NOT NULL,
  category_id INT REFERENCES categories(id),
  title TEXT,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CMS Content Blocks for editorial pages
CREATE TABLE content_blocks (
  id SERIAL PRIMARY KEY,
  page_slug TEXT NOT NULL,
  block_type TEXT NOT NULL, -- 'hero', 'features', 'cta', 'editorial', 'stats'
  title TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO public USING (true);

CREATE POLICY "public_read_listings" ON listings FOR SELECT
  TO public USING (true);

CREATE POLICY "public_read_listing_attributes" ON listing_attributes FOR SELECT
  TO public USING (true);

CREATE POLICY "public_read_comparisons" ON comparisons FOR SELECT
  TO public USING (true);

CREATE POLICY "public_read_content_blocks" ON content_blocks FOR SELECT
  TO public USING (true);