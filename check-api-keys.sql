-- Query to check all API keys in the database
-- Run this in Supabase SQL Editor

SELECT 
  id,
  name,
  "key",  -- Note: key is quoted because it's a reserved word
  key_type,
  is_active,
  usage_count,
  monthly_limit,
  created_at,
  last_used_at,
  updated_at
FROM api_keys
ORDER BY created_at DESC;

-- Or get a count of keys
SELECT COUNT(*) as total_keys FROM api_keys;

-- Or get only active keys
SELECT COUNT(*) as active_keys 
FROM api_keys 
WHERE is_active = true;

