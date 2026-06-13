-- Promotions table for deals/bonuses
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  bonus_value TEXT NOT NULL,
  promo_code TEXT,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_promotions_listing ON promotions(listing_id);
CREATE INDEX idx_promotions_active ON promotions(is_active, expires_at);

-- RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promotions_select" ON promotions FOR SELECT
  TO public USING (is_active = TRUE);

CREATE POLICY "promotions_all_authenticated" ON promotions FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON promotions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON promotions TO authenticated;