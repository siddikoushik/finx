-- Disable email verification for development
-- Run this in your Supabase SQL Editor

-- Update auth settings to disable email confirmation
UPDATE auth.config 
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb), 
  '{email_confirm', 'false'::jsonb
);

-- Alternative: Update the auth.users table to mark existing users as confirmed
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Note: For production, you should enable email verification
-- This is only for development/testing purposes
