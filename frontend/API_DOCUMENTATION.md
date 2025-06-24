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

Get device submissions (requires authentication).

**Query Parameters:**

- `status`: Filter by status (pending, under review, approved, rejected, draft)
- `limit`: Number of results (default: 10)
- `offset`: Pagination offset (default: 0)

**Admin vs User Access:**

- **Admin users**: Can view all submissions across all users
- **Regular users**: Can only view their own submissions

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "submissions": [
    {
      "id": "SUB_1234567890_abc123",
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
      "operatorWallet": "GABC123...",
      "status": "pending",
      "submittedAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "files": [
        {
          "filename": "technical_cert.pdf",
          "path": "/uploads/tech_cert.pdf",
          "documentType": "technical-certification"
        }
      ],
      "adminNotes": null,
      "adminScore": null,
      "adminDecision": null,
      "adminDecisionAt": null,
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

#### GET /api/submissions/{id}

Get a specific submission by ID (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "submission": {
    "id": "SUB_1234567890_abc123",
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
    "operatorWallet": "GABC123...",
    "status": "pending",
    "submittedAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "files": [
      {
        "filename": "technical_cert.pdf",
        "path": "/uploads/tech_cert.pdf",
        "documentType": "technical-certification"
      }
    ],
    "adminNotes": null,
    "adminScore": null,
    "adminDecision": null,
    "adminDecisionAt": null,
    "certificateId": null
  }
}
```

#### PUT /api/submissions/{id}

Update a submission (admin only - requires authentication and admin wallet).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "adminScore": 85,
  "adminNotes": "Device meets all requirements. Excellent documentation provided.",
  "adminDecision": "approved",
  "adminDecisionAt": "2024-01-01T00:00:00.000Z",
  "status": "approved"
}
```

**Response:**

```json
{
  "success": true,
  "submission": {
    "id": "SUB_1234567890_abc123",
    "deviceName": "Industrial Robot X1",
    "status": "approved",
    "adminScore": 85,
    "adminNotes": "Device meets all requirements. Excellent documentation provided.",
    "adminDecision": "approved",
    "adminDecisionAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Submission updated successfully"
}
```

### Draft Management

#### POST /api/drafts

Create or update a draft submission (requires authentication).

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
  "operationalCosts": "5000"
}
```

#### GET /api/drafts

Get user's draft submissions (requires authentication).

**Query Parameters:**

- `limit`: Number of results (default: 10)
- `offset`: Pagination offset (default: 0)

**Response:**

```json
{
  "success": true,
  "drafts": [
    {
      "id": "DRAFT_1234567890_abc123",
      "deviceName": "Industrial Robot X1",
      "deviceType": "Manufacturing Equipment",
      "status": "draft",
      "submittedAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
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

## Backoffice Integration

### Admin Access Control

The backoffice requires admin wallet authentication. Admin wallets are configured in the system and can:

- View all submissions (not just their own)
- Update submission status and admin fields
- Sign and submit validations to the Stellar blockchain

### Backoffice API Usage

The backoffice uses the same API endpoints but with admin privileges:

1. **Authentication**: Admin wallet connects and authenticates
2. **Submissions**: Admin can view all submissions via `/api/submissions`
3. **Review**: Admin can fetch specific submission via `/api/submissions/{id}`
4. **Update**: Admin can update submission with decision via `PUT /api/submissions/{id}`
5. **Blockchain**: Admin signs and submits validation to Stellar contract

### Example Backoffice Flow

```javascript
// 1. Admin authenticates with wallet
const authResponse = await fetch("/api/auth/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ walletAddress, signature, challenge }),
});

// 2. Admin fetches all pending submissions
const submissionsResponse = await fetch("/api/submissions?status=pending", {
  headers: { Authorization: `Bearer ${token}` },
});

// 3. Admin reviews specific submission
const submissionResponse = await fetch(`/api/submissions/${submissionId}`, {
  headers: { Authorization: `Bearer ${token}` },
});

// 4. Admin updates submission with decision
const updateResponse = await fetch(`/api/submissions/${submissionId}`, {
  method: "PUT",
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    adminScore: 85,
    adminNotes: "Approved after review",
    adminDecision: "approved",
    adminDecisionAt: new Date().toISOString(),
    status: "approved",
  }),
});
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
- `403`: Forbidden (admin access required)
- `404`: Not Found
- `500`: Internal Server Error

## Security Considerations

1. **JWT Tokens**: Tokens expire after 7 days and are stored securely
2. **Challenge Verification**: Each authentication requires a unique challenge
3. **Wallet Signature**: Cryptographic proof of wallet ownership
4. **Admin Access**: Admin wallets are whitelisted and verified
5. **Rate Limiting**: Implement rate limiting for production
6. **CORS**: Configure CORS properly for production

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

## Backoffice Integration

The backoffice uses a dedicated API service (`lib/api-service.ts`) that handles:

- Authentication token management
- API request formatting
- Error handling
- Admin-specific endpoints

```typescript
import { apiService } from "@/lib/api-service";

// Check authentication
if (apiService.isAuthenticated()) {
  // Fetch submissions
  const response = await apiService.getSubmissions({ status: "pending" });

  // Get specific submission
  const submission = await apiService.getSubmission(submissionId);

  // Update submission
  await apiService.updateSubmission(submissionId, {
    adminScore: 85,
    adminDecision: "approved",
  });
}
```

## Next Steps

1. **Database Integration**: Replace in-memory storage with PostgreSQL
2. **PDF Generation**: Implement actual certificate PDF generation
3. **Email Notifications**: Add email notification system
4. **Admin Panel**: Create admin endpoints for submission review
5. **Stellar Integration**: Add blockchain metadata storage
6. **Rate Limiting**: Implement API rate limiting
7. **Monitoring**: Add API monitoring and logging
