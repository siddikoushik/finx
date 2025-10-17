-- Run this SQL in your Supabase Dashboard -> SQL Editor

-- Option 1: Disable email confirmation for new users
-- Go to Authentication -> Settings and disable 'Enable email confirmations'

-- Option 2: Mark existing users as confirmed (if you have any)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Option 3: Check current auth settings
SELECT * FROM auth.config;
