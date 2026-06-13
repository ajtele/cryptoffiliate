-- Reviews table for user-generated reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_listing ON reviews(listing_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews
CREATE POLICY "reviews_select" ON reviews FOR SELECT
  TO public USING (is_approved = TRUE);

-- Public can insert reviews (pending approval)
CREATE POLICY "reviews_insert" ON reviews FOR INSERT
  TO public WITH CHECK (true);

-- Authenticated users can manage all reviews
CREATE POLICY "reviews_all_authenticated" ON reviews FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON reviews TO authenticated;