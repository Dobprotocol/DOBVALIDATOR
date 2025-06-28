-- DOB Validator Database Schema - Simplified Version
-- Run this in your Supabase SQL Editor

-- Step 1: Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop existing tables if they exist (for clean slate)
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS admin_reviews CASCADE;
DROP TABLE IF EXISTS submission_files CASCADE;
DROP TABLE IF EXISTS draft_files CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS drafts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS auth_challenges CASCADE;
DROP TABLE IF EXISTS auth_sessions CASCADE;

-- Step 3: Drop existing types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS submission_status CASCADE;
DROP TYPE IF EXISTS admin_decision CASCADE;
DROP TYPE IF EXISTS certificate_status CASCADE;

-- Step 4: Create enum types
CREATE TYPE user_role AS ENUM ('OPERATOR', 'ADMIN');
CREATE TYPE submission_status AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');
CREATE TYPE admin_decision AS ENUM ('APPROVED', 'REJECTED');
CREATE TYPE certificate_status AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- Step 5: Create tables
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    name TEXT,
    company TEXT,
    role user_role DEFAULT 'OPERATOR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL,
    custom_device_type TEXT,
    location TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    model TEXT NOT NULL,
    year_of_manufacture TEXT NOT NULL,
    condition TEXT NOT NULL,
    specifications TEXT NOT NULL,
    purchase_price TEXT NOT NULL,
    current_value TEXT NOT NULL,
    expected_revenue TEXT NOT NULL,
    operational_costs TEXT NOT NULL,
    status submission_status DEFAULT 'PENDING',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE drafts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_name TEXT DEFAULT '',
    device_type TEXT DEFAULT '',
    location TEXT DEFAULT '',
    serial_number TEXT DEFAULT '',
    manufacturer TEXT DEFAULT '',
    model TEXT DEFAULT '',
    year_of_manufacture TEXT DEFAULT '',
    condition TEXT DEFAULT '',
    specifications TEXT DEFAULT '',
    purchase_price TEXT DEFAULT '',
    current_value TEXT DEFAULT '',
    expected_revenue TEXT DEFAULT '',
    operational_costs TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE submission_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    path TEXT NOT NULL,
    size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    document_type TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE
);

CREATE TABLE draft_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    path TEXT NOT NULL,
    size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    document_type TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    draft_id UUID REFERENCES drafts(id) ON DELETE CASCADE
);

CREATE TABLE admin_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    notes TEXT,
    technical_score INTEGER,
    regulatory_score INTEGER,
    financial_score INTEGER,
    environmental_score INTEGER,
    overall_score INTEGER,
    decision admin_decision,
    decision_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE UNIQUE
);

CREATE TABLE certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    certificate_hash TEXT UNIQUE NOT NULL,
    stellar_tx_hash TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    status certificate_status DEFAULT 'ACTIVE',
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE auth_challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    challenge TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE auth_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create indexes
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX idx_drafts_user_id ON drafts(user_id);
CREATE INDEX idx_drafts_updated_at ON drafts(updated_at);
CREATE INDEX idx_certificates_hash ON certificates(certificate_hash);
CREATE INDEX idx_certificates_stellar_tx ON certificates(stellar_tx_hash);

-- Step 7: Create function for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 8: Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON drafts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Insert default admin user
INSERT INTO users (wallet_address, role) 
VALUES ('GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN', 'ADMIN')
ON CONFLICT (wallet_address) DO UPDATE SET role = 'ADMIN';

-- Step 10: Verify tables were created
SELECT 'Tables created successfully!' as status; 