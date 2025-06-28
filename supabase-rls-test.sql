-- DOB Validator RLS Test Script
-- Run this after setting up the main database to verify RLS is working

-- 1. Check if RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'profiles', 'submissions', 'drafts', 'certificates')
ORDER BY tablename;

-- 2. List all policies
SELECT 
  tablename,
  policyname,
  permissive,
  cmd as operation,
  qual as condition
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- 3. Test data insertion (run as authenticated user)
-- First, create a test user
INSERT INTO users (wallet_address, email, name, role) 
VALUES ('test_wallet_123', 'test@example.com', 'Test User', 'OPERATOR')
ON CONFLICT (wallet_address) DO NOTHING;

-- 4. Test profile creation
INSERT INTO profiles (user_id, name, email, wallet_address) 
SELECT id, 'Test User', 'test@example.com', 'test_wallet_123'
FROM users WHERE wallet_address = 'test_wallet_123'
ON CONFLICT (wallet_address) DO NOTHING;

-- 5. Test draft creation
INSERT INTO drafts (user_id, device_name, device_type, location) 
SELECT id, 'Test Device', 'battery-storage', 'Test Location'
FROM users WHERE wallet_address = 'test_wallet_123';

-- 6. Test submission creation
INSERT INTO submissions (
  user_id, 
  device_name, 
  device_type, 
  location, 
  serial_number, 
  manufacturer, 
  model, 
  year_of_manufacture, 
  condition, 
  specifications, 
  purchase_price, 
  current_value, 
  expected_revenue, 
  operational_costs
) 
SELECT 
  id, 
  'Test Device', 
  'battery-storage', 
  'Test Location', 
  'SN123456', 
  'Test Manufacturer', 
  'Test Model', 
  '2023', 
  'Good', 
  'Test specifications', 
  '1000', 
  '800', 
  '200', 
  '50'
FROM users WHERE wallet_address = 'test_wallet_123';

-- 7. Test certificate creation
INSERT INTO certificates (
  certificate_hash, 
  submission_id, 
  user_id, 
  metadata
) 
SELECT 
  'test_hash_123', 
  s.id, 
  u.id, 
  '{"deviceName": "Test Device", "operatorName": "Test User"}'::jsonb
FROM users u
JOIN submissions s ON s.user_id = u.id
WHERE u.wallet_address = 'test_wallet_123'
LIMIT 1;

-- 8. Verify data was inserted correctly
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'drafts' as table_name, COUNT(*) as count FROM drafts
UNION ALL
SELECT 'submissions' as table_name, COUNT(*) as count FROM submissions
UNION ALL
SELECT 'certificates' as table_name, COUNT(*) as count FROM certificates;

-- 9. Test RLS by trying to access data without proper authentication
-- This should fail if RLS is working correctly
-- (You would need to test this with actual JWT tokens in your application)

-- 10. Clean up test data (optional)
-- DELETE FROM certificates WHERE certificate_hash = 'test_hash_123';
-- DELETE FROM submissions WHERE device_name = 'Test Device';
-- DELETE FROM drafts WHERE device_name = 'Test Device';
-- DELETE FROM profiles WHERE wallet_address = 'test_wallet_123';
-- DELETE FROM users WHERE wallet_address = 'test_wallet_123';

-- 11. Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'profiles', 'submissions', 'drafts', 'certificates')
ORDER BY tablename, indexname;

-- 12. Check triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN ('users', 'profiles', 'submissions', 'drafts')
ORDER BY event_object_table, trigger_name; 