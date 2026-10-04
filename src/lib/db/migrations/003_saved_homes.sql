CREATE TABLE IF NOT EXISTS saved_homes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_key VARCHAR(50) NOT NULL,
  saved_price NUMERIC(12,2),
  current_price NUMERIC(12,2),
  address VARCHAR(255),
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, listing_key)
);

