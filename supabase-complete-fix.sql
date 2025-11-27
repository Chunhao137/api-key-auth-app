-- Complete fix for api_keys table
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Check current table structure (for debugging)
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'api_keys'
ORDER BY ordinal_position;

-- Step 2: Drop the table if it exists (WARNING: This deletes all data!)
-- Uncomment the line below if you want to start fresh
-- DROP TABLE IF EXISTS api_keys CASCADE;

-- Step 3: Create the table with all required columns
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "key" TEXT NOT NULL UNIQUE,  -- Quoted because 'key' might conflict
  key_type TEXT NOT NULL DEFAULT 'dev' CHECK (key_type IN ('dev', 'prod')),
  monthly_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Add any missing columns (safe to run even if columns exist)
DO $$ 
BEGIN
  -- Add 'key' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'key'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN "key" TEXT;
    ALTER TABLE api_keys ADD CONSTRAINT api_keys_key_unique UNIQUE ("key");
  END IF;

  -- Add 'name' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'name'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN name TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add 'key_type' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'key_type'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN key_type TEXT DEFAULT 'dev';
    ALTER TABLE api_keys ADD CONSTRAINT api_keys_key_type_check 
      CHECK (key_type IN ('dev', 'prod'));
  END IF;

  -- Add 'monthly_limit' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'monthly_limit'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN monthly_limit INTEGER;
  END IF;

  -- Add 'usage_count' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'usage_count'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN usage_count INTEGER DEFAULT 0;
  END IF;

  -- Add 'is_active' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  -- Add 'created_at' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- Add 'last_used_at' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'last_used_at'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN last_used_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add 'updated_at' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_keys' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON api_keys(created_at DESC);

-- Step 6: Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop and recreate the policy
DROP POLICY IF EXISTS "Allow all operations for now" ON api_keys;
CREATE POLICY "Allow all operations for now" ON api_keys
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 8: Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 9: Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'api_keys'
ORDER BY ordinal_position;

