-- Google Cloud SQL Migration Script
-- Run this after connecting to Google Cloud SQL via DBeaver

-- 1. Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS "dob-validator";

-- 2. Connect to the dob-validator database
\c "dob-validator";

-- 3. Create extensions (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 4. Import the exported data
-- Note: This will be run from the dob_validator_export.sql file
-- The export file should contain all CREATE TABLE, INSERT, and other statements

-- 5. Verify migration
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 6. Check data counts
SELECT 
    'users' as table_name,
    COUNT(*) as record_count
FROM users
UNION ALL
SELECT 
    'profiles' as table_name,
    COUNT(*) as record_count
FROM profiles
UNION ALL
SELECT 
    'submissions' as table_name,
    COUNT(*) as record_count
FROM submissions
UNION ALL
SELECT 
    'devices' as table_name,
    COUNT(*) as record_count
FROM devices;

-- 7. Verify RLS policies (if any)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'; 