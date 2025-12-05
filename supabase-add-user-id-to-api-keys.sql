-- Migration: Add user_id column to api_keys table
-- Description: Adds user_id foreign key to link API keys to users
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- This migration is idempotent - safe to run multiple times

-- ============================================================================
-- STEP 1: Add user_id column to api_keys table
-- ============================================================================

-- Add user_id column if it doesn't exist
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 2: Create index for faster queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- ============================================================================
-- STEP 3: Update RLS policies
-- ============================================================================

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Allow all operations for now" ON api_keys;

-- Allow all operations for now (API routes handle authentication server-side)
-- In production, you might want to use service_role key for API routes
-- or implement proper RLS policies based on user_id
CREATE POLICY "Allow all operations for now" ON api_keys
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- NOTES:
-- ============================================================================
-- The API routes handle authentication server-side using getServerSession.
-- They verify the user_id belongs to the authenticated user before allowing
-- any operations. This provides security at the application level.
--
-- For additional security, you could:
-- 1. Use service_role key in API routes (bypasses RLS)
-- 2. Implement proper RLS policies that check user_id
-- 3. Use Supabase Auth instead of NextAuth for direct RLS support
-- ============================================================================

