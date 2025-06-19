# API Testing Guide

## 🚀 Quick Start

1. **Start the development server:**

   ```bash
   cd frontend
   pnpm dev
   ```

2. **Set up environment variables:**
   Create a `.env.local` file with:
   ```env
   ***REMOVED***=your-test-secret-key
   ```

## 🔐 Testing Authentication Flow

### Step 1: Request Challenge

```bash
curl -X POST http://localhost:3000/api/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "GABC123456789012345678901234567890123456789012345678901234567890"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "challenge": "DOB_VALIDATOR_AUTH_1234567890_abc123",
  "message": "Please sign this challenge with your wallet to authenticate"
}
```

### Step 2: Verify Signature (Mock)

```bash
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "GABC123456789012345678901234567890123456789012345678901234567890",
    "signature": "mock_signature_here",
    "challenge": "DOB_VALIDATOR_AUTH_1234567890_abc123"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d",
  "message": "Authentication successful"
}
```

## 👤 Testing Profile Management

### Create Profile

```bash
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "company": "Tech Corp",
    "email": "john@techcorp.com",
    "phone": "+1234567890",
    "website": "https://techcorp.com",
    "bio": "Technology enthusiast"
  }'
```

### Get Profile

```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Profile

```bash
curl -X PUT http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe Updated",
    "company": "Tech Corp Updated",
    "email": "john.updated@techcorp.com"
  }'
```

### Delete Profile

```bash
curl -X DELETE http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Testing Submissions

### Create Submission

```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "deviceName": "Industrial Robot X1",
    "deviceType": "Manufacturing Equipment",
    "serialNumber": "ROB-X1-2024-001",
    "manufacturer": "TechCorp Industries",
    "model": "X1 Pro",
    "yearOfManufacture": "2024",
    "condition": "Excellent",
    "specifications": "Advanced robotic arm with AI capabilities for manufacturing automation",
    "purchasePrice": "50000",
    "currentValue": "45000",
    "expectedRevenue": "100000",
    "operationalCosts": "5000"
  }'
```

### Get Submissions

```bash
curl -X GET "http://localhost:3000/api/submissions?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Submissions by Status

```bash
curl -X GET "http://localhost:3000/api/submissions?status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🏆 Testing Certificates

### Generate Certificate

```bash
curl -X POST http://localhost:3000/api/certificates/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "deviceId": "SUB_1234567890_abc123",
    "deviceName": "Industrial Robot X1",
    "operatorName": "John Doe",
    "validationDate": "2024-01-01",
    "certificateType": "comprehensive",
    "metadata": {
      "validationScore": 95,
      "inspector": "Admin User"
    }
  }'
```

### Get Certificate

```bash
curl -X GET "http://localhost:3000/api/certificates/generate?id=CERT_1234567890_abc123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Verify Certificate (Public)

```bash
curl -X GET http://localhost:3000/api/certificates/CERT_1234567890_abc123/verify
```

## 🧪 Browser Testing

1. **Load the test script:**

   ```bash
   # Copy the content of test-api.js and paste it in browser console
   ```

2. **Run all tests:**

   ```javascript
   testAPI.runAllTests();
   ```

3. **Run individual tests:**

   ```javascript
   // Test challenge
   testAPI.testChallenge();

   // Test profile creation (after getting token)
   testAPI.testCreateProfile("your_jwt_token");
   ```

## 🔍 Testing Error Cases

### Test Invalid Challenge

```bash
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "GABC123456789012345678901234567890123456789012345678901234567890",
    "signature": "invalid_signature",
    "challenge": "invalid_challenge"
  }'
```

### Test Missing Authentication

```bash
curl -X GET http://localhost:3000/api/profile
```

### Test Invalid Profile Data

```bash
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "",
    "email": "invalid-email"
  }'
```

## 📊 Expected Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `500` - Internal Server Error

## 🐛 Debugging Tips

1. **Check server logs** for detailed error messages
2. **Use browser dev tools** to inspect network requests
3. **Verify JWT token** format and expiration
4. **Check environment variables** are properly set
5. **Test with Postman** for easier request management

## 🔄 Complete Test Flow

```bash
# 1. Get challenge
CHALLENGE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "GABC123456789012345678901234567890123456789012345678901234567890"}')

# 2. Extract challenge
CHALLENGE=$(echo $CHALLENGE_RESPONSE | jq -r '.challenge')

# 3. Verify signature
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\": \"GABC123456789012345678901234567890123456789012345678901234567890\", \"signature\": \"mock_signature\", \"challenge\": \"$CHALLENGE\"}")

# 4. Extract token
TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.token')

# 5. Create profile
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Test User", "company": "Test Corp", "email": "test@example.com"}'

echo "Test completed!"
```

## 🚨 Important Notes

1. **Local Development**: All tests work on `localhost:3000`
2. **Mock Signatures**: Current implementation accepts any signature for testing
3. **In-Memory Storage**: Data is lost on server restart
4. **JWT Secret**: Use a strong secret in production
5. **CORS**: Configure CORS for production deployment
