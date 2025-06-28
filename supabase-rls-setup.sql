-- DOB Validator Supabase Database Setup
-- Run this script in your Supabase SQL Editor

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  company TEXT,
  role TEXT CHECK (role IN ('OPERATOR', 'ADMIN')) DEFAULT 'OPERATOR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  wallet_address TEXT UNIQUE NOT NULL,
  phone TEXT,
  website TEXT,
  bio TEXT,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
  status TEXT CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create drafts table
CREATE TABLE IF NOT EXISTS drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_hash TEXT UNIQUE NOT NULL,
  stellar_tx_hash TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED')) DEFAULT 'ACTIVE',
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  metadata JSONB
);

-- 6. Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies for users table
-- Users can view their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can insert their own data
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- 8. Create RLS Policies for profiles table
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- 9. Create RLS Policies for submissions table
-- Users can view their own submissions
CREATE POLICY "Users can view own submissions" ON submissions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- Users can insert their own submissions
CREATE POLICY "Users can insert own submissions" ON submissions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- Users can update their own submissions (only if status is PENDING)
CREATE POLICY "Users can update own pending submissions" ON submissions
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    ) AND status = 'PENDING'
  );

-- 10. Create RLS Policies for drafts table
-- Users can view their own drafts
CREATE POLICY "Users can view own drafts" ON drafts
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- Users can insert their own drafts
CREATE POLICY "Users can insert own drafts" ON drafts
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- Users can update their own drafts
CREATE POLICY "Users can update own drafts" ON drafts
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- Users can delete their own drafts
CREATE POLICY "Users can delete own drafts" ON drafts
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- 11. Create RLS Policies for certificates table
-- Users can view their own certificates
CREATE POLICY "Users can view own certificates" ON certificates
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- Users can insert their own certificates
CREATE POLICY "Users can insert own certificates" ON certificates
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- Public can view certificates for verification (read-only)
CREATE POLICY "Public can view certificates for verification" ON certificates
  FOR SELECT USING (true);

-- 12. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_hash ON certificates(certificate_hash);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);

-- 13. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 14. Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON drafts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Create admin policies (for admin users)
-- Admin users can view all submissions
CREATE POLICY "Admins can view all submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
      AND role = 'ADMIN'
    )
  );

-- Admin users can update all submissions
CREATE POLICY "Admins can update all submissions" ON submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
      AND role = 'ADMIN'
    )
  );

-- Admin users can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
      AND role = 'ADMIN'
    )
  );

-- Admin users can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
      AND role = 'ADMIN'
    )
  );

-- Admin users can view all certificates
CREATE POLICY "Admins can view all certificates" ON certificates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
      AND role = 'ADMIN'
    )
  );

-- 16. Create function to get user by wallet address
CREATE OR REPLACE FUNCTION get_user_by_wallet(wallet_addr TEXT)
RETURNS TABLE (
  id UUID,
  wallet_address TEXT,
  email TEXT,
  name TEXT,
  company TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.wallet_address, u.email, u.name, u.company, u.role, u.created_at, u.updated_at
  FROM users u
  WHERE u.wallet_address = wallet_addr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 18. Create a test admin user (optional - remove in production)
-- INSERT INTO users (wallet_address, email, name, role) 
-- VALUES ('YOUR_ADMIN_WALLET_ADDRESS', 'admin@example.com', 'Admin User', 'ADMIN');

-- 19. Verify setup
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'profiles', 'submissions', 'drafts', 'certificates');

-- 20. Show all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'; 