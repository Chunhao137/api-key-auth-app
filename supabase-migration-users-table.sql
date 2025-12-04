-- Migration: Create users table for NextAuth Google SSO
-- Description: Creates the users table to store authenticated user information
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- This migration is idempotent - safe to run multiple times

-- ============================================================================
-- STEP 1: Create the users table
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  provider TEXT DEFAULT 'google',
  provider_id TEXT NOT NULL, -- Google user ID (from NextAuth account.providerAccountId)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- STEP 2: Create indexes for faster lookups
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ============================================================================
-- STEP 3: Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create RLS policies
-- ============================================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Allow user inserts" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Policy: Allow reads (for now, allow all reads - you can restrict later)
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (true);

-- Policy: Allow inserts (for new user registration via NextAuth)
CREATE POLICY "Allow user inserts" ON users
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow updates (for updating last_login_at and user info)
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- STEP 5: Create trigger function for updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- STEP 6: Create trigger to auto-update updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS update_users_updated_at ON users;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- ============================================================================
-- VERIFICATION: Check table structure
-- ============================================================================

-- Uncomment the following to verify the table was created correctly:
-- SELECT 
--   column_name, 
--   data_type, 
--   is_nullable,
--   column_default
-- FROM information_schema.columns
-- WHERE table_name = 'users'
-- ORDER BY ordinal_position;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- This table stores user information from Google SSO authentication.
-- 
-- Fields:
--   - id: UUID primary key (auto-generated)
--   - email: User's email address (unique, required)
--   - name: User's display name (optional)
--   - image: User's profile image URL (optional)
--   - provider: Authentication provider (default: 'google')
--   - provider_id: Google user ID from NextAuth (required)
--   - created_at: When the user record was created (auto-set)
--   - updated_at: When the user record was last updated (auto-updated)
--   - last_login_at: When the user last logged in (updated on each login)
--
-- The table is used by:
--   - app/api/auth/[...nextauth]/route.ts (NextAuth signIn callback)
--   - lib/auth.ts (getUserFromSupabase function)
--
-- Security:
--   - RLS is enabled but policies currently allow all operations
--   - In production, consider restricting based on authenticated user ID
--   - The anon key is used, so ensure RLS policies are appropriate

