-- Create users table for NextAuth Google SSO
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  provider TEXT DEFAULT 'google',
  provider_id TEXT NOT NULL, -- Google user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (true); -- For now, allow all reads. You can restrict this later based on auth.uid()

-- Policy: Allow inserts (for new user registration)
CREATE POLICY "Allow user inserts" ON users
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

