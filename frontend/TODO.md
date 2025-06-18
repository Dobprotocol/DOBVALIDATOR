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
- [ ] Implement certificate generation logic
  - [ ] Add PDF generation
  - [ ] Add metadata embedding
  - [ ] Add digital signature system

### Certificate Views

- [x] Create public certificate view
  - [x] Add basic certificate display
  - [ ] Add verification system
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
  - [ ] Certificate generation endpoint
  - [ ] Email notification endpoint
- [ ] Implement authentication
  - [ ] Add JWT authentication
  - [ ] Add wallet-based authentication
  - [ ] Add role-based access control

### Database Schema

- [x] Design database schema
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

- [ ] Create profile creation page
  - [ ] Add form fields for name, company/project, and email
  - [ ] Add privacy notice about data encryption
  - [ ] Implement form validation
  - [ ] Add wallet connection requirement
- [ ] Implement profile data storage
  - [ ] Create backend API for profile data
  - [ ] Link profile data to wallet address
  - [ ] Implement data encryption for sensitive information
- [ ] Update user flow
  - [ ] Modify wallet connection to check for existing profile
  - [ ] Add profile creation step for new users
  - [ ] Redirect to devices dashboard after profile creation
- [ ] Create empty devices dashboard
  - [ ] Add "Create New Device" button
  - [ ] Show empty state for new users
  - [ ] Implement device submission form redirection
