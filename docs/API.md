# DOB Protocol - API Documentation

## Overview

This document provides comprehensive API documentation for the DOB Protocol backend services. The API is built using Node.js, Express, and Prisma ORM, providing endpoints for authentication, user management, project submissions, and validation.

## Base URL

- **Development**: `http://localhost:3001`
- **Staging**: `https://staging.dobprotocol.com`
- **Production**: `https://v.dobprotocol.com`

## Authentication

The API uses JWT tokens with Stellar signature verification for authentication.

### Authentication Flow

1. **Challenge Generation**: Client requests a challenge string
2. **Signature**: Client signs the challenge with their Stellar wallet
3. **Verification**: Server verifies the signature and issues a JWT token
4. **Authorization**: Client includes JWT token in subsequent requests

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/challenge

Generate a challenge string for wallet authentication.

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
  "challenge": "DOB_PROTOCOL_CHALLENGE_2024_01_15_123456789",
  "expiresAt": "2024-01-15T12:35:00.000Z"
}
```

#### POST /api/auth/verify

Verify wallet signature and authenticate user.

**Request Body:**

```json
{
  "walletAddress": "GABC123...",
  "signature": "base64_encoded_signature",
  "challenge": "DOB_PROTOCOL_CHALLENGE_2024_01_15_123456789"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "walletAddress": "GABC123...",
    "role": "operator",
    "profile": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### POST /api/auth/wallet-login

Direct wallet login (alternative to challenge/verify flow).

**Request Body:**

```json
{
  "walletAddress": "GABC123...",
  "signature": "base64_encoded_signature",
  "message": "Login to DOB Protocol"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "walletAddress": "GABC123...",
    "role": "operator"
  }
}
```

### User Profile Endpoints

#### GET /api/profile

Get current user's profile information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "profile": {
    "id": "user_123",
    "walletAddress": "GABC123...",
    "role": "operator",
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Infrastructure Corp",
    "location": "New York, NY",
    "profileImage": "https://api.dobprotocol.com/uploads/profile_123.jpg",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

#### POST /api/profile

Update user profile information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Infrastructure Corp",
  "location": "New York, NY"
}
```

**Response:**

```json
{
  "success": true,
  "profile": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Infrastructure Corp",
    "location": "New York, NY",
    "updatedAt": "2024-01-15T12:30:00.000Z"
  }
}
```

#### POST /api/profile/upload-image

Upload profile image.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**

```
Form data with 'image' field containing the image file
```

**Response:**

```json
{
  "success": true,
  "imageUrl": "https://api.dobprotocol.com/uploads/profile_123.jpg"
}
```

### Project Submission Endpoints

#### GET /api/submissions

Get list of user's project submissions.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `status` (optional): Filter by status (`draft`, `submitted`, `reviewing`, `approved`, `rejected`)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**

```json
{
  "success": true,
  "submissions": [
    {
      "id": "sub_123",
      "title": "Solar Farm Project",
      "status": "submitted",
      "trufaScore": 85,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### POST /api/submissions

Create a new project submission.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**

```
Form data with submission fields and files:
- title: Project title
- description: Project description
- technicalSpecs: Technical specifications
- financialMetrics: Financial metrics
- documents: Array of document files
- images: Array of image files
```

**Response:**

```json
{
  "success": true,
  "submission": {
    "id": "sub_123",
    "title": "Solar Farm Project",
    "status": "draft",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### GET /api/submissions/:id

Get detailed information about a specific submission.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "submission": {
    "id": "sub_123",
    "title": "Solar Farm Project",
    "description": "Large-scale solar farm project",
    "status": "submitted",
    "trufaScore": 85,
    "technicalScore": 90,
    "regulatoryScore": 80,
    "financialScore": 85,
    "documents": [
      {
        "id": "doc_123",
        "name": "technical_specs.pdf",
        "url": "https://api.dobprotocol.com/uploads/doc_123.pdf"
      }
    ],
    "images": [
      {
        "id": "img_123",
        "name": "project_overview.jpg",
        "url": "https://api.dobprotocol.com/uploads/img_123.jpg"
      }
    ],
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

#### PUT /api/submissions/:id

Update an existing submission.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**

```
Form data with updated submission fields
```

**Response:**

```json
{
  "success": true,
  "submission": {
    "id": "sub_123",
    "title": "Updated Solar Farm Project",
    "status": "draft",
    "updatedAt": "2024-01-15T13:00:00.000Z"
  }
}
```

#### DELETE /api/submissions/:id

Delete a submission (only if status is 'draft').

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Submission deleted successfully"
}
```

### Draft Management Endpoints

#### GET /api/drafts

Get list of user's draft submissions.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "drafts": [
    {
      "id": "draft_123",
      "title": "Draft Solar Farm Project",
      "lastSaved": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

#### POST /api/drafts

Save a draft submission.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "title": "Draft Solar Farm Project",
  "description": "Large-scale solar farm project",
  "technicalSpecs": "...",
  "financialMetrics": "..."
}
```

**Response:**

```json
{
  "success": true,
  "draft": {
    "id": "draft_123",
    "title": "Draft Solar Farm Project",
    "lastSaved": "2024-01-15T12:00:00.000Z"
  }
}
```

### Admin Endpoints (Admin Role Required)

#### GET /api/admin-reviews

Get list of submissions for admin review.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `status` (optional): Filter by status
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**

```json
{
  "success": true,
  "submissions": [
    {
      "id": "sub_123",
      "title": "Solar Farm Project",
      "status": "reviewing",
      "trufaScore": 85,
      "operator": {
        "name": "John Doe",
        "company": "Infrastructure Corp"
      },
      "submittedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

#### POST /api/admin-reviews/:submissionId

Submit admin review for a submission.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "decision": "approved",
  "technicalScore": 90,
  "regulatoryScore": 80,
  "financialScore": 85,
  "comments": "Excellent project proposal with strong technical foundation",
  "certificateData": {
    "certificateId": "cert_123",
    "validUntil": "2025-01-15T00:00:00.000Z"
  }
}
```

**Response:**

```json
{
  "success": true,
  "review": {
    "id": "review_123",
    "submissionId": "sub_123",
    "decision": "approved",
    "trufaScore": 85,
    "certificateUrl": "https://api.dobprotocol.com/certificates/cert_123.pdf",
    "reviewedAt": "2024-01-15T14:00:00.000Z"
  }
}
```

### Health Check Endpoints

#### GET /api/health

Check API health status.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "version": "1.0.0",
  "database": "connected"
}
```

#### GET /api/ping

Simple ping endpoint.

**Response:**

```json
{
  "pong": "2024-01-15T12:00:00.000Z"
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "title",
      "issue": "Title is required"
    }
  }
}
```

### Common Error Codes

- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Profile endpoints**: 60 requests per minute
- **Submission endpoints**: 30 requests per minute
- **Admin endpoints**: 100 requests per minute

## File Upload

### Supported File Types

- **Images**: JPG, PNG, GIF, WebP (max 10MB)
- **Documents**: PDF, DOC, DOCX (max 50MB)
- **Spreadsheets**: XLS, XLSX, CSV (max 20MB)

### Upload Limits

- **Profile images**: 1 file per user
- **Submission documents**: 10 files per submission
- **Submission images**: 20 files per submission

## WebSocket Events

For real-time updates, the API supports WebSocket connections:

### Connection

```
ws://localhost:3001/ws
```

### Events

#### submission.updated

```json
{
  "event": "submission.updated",
  "data": {
    "submissionId": "sub_123",
    "status": "approved",
    "trufaScore": 85
  }
}
```

#### review.completed

```json
{
  "event": "review.completed",
  "data": {
    "submissionId": "sub_123",
    "decision": "approved",
    "certificateUrl": "https://api.dobprotocol.com/certificates/cert_123.pdf"
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```javascript
import { DOBProtocolAPI } from "@dobprotocol/api-client";

const api = new DOBProtocolAPI({
  baseURL: "https://api.dobprotocol.com",
  walletAddress: "GABC123...",
});

// Authenticate
const auth = await api.authenticate(signature, challenge);

// Get profile
const profile = await api.getProfile();

// Create submission
const submission = await api.createSubmission({
  title: "Solar Farm Project",
  description: "Large-scale solar farm",
  documents: [file1, file2],
});
```

### cURL Examples

#### Authenticate

```bash
curl -X POST https://api.dobprotocol.com/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "GABC123...",
    "signature": "base64_signature",
    "challenge": "DOB_PROTOCOL_CHALLENGE_..."
  }'
```

#### Create Submission

```bash
curl -X POST https://api.dobprotocol.com/api/submissions \
  -H "Authorization: Bearer <jwt_token>" \
  -F "title=Solar Farm Project" \
  -F "description=Large-scale solar farm" \
  -F "documents=@technical_specs.pdf"
```

## Versioning

API versioning is handled through URL paths:

- Current version: `/api/`
- Future versions: `/api/v2/`, `/api/v3/`, etc.

## Support

For API support and questions:

- [GitHub Issues](https://github.com/blessedux/DOBVALIDATOR/issues)
- [Documentation](https://wiki.dobprotocol.com)
- [Technical Documentation](README.md)
