-- DOB Validator Database Setup for Google Cloud SQL
-- Run this as a superuser (postgres) in your Google Cloud SQL instance
-- This will create the database, user, and all necessary tables

-- 1. Create the database user
CREATE ROLE dobprotocol WITH LOGIN PASSWORD 'Ct>OQu.f)3r0\4nU';
ALTER ROLE dobprotocol CREATEDB;

-- 2. Create the database
CREATE DATABASE "dob-validator" OWNER dobprotocol;

-- 3. Connect to the dob-validator database
\c "dob-validator";

-- 4. Create necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 5. Set the search path
SET search_path TO public;

-- 6. Create the users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- 7. Create the profiles table
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT,
    "company" TEXT,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- 8. Create the devices table
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "technical_specs" JSONB,
    "financial_info" JSONB,
    "documentation" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- 9. Create the submissions table
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewer_id" TEXT,
    "review_notes" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- 10. Create the certificates table
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "certificate_number" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "certificate_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- 11. Create the sessions table
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- 12. Create the challenges table
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- 13. Create indexes for better performance
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "profiles_user_id_idx" ON "profiles"("user_id");
CREATE INDEX "devices_user_id_idx" ON "devices"("user_id");
CREATE INDEX "devices_status_idx" ON "devices"("status");
CREATE INDEX "submissions_device_id_idx" ON "submissions"("device_id");
CREATE INDEX "submissions_user_id_idx" ON "submissions"("user_id");
CREATE INDEX "submissions_status_idx" ON "submissions"("status");
CREATE INDEX "certificates_submission_id_idx" ON "certificates"("submission_id");
CREATE INDEX "certificates_device_id_idx" ON "certificates"("device_id");
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");
CREATE INDEX "sessions_token_idx" ON "sessions"("token");
CREATE INDEX "challenges_user_id_idx" ON "challenges"("user_id");

-- 14. Create foreign key constraints
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 15. Grant permissions to the dobprotocol user
GRANT ALL PRIVILEGES ON DATABASE "dob-validator" TO dobprotocol;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dobprotocol;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dobprotocol;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO dobprotocol;

-- 16. Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dobprotocol;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dobprotocol;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO dobprotocol;

-- 17. Verify the setup
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 18. Show table counts (should be 0 for new database)
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
    'devices' as table_name,
    COUNT(*) as record_count
FROM devices
UNION ALL
SELECT 
    'submissions' as table_name,
    COUNT(*) as record_count
FROM submissions
UNION ALL
SELECT 
    'certificates' as table_name,
    COUNT(*) as record_count
FROM certificates
UNION ALL
SELECT 
    'sessions' as table_name,
    COUNT(*) as record_count
FROM sessions
UNION ALL
SELECT 
    'challenges' as table_name,
    COUNT(*) as record_count
FROM challenges;

-- Success message
SELECT 'Database setup completed successfully!' as status; 