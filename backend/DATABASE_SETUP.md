# Database Integration Setup Guide

## 🗄️ Overview

This guide explains how we're migrating from **in-memory storage** to **PostgreSQL database** for production-ready data persistence.

### **What We're Changing**

- **Before**: Data stored in memory/files (disappears on server restart)
- **After**: Data stored in PostgreSQL (persistent, scalable, concurrent)

## 🚀 Quick Start

### **Option 1: Docker (Recommended)**

1. **Install Docker Desktop**

   ```bash
   # Download from https://www.docker.com/products/docker-desktop
   ```

2. **Start PostgreSQL**

   ```bash
   cd docker
   docker compose up -d postgres
   ```

3. **Set up environment**

   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your database URL
   ```

4. **Initialize database**
   ```bash
   npm run db:setup
   ```

### **Option 2: Local PostgreSQL**

1. **Install PostgreSQL**

   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql

   # Ubuntu
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Create database**

   ```bash
   createdb dob_validator
   ```

3. **Set up environment**

   ```bash
   cd backend
   cp env.example .env
   # Update DATABASE_URL in .env
   ```

4. **Initialize database**
   ```bash
   npm run db:setup
   ```

## 📊 Database Schema

### **Core Tables**

#### **Users & Profiles**

```sql
users (
  id, wallet_address, email, name, company, role, created_at, updated_at
)

profiles (
  id, user_id, name, company, email, wallet_address, created_at, updated_at
)
```

#### **Submissions & Drafts**

```sql
submissions (
  id, user_id, device_name, device_type, serial_number, manufacturer,
  model, year_of_manufacture, condition, specifications, purchase_price,
  current_value, expected_revenue, operational_costs, status,
  submitted_at, updated_at
)

drafts (
  id, user_id, device_name, device_type, serial_number, manufacturer,
  model, year_of_manufacture, condition, specifications, purchase_price,
  current_value, expected_revenue, operational_costs,
  created_at, updated_at
)
```

#### **Files**

```sql
submission_files (
  id, submission_id, filename, path, size, mime_type, document_type, uploaded_at
)

draft_files (
  id, draft_id, filename, path, size, mime_type, document_type, uploaded_at
)
```

#### **Admin Reviews**

```sql
admin_reviews (
  id, submission_id, notes, technical_score, regulatory_score,
  financial_score, environmental_score, overall_score, decision,
  decision_at, reviewed_at
)
```

#### **Certificates**

```sql
certificates (
  id, submission_id, user_id, certificate_hash, stellar_tx_hash,
  issued_at, expires_at, status
)
```

#### **Authentication**

```sql
auth_challenges (
  id, challenge, wallet_address, expires_at, created_at
)

auth_sessions (
  id, token, wallet_address, expires_at, created_at
)
```

## 🔧 Database Commands

### **Development Commands**

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Reset database (WARNING: deletes all data)
npm run db:reset

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with test data
npm run db:seed
```

### **Production Commands**

```bash
# Deploy migrations to production
npx prisma migrate deploy

# Generate production client
npx prisma generate
```

## 🔄 Migration Process

### **Step 1: Database Setup**

1. Start PostgreSQL container
2. Run `npm run db:setup`
3. Verify tables created

### **Step 2: Update API Endpoints**

1. Replace in-memory storage with database calls
2. Update authentication to use database
3. Test all endpoints

### **Step 3: Data Migration**

1. Export existing data from files
2. Import into database
3. Verify data integrity

## 🛠️ Service Layer

### **Database Services**

We've created service layers for each data type:

```typescript
// User management
userService.findOrCreateByWallet(walletAddress, data);
userService.getByWallet(walletAddress);
userService.update(walletAddress, data);

// Profile management
profileService.create(userId, data);
profileService.getByWallet(walletAddress);
profileService.update(walletAddress, data);

// Submissions
submissionService.create(userId, data);
submissionService.getByUser(walletAddress, options);
submissionService.getAll(options); // for admin

// Drafts
draftService.create(userId, data);
draftService.getByUser(walletAddress, options);
draftService.update(id, data);

// Authentication
authService.createChallenge(walletAddress, challenge, expiresAt);
authService.createSession(walletAddress, token, expiresAt);
authService.cleanupExpired();
```

## 🔍 Database Queries

### **Common Queries**

#### **Get User with Profile**

```typescript
const user = await prisma.user.findUnique({
  where: { walletAddress },
  include: { profile: true },
});
```

#### **Get Submissions with Files**

```typescript
const submissions = await prisma.submission.findMany({
  where: { user: { walletAddress } },
  include: {
    files: true,
    adminReview: true,
    certificate: true,
  },
  orderBy: { submittedAt: "desc" },
});
```

#### **Get Drafts with Pagination**

```typescript
const [drafts, total] = await Promise.all([
  prisma.draft.findMany({
    where: { user: { walletAddress } },
    include: { files: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    skip: offset,
  }),
  prisma.draft.count({
    where: { user: { walletAddress } },
  }),
]);
```

## 🚨 Important Notes

### **Environment Variables**

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dob_validator?schema=public"
```

### **Connection Pooling**

For production, consider using connection pooling:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dob_validator?schema=public&connection_limit=5&pool_timeout=2"
```

### **Backup Strategy**

```bash
# Create backup
pg_dump dob_validator > backup.sql

# Restore backup
psql dob_validator < backup.sql
```

## 🔧 Troubleshooting

### **Common Issues**

#### **Connection Refused**

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs dob-validator-db
```

#### **Migration Errors**

```bash
# Reset database
npm run db:reset

# Regenerate client
npm run db:generate
```

#### **Permission Denied**

```bash
# Check database permissions
psql -U dob_user -d dob_validator -c "\du"
```

## 📈 Performance

### **Indexes**

We've added indexes for common queries:

- `idx_users_wallet_address` - Fast user lookups
- `idx_submissions_user_id` - Fast submission queries
- `idx_submissions_status` - Fast status filtering
- `idx_certificates_hash` - Fast certificate verification

### **Query Optimization**

- Use `include` for related data
- Use `select` to limit fields
- Use pagination for large datasets
- Use indexes for filtering

## 🔐 Security

### **Database Security**

- Use environment variables for credentials
- Enable SSL in production
- Use connection pooling
- Regular backups
- Monitor query performance

### **Data Protection**

- Encrypt sensitive data
- Use prepared statements
- Validate all inputs
- Log database access

## 📚 Next Steps

1. **Test Database Integration**

   - Verify all API endpoints work
   - Test data persistence
   - Check performance

2. **Update Frontend**

   - Replace in-memory storage calls
   - Update error handling
   - Test user flows

3. **Production Deployment**
   - Set up production database
   - Configure backups
   - Monitor performance
   - Set up alerts
