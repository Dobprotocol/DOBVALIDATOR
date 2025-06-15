# DOB Validator System TODO

## 0. General & Data Model

- [ ] **Design TRUFA JSON Schema for Validation Payloads**

## 1. Validator Form Implementation

### File Upload System

- [ ] Set up file upload directory structure
  - [x] Create `/public/uploads/pdfs` for validated PDFs
  - [x] Create `/public/uploads/temp` for temporary storage
- [ ] Implement file upload component
  - [ ] Add drag-and-drop functionality
  - [ ] Add file type validation (PDF only)
  - [ ] Add file size limits
  - [ ] Add progress indicator
- [ ] Create file naming convention system
  - [ ] Implement timestamp-based naming
  - [ ] Add operator ID to filename
  - [ ] Add document type identifier

### Form Components

- [ ] Create validator form component
  - [ ] Add form fields for operator information
  - [ ] Add file upload section
  - [ ] Add validation rules
  - [ ] Add submission handling
- [ ] Implement form validation
  - [ ] Add client-side validation
  - [ ] Add server-side validation
  - [ ] Add error handling and messages

### API Integration

- [ ] Create API routes for file handling
  - [ ] POST endpoint for file upload
  - [ ] GET endpoint for file retrieval
  - [ ] DELETE endpoint for file removal
- [ ] Implement file storage logic
  - [ ] Add temporary storage handling
  - [ ] Add permanent storage handling
  - [ ] Add file metadata storage

## 2. Certificate System

### Certificate Generation

- [ ] Create certificate template system
  - [ ] Design certificate layout
  - [ ] Add dynamic content placeholders
  - [ ] Add QR code generation
- [ ] Implement certificate generation logic
  - [ ] Add PDF generation
  - [ ] Add metadata embedding
  - [ ] Add digital signature system

### Certificate Views

- [ ] Create public certificate view
  - [ ] Add basic certificate display
  - [ ] Add verification system
  - [ ] Add sharing functionality
- [ ] Create private certificate view
  - [ ] Implement wallet-based authentication
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

- [ ] Create API endpoints
  - [ ] Form submission endpoint
  - [ ] Certificate generation endpoint
  - [ ] Email notification endpoint
- [ ] Implement authentication
  - [ ] Add JWT authentication
  - [ ] Add wallet-based authentication
  - [ ] Add role-based access control

### Database Schema

- [ ] Design database schema
  - [ ] Validator form table
  - [ ] Certificate table
  - [ ] User/Operator table
  - [ ] Notification log table

## 5. Security Implementation

### Access Control

- [ ] Implement role-based access
  - [ ] Admin access
  - [ ] Operator access
  - [ ] Public access
- [ ] Add authentication middleware
  - [ ] JWT validation
  - [ ] Wallet signature verification

### Data Protection

- [ ] Implement data encryption
  - [ ] File encryption
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

- [ ] **Push Certified Project Metadata to Stellar Blockchain**
- [ ] **Upload Stellar Metadata of Validated Projects**
- [ ] **Setup Google Storage or Encrypted File Storage for Project Files**

## 9. Authentication

- [ ] **Admin Authentication System for BackOffice**
- [ ] **Allow Users to Log In with Wallet to Access Their Certificates**

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

- [ ] Create API documentation
- [ ] Write setup instructions
- [ ] Create user guides
- [ ] Document security measures

## 12. Deployment

- [ ] Set up CI/CD pipeline
- [ ] Configure production environment
- [ ] Set up monitoring
- [ ] Configure backup system
