# DOB Validator API Documentation

## Overview

The DOB Validator API provides a secure, wallet-based authentication system and comprehensive endpoints for device validation, certificate generation, and profile management.

## Authentication System

### Security Architecture

The system uses a two-step authentication process:

1. **Wallet Connection**: User connects wallet via Simple Signer
2. **Signature Verification**: User signs a challenge to prove wallet ownership
3. **JWT Issuance**: System issues JWT tokens for authenticated requests

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant W as Wallet

    U->>F: Connect Wallet
    F->>W: Request Connection
    W->>F: Return Wallet Address
    F->>A: POST /api/auth/challenge
    A->>F: Return Challenge
    F->>W: Request Signature
    W->>F: Return Signature
    F->>A: POST /api/auth/verify
    A->>F: Return JWT Token
    F->>F: Store Token
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/challenge

Request a challenge for wallet signature verification.

**Request Body:**

```json
{
  "walletAddress": "GABC123..."
}
```

**Response:**

```json
{
  "success": true,
  "challenge": "DOB_VALIDATOR_AUTH_1234567890_abc123",
  "message": "Please sign this challenge with your wallet to authenticate"
}
```

#### POST /api/auth/verify

Verify wallet signature and issue JWT token.

**Request Body:**

```json
{
  "walletAddress": "GABC123...",
  "signature": "base64_signature_here",
  "challenge": "DOB_VALIDATOR_AUTH_1234567890_abc123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d",
  "message": "Authentication successful"
}
```

### Profile Management

#### GET /api/profile

Get user profile (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "profile": {
    "walletAddress": "GABC123...",
    "name": "John Doe",
    "company": "Tech Corp",
    "email": "john@techcorp.com",
    "phone": "+1234567890",
    "website": "https://techcorp.com",
    "bio": "Technology enthusiast",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/profile

Create or update user profile (requires authentication).

**Request Body:**

```json
{
  "name": "John Doe",
  "company": "Tech Corp",
  "email": "john@techcorp.com",
  "phone": "+1234567890",
  "website": "https://techcorp.com",
  "bio": "Technology enthusiast"
}
```

### Device Submissions

#### POST /api/submissions

Create a new device submission (requires authentication).

**Request Body:**

```json
{
  "deviceName": "Industrial Robot X1",
  "deviceType": "Manufacturing Equipment",
  "serialNumber": "ROB-X1-2024-001",
  "manufacturer": "TechCorp Industries",
  "model": "X1 Pro",
  "yearOfManufacture": "2024",
  "condition": "Excellent",
  "specifications": "Advanced robotic arm with AI capabilities...",
  "purchasePrice": "50000",
  "currentValue": "45000",
  "expectedRevenue": "100000",
  "operationalCosts": "5000",
  "files": [
    {
      "filename": "technical_cert.pdf",
      "path": "/uploads/tech_cert.pdf",
      "documentType": "technical-certification"
    }
  ]
}
```

#### GET /api/submissions

Get user's device submissions (requires authentication).

**Query Parameters:**

- `status`: Filter by status (pending, approved, rejected, under_revision)
- `limit`: Number of results (default: 10)
- `offset`: Pagination offset (default: 0)

**Response:**

```json
{
  "success": true,
  "submissions": [
    {
      "id": "SUB_1234567890_abc123",
      "deviceName": "Industrial Robot X1",
      "deviceType": "Manufacturing Equipment",
      "status": "pending",
      "submittedAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "certificateId": null
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

### Certificate Management

#### POST /api/certificates/generate

Generate a certificate for a validated device (requires authentication).

**Request Body:**

```json
{
  "deviceId": "SUB_1234567890_abc123",
  "deviceName": "Industrial Robot X1",
  "operatorName": "John Doe",
  "validationDate": "2024-01-01",
  "certificateType": "comprehensive",
  "metadata": {
    "validationScore": 95,
    "inspector": "Admin User"
  }
}
```

**Response:**

```json
{
  "success": true,
  "certificate": {
    "id": "CERT_1234567890_abc123",
    "deviceId": "SUB_1234567890_abc123",
    "deviceName": "Industrial Robot X1",
    "operatorName": "John Doe",
    "operatorWallet": "GABC123...",
    "validationDate": "2024-01-01",
    "certificateType": "comprehensive",
    "issuedAt": "2024-01-01T00:00:00.000Z",
    "status": "issued",
    "pdfUrl": "/api/certificates/CERT_1234567890_abc123/pdf",
    "verificationUrl": "/api/certificates/CERT_1234567890_abc123/verify"
  }
}
```

#### GET /api/certificates/verify/[id]

Public certificate verification endpoint.

**Response:**

```json
{
  "valid": true,
  "certificate": {
    "id": "CERT_1234567890_abc123",
    "deviceName": "Industrial Robot X1",
    "operatorName": "John Doe",
    "validationDate": "2024-01-01",
    "certificateType": "comprehensive",
    "issuedAt": "2024-01-01T00:00:00.000Z",
    "status": "issued"
  },
  "message": "Certificate is valid and authentic"
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

Common HTTP status codes:

- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `404`: Not Found
- `500`: Internal Server Error

## Security Considerations

1. **JWT Tokens**: Tokens expire after 7 days and are stored securely
2. **Challenge Verification**: Each authentication requires a unique challenge
3. **Wallet Signature**: Cryptographic proof of wallet ownership
4. **Rate Limiting**: Implement rate limiting for production
5. **CORS**: Configure CORS properly for production

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database Configuration (for future use)
DATABASE_URL=postgresql://username:password@localhost:5432/dob_validator

# Stellar Network Configuration
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# File Storage Configuration
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760

# Admin Configuration
ADMIN_WALLET_ADDRESSES=GABC123...,GDEF456...
```

## Frontend Integration

Use the authentication utilities in `lib/auth.ts`:

```typescript
import {
  authenticateWallet,
  isAuthenticated,
  authenticatedFetch,
  logout,
} from "@/lib/auth";

// Check if user is authenticated
if (isAuthenticated()) {
  // User is logged in
}

// Make authenticated API request
const response = await authenticatedFetch("/api/profile");

// Logout user
logout();
```

## Next Steps

1. **Database Integration**: Replace in-memory storage with PostgreSQL
2. **PDF Generation**: Implement actual certificate PDF generation
3. **Email Notifications**: Add email notification system
4. **Admin Panel**: Create admin endpoints for submission review
5. **Stellar Integration**: Add blockchain metadata storage
6. **Rate Limiting**: Implement API rate limiting
7. **Monitoring**: Add API monitoring and logging
