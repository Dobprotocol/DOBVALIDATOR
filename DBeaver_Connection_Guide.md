# DBeaver Connection Guide for DOB Validator

## Prerequisites

- Cloud SQL Proxy running on port 5433
- DBeaver installed
- Google Cloud SQL instance: `stoked-utility-453816-e2:us-central1:dob-validator`

## Step 1: Start the Cloud SQL Proxy

### Option A: Using the Docker Script (Recommended)

```bash
./start-docker-proxy.sh
```

### Option B: Manual Docker Command

```bash
sudo docker run \
  -v /Users/JoaquinNam/Desktop/MENTE_MAESTRA/1CLIENTS/DOBPROTOCOL/DOBVALIDATOR/keys:/config \
  -p 127.0.0.1:5433:5432 \
  gcr.io/cloudsql-docker/gce-proxy:1.16 \
  /cloud_sql_proxy \
    -instances=stoked-utility-453816-e2:us-central1:dob-validator=tcp:0.0.0.0:5432 \
    -credential_file=/config/account.json
```

## Step 2: Configure DBeaver Connection

### 1. Create New Connection

- Open DBeaver
- Click "New Database Connection" (plug icon)
- Select "PostgreSQL"

### 2. Main Connection Settings

- **Host**: `localhost`
- **Port**: `5433`
- **Database**: `postgres` (or your specific database name)
- **Username**: `postgres` (or your database user)
- **Password**: Your database password

### 3. SSL Settings

- Go to the **SSL** tab
- **SSL Mode**: `Disable` (since we're using the proxy)
- Leave other SSL settings as default

### 4. Driver Properties (Optional)

- Go to the **Driver properties** tab
- You can leave these as default

### 5. Test Connection

- Click "Test Connection" to verify everything works
- You should see "Connected" if successful

## Step 3: Database Schema Information

Based on your Prisma schema, you should see these tables:

### Core Tables

- `users` - User accounts and wallet addresses
- `profiles` - User profile information
- `submissions` - Device submissions
- `drafts` - Draft submissions
- `certificates` - Issued certificates
- `admin_reviews` - Admin review data

### Supporting Tables

- `submission_files` - Files attached to submissions
- `draft_files` - Files attached to drafts
- `auth_challenges` - Authentication challenges
- `auth_sessions` - Authentication sessions

## Step 4: Useful Queries

### Check Database Connection

```sql
SELECT version();
```

### View All Tables

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

### Check Recent Submissions

```sql
SELECT
  s.id,
  s.device_name,
  s.status,
  s.submitted_at,
  u.wallet_address
FROM submissions s
JOIN users u ON s.user_id = u.id
ORDER BY s.submitted_at DESC
LIMIT 10;
```

### Check User Count

```sql
SELECT
  role,
  COUNT(*) as user_count
FROM users
GROUP BY role;
```

## Troubleshooting

### Connection Issues

1. **Port 5433 not listening**: Make sure the Cloud SQL Proxy is running
2. **Authentication failed**: Check your database username/password
3. **SSL errors**: Make sure SSL is disabled in DBeaver settings

### Proxy Issues

1. **Container not starting**: Check if Docker is running
2. **Permission errors**: Make sure the keys directory is accessible
3. **Instance not found**: Verify the instance connection name

### Useful Commands

```bash
# Check if proxy is running
lsof -i :5433

# Check Docker containers
sudo docker ps | grep cloud-sql-proxy

# View proxy logs
sudo docker logs cloud-sql-proxy

# Stop proxy
sudo docker stop cloud-sql-proxy
```

## Security Notes

- The service account credentials in `keys/account.json` should be kept secure
- Never commit these credentials to version control
- The proxy only listens on localhost (127.0.0.1) for security
- Consider using environment variables for sensitive data in production
