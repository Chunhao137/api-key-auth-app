-- Optional: Create a database function for atomic increment of API key usage
-- This provides better concurrency control than application-level updates
-- Run this SQL in your Supabase SQL Editor if you want atomic increments

CREATE OR REPLACE FUNCTION increment_api_key_usage(key_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE api_keys
  SET 
    usage_count = usage_count + 1,
    last_used_at = NOW(),
    updated_at = NOW()
  WHERE id = key_id;
END;
$$;

-- Grant execute permission (if using RLS)
-- GRANT EXECUTE ON FUNCTION increment_api_key_usage(UUID) TO authenticated;
-- GRANT EXECUTE ON FUNCTION increment_api_key_usage(UUID) TO anon;

