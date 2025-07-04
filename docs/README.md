# DOB Protocol - Technical Documentation

## Overview

DOB Protocol is a blockchain-based DePIN x DeFi x DeFAI platform built on the Stellar network. This document provides comprehensive technical information about the architecture, components, and implementation details.

## Architecture

### System Components

1. **Frontend Application** (`frontend/`)
   - Next.js 14 application for user interface
   - React components with TypeScript
   - TailwindCSS for styling
   - Shadcn-UI component library

2. **Backoffice Application** (`backoffice/`)
   - Admin interface for project validation
   - Reviewer dashboard
   - Certificate generation system

3. **Backend API** (`backend/`)
   - Node.js server with Express
   - PostgreSQL database with Prisma ORM
   - JWT authentication
   - File upload handling

4. **Smart Contracts** (`shared/`)
   - Stellar Soroban smart contracts
   - DOB Validator contract
   - Certificate generation contracts

### Technology Stack

#### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Shadcn-UI
- **State Management**: React hooks
- **Wallet Integration**: Stellar SDK, Freighter

#### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with Stellar signatures
- **File Storage**: Local filesystem

#### Blockchain

- **Network**: Stellar Testnet
- **Smart Contracts**: Soroban
- **Wallet**: Freighter, Simple Stellar Signer
- **SDK**: Stellar SDK for JavaScript

## Project Structure

```
DOBVALIDATOR/
├── frontend/                 # User-facing application
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── lib/                 # Utility libraries
│   └── public/              # Static assets
├── backoffice/              # Admin interface
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   └── lib/                 # Utility libraries
├── backend/                 # API server
│   ├── src/                 # Source code
│   ├── prisma/              # Database schema
│   └── scripts/             # Utility scripts
├── shared/                  # Shared components
│   └── trufa-certificate-viewer/  # Certificate viewer
└── docs/                    # Documentation
```

## Key Features

### 1. Wallet Integration

- Freighter wallet connection
- Stellar signature authentication
- Multi-signature support
- Role-based access control

### 2. User Management

- Profile creation and management
- Role assignment (Investor/Operator)
- Document upload and storage
- Session management

### 3. Project Submission

- Multi-step submission form
- Document upload capability
- Financial metrics input
- Technical specifications

### 4. Validation System

- TRUFA scoring algorithm
- Automated validation checks
- Manual review process
- Certificate generation

### 5. Certificate System

- Digital certificate generation
- Blockchain verification
- PDF export capability
- QR code integration

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm package manager
- PostgreSQL database
- Stellar Testnet account

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd DOBVALIDATOR
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
cp backoffice/env.example backoffice/.env
```

4. Set up the database:

```bash
cd backend
pnpm prisma migrate dev
pnpm prisma generate
```

5. Start development servers:

```bash
# Terminal 1: Backend
cd backend && pnpm dev

# Terminal 2: Frontend
cd frontend && pnpm dev

# Terminal 3: Backoffice
cd backoffice && pnpm dev
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-jwt-secret"
STELLAR_NETWORK="testnet"
STELLAR_SECRET_KEY="your-stellar-secret"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_STELLAR_NETWORK="testnet"
```

### Backoffice (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_STELLAR_NETWORK="testnet"
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- `users` - User profiles and authentication
- `submissions` - Project submissions
- `drafts` - Draft submissions
- `deployment_logs` - System deployment tracking

See `backend/prisma/schema.prisma` for complete schema definition.

## API Endpoints

### Authentication

- `POST /api/auth/challenge` - Generate authentication challenge
- `POST /api/auth/verify` - Verify wallet signature
- `POST /api/auth/wallet-login` - Wallet-based login

### Submissions

- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Create submission
- `GET /api/submissions/[id]` - Get submission details

### Profile

- `GET /api/profile` - Get user profile
- `POST /api/profile` - Update profile
- `POST /api/profile/upload-image` - Upload profile image

## Security Considerations

1. **Authentication**
   - Stellar signature verification
   - JWT token management
   - Role-based access control

2. **Data Protection**
   - Encrypted file storage
   - Secure API endpoints
   - Input validation

3. **Smart Contract Security**
   - Multi-signature requirements
   - Access control mechanisms
   - Rate limiting

## Testing

### Unit Tests

```bash
cd backend && pnpm test
cd frontend && pnpm test
```

### Integration Tests

```bash
cd backend && pnpm test:integration
```

### End-to-End Tests

```bash
cd backend && pnpm test:e2e
```

## Deployment

See [Deployment Guide](DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

- [API Documentation](API.md)
- [Smart Contract Documentation](CONTRACTS.md)
- [Deployment Guide](DEPLOYMENT.md)
- [GitHub Issues](https://github.com/blessedux/DOBVALIDATOR/issues)

## License

This project is licensed under the MIT License.
