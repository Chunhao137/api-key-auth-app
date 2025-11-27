-- Quick fix: Add the is_active column if it's missing
-- Run this in your Supabase SQL Editor if you're getting the "is_active column not found" error

ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Also ensure other columns exist (in case they're missing too)
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS key_type TEXT DEFAULT 'dev';

ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS monthly_limit INTEGER;

ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add constraint for key_type if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'api_keys_key_type_check'
  ) THEN
    ALTER TABLE api_keys 
    ADD CONSTRAINT api_keys_key_type_check 
    CHECK (key_type IN ('dev', 'prod'));
  END IF;
END $$;

-- Refresh the schema cache (this might help with Supabase's cache)
NOTIFY pgrst, 'reload schema';

