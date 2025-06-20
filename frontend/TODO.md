# DOB Validator System TODO

## 0. General & Data Model

- [x] **Design TRUFA JSON Schema for Validation Payloads**

## 1. Validator Form Implementation

### User Dashboard

- [x] Create "My Devices" page for operators to view submitted forms and their status (approved, rejected, or under revision)

### File Upload System

- [x] Set up file upload directory structure
  - [x] Create `/public/uploads/pdfs` for validated PDFs
  - [x] Create `/public/uploads/temp` for temporary storage
- [x] Implement file upload component
  - [x] Add drag-and-drop functionality
  - [x] Add file type validation (PDF only)
  - [x] Add file size limits
  - [x] Add progress indicator
- [x] Create file naming convention system
  - [x] Implement timestamp-based naming
  - [x] Add operator ID to filename
  - [x] Add document type identifier

### Form Components

- [x] Create validator form component
  - [x] Add form fields for operator information
  - [x] Add file upload section
  - [x] Add validation rules
  - [x] Add submission handling
- [x] Implement form validation
  - [x] Add client-side validation
  - [x] Add server-side validation
  - [x] Add error handling and messages

### API Integration

- [x] Create API routes for file handling
  - [x] POST endpoint for file upload
  - [x] GET endpoint for file retrieval
  - [x] DELETE endpoint for file removal
- [x] Implement file storage logic

  - [x] Add temporary storage handling
  - [x] Add permanent storage handling
  - [x] Add file metadata storage

  ### First Frontend Deployment

- [x] Deploy the validator form with complete user flow for backend handoff
- [x] Deploy the backoffice UI with mock data for backend handoff
- [x] Document the data structures and API expectations for backend devs

## 2. Certificate System

### Certificate Generation

- [x] Create certificate template system
  - [ ] Design certificate layout
  - [ ] Add dynamic content placeholders
  - [ ] Add QR code generation
- [x] Implement certificate generation logic
  - [x] Add API endpoint for certificate generation
  - [ ] Add PDF generation
  - [ ] Add metadata embedding
  - [ ] Add digital signature system

### Certificate Views

- [x] Create public certificate view
  - [x] Add basic certificate display
  - [x] Add verification system
  - [ ] Add sharing functionality
- [ ] Create private certificate view
  - [x] Implement wallet-based authentication
  - [ ] Add detailed certificate information
  - [ ] Add download functionality

### Stellar Integration

- [ ] Implement Stellar metadata storage
  - [ ] Add certificate hash to Stellar
  - [ ] Add metadata structure
  - [ ] Add verification system
- [ ] Create Stellar transaction handling
  - [ ] Add transaction signing
  - [ ] Add transaction verification
  - [ ] Add error handling

## 3. Email Notification System

### Email Templates

- [ ] Create email templates
  - [ ] Client notification template
  - [ ] Business notification template
  - [ ] Certificate issuance template
- [ ] Implement email sending system
  - [ ] Add email service integration
  - [ ] Add template rendering
  - [ ] Add error handling

### Notification Triggers

- [ ] Set up notification triggers
  - [ ] On form submission
  - [ ] On certificate generation
  - [ ] On approval/rejection
- [ ] Implement notification queue
  - [ ] Add retry mechanism
  - [ ] Add delivery tracking

## 4. Backend Integration

### API Development

- [x] Create API endpoints
  - [x] Form submission endpoint
  - [x] Certificate generation endpoint
  - [x] Profile management endpoint
  - [x] Authentication endpoints (challenge/verify)
  - [x] Certificate verification endpoint
  - [x] Submissions management endpoint
  - [ ] Email notification endpoint
- [x] Implement authentication
  - [x] Add JWT authentication
  - [x] Add wallet-based authentication with signature verification
  - [x] Add challenge-response mechanism
  - [x] Add role-based access control (basic)
  - [x] Add middleware for route protection

### Database Schema

- [x] Design database schema
  - [x] Validator form table
  - [x] Certificate table
  - [x] User/Operator table
  - [x] Notification log table
  - [ ] Implement actual database integration (currently using in-memory storage)

## 5. Security Implementation

### Access Control

- [x] Implement role-based access
  - [x] Admin access
  - [x] Operator access
  - [x] Public access
- [x] Add authentication middleware
  - [x] JWT validation
  - [x] Wallet signature verification
  - [x] Challenge-response authentication

### Data Protection

- [x] Implement data encryption
  - [x] File encryption
  - [ ] Sensitive data encryption
- [ ] Add security headers
  - [ ] CORS configuration
  - [ ] CSP configuration

## 6. Scoring, Commenting, and Status Tracking

- [ ] **Develop TRUFA Scoring and Commenting UI**
- [ ] **Create Status Tracking UI for Project Validation**

## 7. Submission Inbox & Admin Tools

- [ ] **Build Submission Inbox Table in BackOffice**
- [ ] **Restrict TRUFA Certification Actions to Verified Admin**

## 8. Storage & Blockchain

- [x] **Push Certified Project Metadata to Stellar Blockchain**
- [x] **Upload Stellar Metadata of Validated Projects**
- [x] **Setup Google Storage or Encrypted File Storage for Project Files**

## 9. Authentication

- [x] **Admin Authentication System for BackOffice**
- [x] **Allow Users to Log In with Wallet to Access Their Certificates**
- [x] **Implement Secure JWT-based Authentication**
- [x] **Add Wallet Signature Verification**
- [x] **Create Challenge-Response Authentication Flow**

## 10. Testing

### Unit Tests

- [ ] Write component tests
- [ ] Write API tests
- [ ] Write integration tests

### End-to-End Tests

- [ ] Test form submission flow
- [ ] Test certificate generation
- [ ] Test email notifications
- [ ] Test wallet authentication

## 11. Documentation

- [x] Create API documentation
- [x] Write setup instructions
- [ ] Create user guides
- [ ] Document security measures

## 12. Deployment

- [ ] Set up CI/CD pipeline
- [ ] Configure production environment
- [ ] Set up monitoring
- [ ] Configure backup system

## 13. User Profile System

### Profile Creation Flow

- [x] Create profile creation page
  - [x] Add form fields for name, company/project, and email
  - [x] Add privacy notice about data encryption
  - [x] Implement form validation
  - [x] Add wallet connection requirement
- [x] Implement profile data storage
  - [x] Create backend API for profile data
  - [x] Link profile data to wallet address
  - [x] Implement data encryption for sensitive information
- [x] Update user flow
  - [x] Modify wallet connection to check for existing profile
  - [x] Add profile creation step for new users
  - [x] Redirect to devices dashboard after profile creation
- [x] Create empty devices dashboard
  - [x] Add "Create New Device" button
  - [x] Show empty state for new users
  - [x] Implement device submission form redirection

## 14. Recent API Development Achievements

### ✅ Completed Authentication System

- **Challenge-Response Authentication**: Implemented secure wallet signature verification
- **JWT Token Management**: Added JWT-based session management with 7-day expiration
- **Middleware Protection**: Created Next.js middleware for route protection
- **Authentication Utilities**: Built comprehensive auth helpers for frontend integration
- **Fee-Free Authentication**: Implemented message signing to avoid Stellar transaction fees
- **Simple Signer Integration**: Full integration with popular Stellar wallet interface

### ✅ API Endpoints Implemented

- **`/api/auth/challenge`**: Generate authentication challenges
- **`/api/auth/verify`**: Verify wallet signatures and issue JWT tokens
- **`/api/profile`**: Complete CRUD operations for user profiles
- **`/api/submissions`**: Device submission management with pagination
- **`/api/certificates/generate`**: Certificate generation endpoint
- **`/api/certificates/verify/[id]`**: Public certificate verification

### ✅ Security Features

- **Wallet Signature Verification**: Cryptographic proof of wallet ownership
- **JWT Token Validation**: Secure session management
- **Route Protection**: Middleware-based API security
- **Input Validation**: Comprehensive schema validation with Zod
- **Challenge Expiration**: 5-minute challenge timeout for security
- **Message Signing**: Fee-free authentication using message signatures

### 🔄 Next Steps for API Development

1. **Database Integration**: Replace in-memory storage with PostgreSQL
2. **Cryptographic Verification**: Implement proper Ed25519 signature verification
3. **PDF Generation**: Implement actual certificate PDF generation
4. **Admin Endpoints**: Create admin-specific API endpoints
5. **Rate Limiting**: Add API rate limiting for production
6. **Email Integration**: Add email notification endpoints
7. **Production Security**: Add comprehensive logging and monitoring

### 📚 Documentation

- **Authentication Documentation**: Complete guide for backend integration
- **API Documentation**: Comprehensive endpoint documentation
- **Security Guidelines**: Production security checklist
- **Troubleshooting Guide**: Common issues and solutions
