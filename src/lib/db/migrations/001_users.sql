CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  provider VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  onboarding_complete BOOLEAN DEFAULT FALSE,
  preferences JSONB
);
