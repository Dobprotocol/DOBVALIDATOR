-- DOB Validator Supabase Database Schema
-- Import this file into your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(56) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PROFILES TABLE
-- ========================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    industry VARCHAR(100),
    website VARCHAR(255),
    description TEXT,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SUBMISSIONS TABLE
-- ========================================
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    serial_number VARCHAR(255),
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    year_of_manufacture VARCHAR(4),
    condition VARCHAR(50),
    specifications TEXT,
    purchase_price DECIMAL(15,2),
    current_value DECIMAL(15,2),
    expected_revenue DECIMAL(15,2),
    operational_costs DECIMAL(15,2),
    operator_wallet VARCHAR(56) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'draft')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- FILES TABLE
-- ========================================
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    draft_id UUID REFERENCES drafts(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- DRAFTS TABLE
-- ========================================
CREATE TABLE drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(255),
    device_type VARCHAR(100),
    serial_number VARCHAR(255),
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    year_of_manufacture VARCHAR(4),
    condition VARCHAR(50),
    specifications TEXT,
    purchase_price DECIMAL(15,2),
    current_value DECIMAL(15,2),
    expected_revenue DECIMAL(15,2),
    operational_costs DECIMAL(15,2),
    operator_wallet VARCHAR(56),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ADMIN REVIEWS TABLE
-- ========================================
CREATE TABLE admin_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    admin_wallet VARCHAR(56) NOT NULL,
    admin_notes TEXT,
    admin_score INTEGER CHECK (admin_score >= 0 AND admin_score <= 100),
    admin_decision VARCHAR(20) CHECK (admin_decision IN ('approved', 'rejected')),
    admin_decision_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CERTIFICATES TABLE
-- ========================================
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    certificate_number VARCHAR(255) UNIQUE NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    operator_name VARCHAR(255) NOT NULL,
    operator_wallet VARCHAR(56) NOT NULL,
    validation_date DATE NOT NULL,
    certificate_type VARCHAR(50) DEFAULT 'comprehensive',
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'issued' CHECK (status IN ('issued', 'revoked', 'expired')),
    pdf_path VARCHAR(500),
    metadata_hash VARCHAR(255),
    transaction_hash VARCHAR(255)
);

-- ========================================
-- AUTHENTICATION TABLES
-- ========================================

-- Auth Challenges Table
CREATE TABLE auth_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(56) NOT NULL,
    challenge VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auth Sessions Table
CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(56) NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_operator_wallet ON submissions(operator_wallet);
CREATE INDEX idx_files_submission_id ON files(submission_id);
CREATE INDEX idx_drafts_user_id ON drafts(user_id);
CREATE INDEX idx_admin_reviews_submission_id ON admin_reviews(submission_id);
CREATE INDEX idx_certificates_submission_id ON certificates(submission_id);
CREATE INDEX idx_certificates_certificate_number ON certificates(certificate_number);
CREATE INDEX idx_auth_challenges_wallet_address ON auth_challenges(wallet_address);
CREATE INDEX idx_auth_challenges_challenge ON auth_challenges(challenge);
CREATE INDEX idx_auth_sessions_token ON auth_sessions(token);
CREATE INDEX idx_auth_sessions_wallet_address ON auth_sessions(wallet_address);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.jwt() ->> 'wallet_address' = wallet_address);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.jwt() ->> 'wallet_address' = wallet_address);

-- Users can read their own profiles
CREATE POLICY "Users can read own profiles" ON profiles
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE wallet_address = auth.jwt() ->> 'wallet_address'
        )
    );

-- Users can update their own profiles
CREATE POLICY "Users can update own profiles" ON profiles
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE wallet_address = auth.jwt() ->> 'wallet_address'
        )
    );

-- Users can read their own submissions
CREATE POLICY "Users can read own submissions" ON submissions
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE wallet_address = auth.jwt() ->> 'wallet_address'
        )
    );

-- Admins can read all submissions
CREATE POLICY "Admins can read all submissions" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE wallet_address = auth.jwt() ->> 'wallet_address' 
            AND role = 'ADMIN'
        )
    );

-- Users can create their own submissions
CREATE POLICY "Users can create own submissions" ON submissions
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE wallet_address = auth.jwt() ->> 'wallet_address'
        )
    );

-- Users can update their own submissions
CREATE POLICY "Users can update own submissions" ON submissions
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE wallet_address = auth.jwt() ->> 'wallet_address'
        )
    );

-- ========================================
-- SAMPLE DATA (Optional)
-- ========================================

-- Insert sample admin user
INSERT INTO users (wallet_address, name, email, role) VALUES 
('GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ', 'Admin User', 'admin@dobprotocol.com', 'ADMIN');

-- Insert sample regular user
INSERT INTO users (wallet_address, name, email, role) VALUES 
('GABC123456789012345678901234567890123456789012345678901234567890', 'Test User', 'user@example.com', 'USER');

-- ========================================
-- FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_reviews_updated_at BEFORE UPDATE ON admin_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- CLEANUP FUNCTION FOR EXPIRED AUTH DATA
-- ========================================
CREATE OR REPLACE FUNCTION cleanup_expired_auth_data()
RETURNS void AS $$
BEGIN
    DELETE FROM auth_sessions WHERE expires_at < NOW();
    DELETE FROM auth_challenges WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run cleanup every hour (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-auth', '0 * * * *', 'SELECT cleanup_expired_auth_data();'); 