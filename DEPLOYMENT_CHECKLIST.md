# 🚀 DOB Validator - Quick Deployment Checklist

## ✅ Database Setup (COMPLETED!)

- [x] Supabase project created
- [x] Database tables created
- [x] All tables verified and working
- [x] Admin user inserted

## 🌐 Vercel Deployment Steps

### Frontend Deployment

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **New Project** → Import your Git repository
3. **Root Directory**: `frontend`
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://vvkbwiwaernhclsojirf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a2J3aXdhZXJuaGNsc29qaXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NzQ2MDYsImV4cCI6MjA2NjU1MDYwNn0.4_ikMFDXibAd25hF7ika5qyk2PHkRy_E6Dl4r0A3TGg
   NEXT_PUBLIC_STELLAR_NETWORK=testnet
   NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
   NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES=GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN
   NEXT_PUBLIC_MAX_FILE_SIZE=10485760
   NEXT_PUBLIC_UPLOAD_DIR=uploads
   NODE_ENV=production
   ```
5. **Build Settings**:
   - Framework: Next.js
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
6. **Deploy** and note the URL

### Backoffice Deployment

1. **New Project** → Import same Git repository
2. **Root Directory**: `backoffice`
3. **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://vvkbwiwaernhclsojirf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a2J3aXdhZXJuaGNsc29qaXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NzQ2MDYsImV4cCI6MjA2NjU1MDYwNn0.4_ikMFDXibAd25hF7ika5qyk2PHkRy_E6Dl4r0A3TGg
   NEXT_PUBLIC_STELLAR_NETWORK=testnet
   NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
   NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES=GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN
   NODE_ENV=production
   ```
4. **Build Settings**: Same as frontend
5. **Deploy** and note the URL

## 🧪 Testing Checklist

### Frontend Testing

- [ ] Visit frontend URL
- [ ] Connect Stellar wallet (testnet)
- [ ] Fill out device form
- [ ] Save draft
- [ ] Submit form
- [ ] Verify data appears in Supabase

### Backoffice Testing

- [ ] Visit backoffice URL
- [ ] Connect admin wallet: `GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN`
- [ ] View pending submissions
- [ ] Review submission details
- [ ] Approve/reject submissions
- [ ] Verify status updates

### Database Verification

- [ ] Check Supabase Table Editor
- [ ] Verify data is being created
- [ ] Test real-time updates

## 🔧 Troubleshooting

### If Build Fails

- Check environment variables are set correctly
- Verify all dependencies are installed
- Check for TypeScript errors

### If Database Issues

- Verify Supabase URL and key
- Check if tables exist in Supabase Dashboard
- Run the test script: `node test-database-setup.js`

### If Authentication Issues

- Check wallet connection
- Verify admin wallet address
- Check browser console for errors

## 📞 Quick Commands

```bash
# Test database locally
cd frontend && node test-database-setup.js

# Test frontend locally
cd frontend && pnpm dev

# Test backoffice locally
cd backoffice && pnpm dev

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

## 🎉 Success Indicators

- ✅ Frontend loads without errors
- ✅ Backoffice loads without errors
- ✅ Wallet connection works
- ✅ Form submission works
- ✅ Draft saving works
- ✅ Admin review process works
- ✅ Data appears in Supabase

## 🚀 Ready to Deploy!

Your database is set up and working perfectly. You can now proceed with the Vercel deployment steps above. The application will be fully functional with real-time database operations!
