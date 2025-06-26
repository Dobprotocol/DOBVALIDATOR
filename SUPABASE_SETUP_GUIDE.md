# Supabase Setup Guide for DOB Validator

## 🚀 Quick Setup Steps

### 1. **Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project reference and database password

### 2. **Import Database Schema**

1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `supabase-schema.sql`
3. Click "Run" to create all tables, indexes, and policies

### 3. **Get Database Connection String**

1. Go to Settings → Database
2. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

### 4. **Configure Environment Variables**

1. Copy `supabase-env-example.txt` to your backend `.env` file
2. Replace `[YOUR-PASSWORD]` and `[YOUR-PROJECT-REF]` with your actual values
3. Update `CORS_ORIGIN` to match your frontend Vercel domain

### 5. **Deploy Backend**

1. Create a new Vercel project for your backend
2. Set all environment variables from your `.env` file
3. Deploy the backend

### 6. **Update Frontend**

1. In your frontend Vercel project, set:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.vercel.app/api
   ```

---

## 📊 Database Schema Overview

### **Core Tables**

- **`users`** - Wallet addresses and user roles
- **`profiles`** - Company information
- **`submissions`** - Device validation requests
- **`files`** - Uploaded documents
- **`drafts`** - Work-in-progress submissions
- **`admin_reviews`** - Admin decisions and scores
- **`certificates`** - Generated certificates
- **`auth_challenges`** - Authentication challenges
- **`auth_sessions`** - JWT session storage

### **Key Features**

- ✅ **Row Level Security (RLS)** - Users can only access their own data
- ✅ **Admin Access** - Admins can see all submissions
- ✅ **Indexes** - Optimized for performance
- ✅ **Triggers** - Automatic timestamp updates
- ✅ **Sample Data** - Includes test admin and user

---

## 🔧 Environment Variables

### **Required for Backend**

```env
***REMOVED***="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
***REMOVED***="your-32-char-secret-key"
JWT_EXPIRES_IN="7d"
STELLAR_NETWORK="testnet"
STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
CORS_ORIGIN="https://your-frontend.vercel.app"
```

### **Required for Frontend**

```env
NEXT_PUBLIC_API_BASE_URL="https://your-backend.vercel.app/api"
NEXT_PUBLIC_STELLAR_CONTRACT_ADDRESS="CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN"
NEXT_PUBLIC_STELLAR_NETWORK="testnet"
```

---

## 🛡️ Security Features

### **Row Level Security (RLS)**

- Users can only read/update their own data
- Admins can read all submissions
- Authentication challenges and sessions are properly secured

### **Rate Limiting**

- Auth endpoints: 5 requests per 15 minutes
- General API: 100 requests per 15 minutes

### **JWT Authentication**

- 7-day token expiration
- Secure session management
- Automatic cleanup of expired sessions

---

## 🧪 Testing

### **Sample Data Included**

- Admin user: `GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ`
- Test user: `GABC123456789012345678901234567890123456789012345678901234567890`

### **Test the Setup**

1. Deploy backend with Supabase connection
2. Test health endpoint: `https://your-backend.vercel.app/health`
3. Test auth endpoint: `https://your-backend.vercel.app/api/auth/challenge`
4. Connect frontend and test wallet authentication

---

## 🔄 Migration from Local Database

If you're migrating from a local PostgreSQL database:

1. **Export local data** (if needed):

   ```bash
   pg_dump your_local_db > backup.sql
   ```

2. **Import to Supabase**:

   - Use Supabase SQL Editor
   - Or use pg_restore if you have direct access

3. **Update connection strings**:
   - Change all `***REMOVED***` to point to Supabase
   - Update any hardcoded localhost references

---

## 🚨 Troubleshooting

### **Common Issues**

1. **Connection Failed**

   - Check your `***REMOVED***` format
   - Verify project reference and password
   - Ensure IP is not blocked (Supabase allows all IPs by default)

2. **RLS Policy Errors**

   - Make sure JWT contains `wallet_address` claim
   - Check that user exists in `users` table
   - Verify admin role for admin-only operations

3. **CORS Errors**

   - Update `CORS_ORIGIN` to match your frontend domain exactly
   - Include protocol (https://) in the origin

4. **Rate Limiting**
   - Check rate limit headers in response
   - Wait for window to reset or increase limits temporarily

### **Debug Commands**

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname FROM pg_policies;

-- Check sample data
SELECT * FROM users LIMIT 5;
```

---

## 📈 Performance Tips

1. **Connection Pooling**: Supabase handles this automatically
2. **Indexes**: Already included in schema
3. **Caching**: Consider Redis for session storage in production
4. **Monitoring**: Use Supabase dashboard for query performance

---

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Database schema imported successfully
- [ ] Environment variables configured
- [ ] Backend deployed and accessible
- [ ] Frontend connected to backend
- [ ] Authentication flow working
- [ ] Sample data accessible
- [ ] Admin user can access all submissions

---

**Need help?** Check the troubleshooting section or review the error logs in your Vercel deployment.
