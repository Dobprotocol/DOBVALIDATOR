# DOB Protocol - Stellar Kickstart Program

## Project Overview

DOB Protocol is a blockchain-based DePIN x DeFi x DeFAI platform that bridges the gap between retail investors and infrastructure operators. Built on the Stellar network, it enables secure, transparent, and fractional investments in real-world infrastructure projects.

### Core Goals

- Enable fractional investments in infrastructure projects through Stellar's blockchain
- Ensure transparency and security via smart contract validation
- Provide real-time tracking of investments and project status
- Create a trustless validation mechanism for infrastructure projects

## Deliverables and Progress

### Deliverable 1: Wallet Integration & Authentication 👍👍

#### 1.1 Freighter Wallet Integration

**Description:** Implementation of Stellar wallet connectivity using Freighter and Simple Stellar Signer.

**Reviewer Instructions:** Check implementation in:

- [stellar-wallet.tsx](frontend/components/stellar-wallet.tsx) - Frontend wallet integration
- [stellar-wallet.tsx](backoffice/components/stellar-wallet.tsx) - Backoffice wallet integration
- [stellar-sdk.ts](frontend/lib/stellar-sdk.ts) - Stellar SDK configuration
- [wallet-state.ts](frontend/lib/wallet-state.ts) - Wallet state management
- [useWallet.ts](frontend/hooks/useWallet.ts) - Wallet hook implementation

**Results:**

1. Secure wallet connection using Freighter ✓
2. Transaction signing with Simple Stellar Signer ✓
3. Wallet state management and persistence ✓
4. Admin role validation through wallet signatures ✓

#### 1.2 Authentication Flow

**Description:** Implementation of a secure authentication flow using Stellar signatures.

**Reviewer Instructions:** Check implementation in:

- [auth.ts](frontend/lib/auth.ts) - Frontend authentication utilities
- [auth.ts](backoffice/lib/auth.ts) - Backoffice authentication utilities
- [auth-storage.ts](frontend/lib/auth-storage.ts) - Authentication storage management
- [auth-guard.tsx](frontend/components/auth-guard.tsx) - Authentication guard component
- [challenge/route.ts](frontend/app/api/auth/challenge/route.ts) - Challenge generation endpoint
- [verify/route.ts](frontend/app/api/auth/verify/route.ts) - Signature verification endpoint
- [wallet-login/route.ts](frontend/app/api/auth/wallet-login/route.ts) - Wallet login endpoint

**Key Features:**

- Challenge-response authentication
- JWT token management
- Role-based access control
- Signature verification

### Deliverable 2: Profile Creation & Management 👍👍

#### 2.1 User Profiles

**Description:** Implementation of user profile creation and management system.

**Reviewer Instructions:** Check implementation in:

- [profile/page.tsx](frontend/app/profile/page.tsx) - Profile management page
- [profile/route.ts](frontend/app/api/profile/route.ts) - Profile API endpoints
- [upload-image/route.ts](frontend/app/api/profile/upload-image/route.ts) - Profile image upload
- [profile/route.ts](backoffice/app/api/auth/profile/route.ts) - Backoffice profile management

**Key Features:**

- Basic user registration
- Profile information management
- Wallet address association
- Role assignment (Investor/Operator)

#### 2.2 Operator Profiles

**Description:** Extended profile system for infrastructure operators.

**Reviewer Instructions:** Check implementation in:

- [device-verification-flow.tsx](frontend/components/device-verification-flow.tsx) - Enhanced device verification flow
- [enhanced-device-verification-flow.tsx](frontend/components/enhanced-device-verification-flow.tsx) - Advanced device verification
- [device-basic-info.tsx](frontend/components/steps/device-basic-info.tsx) - Basic device information form
- [device-technical-info.tsx](frontend/components/steps/device-technical-info.tsx) - Technical specifications form
- [device-financial-info.tsx](frontend/components/steps/device-financial-info.tsx) - Financial metrics form
- [device-documentation.tsx](frontend/components/steps/device-documentation.tsx) - Documentation upload form

**Key Features:**

- Company information
- Track record documentation
- Financial metrics
- Project history

### Deliverable 3: Project Submission & Validation 👍👍

#### 3.1 Project Submission Form

**Description:** Implementation of the project submission interface for operators.

**Reviewer Instructions:** Check implementation in:

- [form/page.tsx](frontend/app/form/page.tsx) - Main submission form page
- [form/review/page.tsx](frontend/app/form/review/page.tsx) - Submission review page
- [submissions/route.ts](frontend/app/api/submissions/route.ts) - Submission API endpoints
- [submission-storage.ts](frontend/lib/submission-storage.ts) - Submission data management
- [device-review.tsx](frontend/components/steps/device-review.tsx) - Final review step
- [device-success.tsx](frontend/components/steps/device-success.tsx) - Success confirmation

**Key Features:**

- Multi-step submission process
- Document upload capability
- Financial metrics input
- Technical specifications

#### 3.2 Validation Smart Contract

**Description:** Implementation of the DOB Validator smart contract on Stellar.

**Reviewer Instructions:** Check implementation in:

- [stellar-contract.ts](backoffice/lib/stellar-contract.ts) - Smart contract integration
- [CONTRACTS.md](docs/CONTRACTS.md) - Smart contract documentation
- [CONTRACT_WORKFLOW.md](docs/CONTRACT_WORKFLOW.md) - Contract workflow documentation

**Key Features:**

- Automated validation checks
- Score calculation
- Multi-signature approval process
- On-chain validation record

### Deliverable 4: 🔍 Validation Mechanism 👍👍

#### 4.1 TRUFA Score Implementation

**Description:** Implementation of the Technical, Regulatory, and Financial Assessment scoring system.

**Reviewer Instructions:** Check implementation in:

- [submission-review.tsx](backoffice/components/submission-review.tsx) - TRUFA scoring interface
- [submissions-list.tsx](backoffice/components/submissions-list.tsx) - Submissions management
- [submission-review/page.tsx](backoffice/app/submission-review/page.tsx) - Review dashboard
- [submission-review/layout.tsx](backoffice/app/submission-review/layout.tsx) - Review layout
- [submissions/route.ts](backoffice/app/api/submissions/route.ts) - Backoffice submission API

**Key Features:**

- Technical score calculation
- Regulatory compliance check
- Financial viability assessment
- Overall TRUFA score computation

#### 4.2 Validation Dashboard

**Description:** Implementation of the validation dashboard for reviewers.

**Reviewer Instructions:** Check implementation in:

- [backoffice-dashboard.tsx](backoffice/components/backoffice-dashboard.tsx) - Main dashboard component
- [dashboard/page.tsx](backoffice/app/dashboard/page.tsx) - Dashboard page
- [admin-reviews/route.ts](backoffice/app/api/admin-reviews/route.ts) - Admin review endpoints
- [admin-reviews/[submissionId]/route.ts](backoffice/app/api/admin-reviews/[submissionId]/route.ts) - Individual review endpoints
- [certificate-modal.tsx](frontend/components/ui/certificate-modal.tsx) - Certificate generation modal
- [rejection-review-modal.tsx](frontend/components/ui/rejection-review-modal.tsx) - Rejection review modal

**Key Features:**

- Project review interface
- Score assignment
- Document verification
- Decision recording
- Certificate generation

**Smart Contract Implementation:**

- [DOB Validator Contract](docs/CONTRACTS.md#dob-validator-contract) - Core validation and scoring contract
- [Contract Address](backoffice/lib/stellar-contract.ts) - Testnet: [`CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN`](https://stellar.expert/explorer/testnet/contract/CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN)

## Testing Process

### 1. Unit Testing

- Smart contract function testing
- Component-level tests
- Authentication flow testing
- Form validation testing

### 2. Integration Testing

- Wallet connection flow
- Project submission process
- Validation workflow
- Certificate generation

### 3. End-to-End Testing

- Complete user journeys
- Cross-browser testing
- Mobile responsiveness
- Error handling

**Testing Documentation:**

- [Backend Testing Suite](backend/TESTING_SUITE.md) - Comprehensive testing documentation
- [API Testing Collection](frontend/DOB_Validator_API.postman_collection.json) - Postman collection for API testing
- [Authentication Documentation](frontend/AUTHENTICATION_DOCUMENTATION.md) - Detailed auth flow testing
- [Test Scripts](backend/scripts/) - Automated test scripts for complete workflow validation

## Technical Stack

### Frontend

- Next.js 14
- React
- TailwindCSS
- Shadcn-UI Components

### Backend

- Node.js
  -PostgreSQL
- Stellar SDK
- JWT Authentication

### Blockchain

- Stellar Network
- Soroban Smart Contracts
- Simple Stellar Signer

## Security Measures

1. **Smart Contract Security**
   - Audit-ready code
   - Multi-signature requirements
   - Rate limiting
   - Access control

2. **Data Security**
   - Encrypted storage
   - Secure file handling
   - Protected API endpoints
   - HTTPS enforcement

3. **User Security**
   - Wallet signature verification
   - JWT token management
   - Role-based access
   - Session management

## Deployment

The application is deployed across multiple environments:

1. **Development**
   - Testnet integration
   - Development API endpoints
   - Test data

2. **Staging**
   - Testnet integration
   - Production-like environment
   - Staging data

3. **Production**
   - Testnet integration
   - Production API endpoints
   - Live data

## Documentation

- [Technical Documentation](docs/README.md)
- [API Documentation](docs/API.md)
- [Smart Contract Documentation](docs/CONTRACTS.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## Community and Support

- [Twitter](https://twitter.com/dobprotocol)
- [Documentation](https://wiki.dobprotocol.com)
- [GitHub Repository](https://github.com/blessedux/DOBVALIDATOR)
