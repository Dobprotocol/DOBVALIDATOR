# DOB Validator

A monorepo containing the DOB Protocol Validator system, including the public-facing validator interface, admin backoffice, and shared backend services.

## Overview
DOB Validator is the official project validation portal of the DOB Protocol, designed to assess and certify DePIN projects through the TRUFA standard (Trustless Revenue Utility & Flow Automation). It enables infrastructure operators to submit documentation and metadata for review, aiming to tokenize their devices and qualify for inclusion in verified revenue pools.

On the other side, the BackOffice CMS is an internal tool used by the DOB team to manage, review, and score incoming submissions. Admins can track submission statuses, leave comments, assign TRUFA scores, and push certified metadata to the Stellar blockchain.

## Project Structure

```
dob-validator/
├── frontend/        # Public-facing Validator
├── backoffice/      # Admin CMS interface
├── backend/         # Shared API, auth, database logic
├── shared/          # Shared types, components, utils
├── prisma/          # Database schema and migrations
├── docker/          # Docker configurations
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/dob-validator.git
cd dob-validator
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development servers:
```bash
pnpm dev
```

## Development

- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all packages and applications
- `pnpm start` - Start all services in production mode
- `pnpm lint` - Run linting
- `pnpm format` - Format code with Prettier

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

[Your License]

## Overview

The DOB Validator is a crucial first step in Device Onboarding for DOB PROTOCOL. Its designed to automate and standardize the process of validating devices for funding consideration. This tool serves as the gateway for projects seeking funding through the DOB Protocol, ensuring that all necessary device information and documentation is properly collected and verified.

## Problem Statement

Traditional device funding processes often suffer from:

- Inconsistent data collection
- Manual verification bottlenecks
- Lack of standardization in documentation
- Time-consuming onboarding procedures
- Risk of incomplete or inaccurate information

The DOB Validator addresses these challenges by providing a structured, automated approach to device validation.

## Current State (POC)

The current proof of concept implements a comprehensive device verification flow with the following features:

### 1. Multi-step Verification Process

- Basic Device Information
- Technical Specifications
- Financial Details
- Documentation Upload
- Final Review

### 2. Data Collection

- Device identification (name, type, serial number)
- Manufacturer details
- Technical specifications
- Financial metrics
- Required documentation

### 3. Technology Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components
- Modern form handling with React Hook Form

## Future Direction

### Short-term Goals

1. **AI-Powered Validation**

   - Implement automated document verification
   - Add device specification validation
   - Integrate with manufacturers database

2. **Enhanced Security**

   - Add blockchain-based document verification
   - Implement secure file storage

3. **Integration Capabilities**
   - Connect with DOB Protocol smart contracts
   - Add API endpoints for external systems
   - Implement webhook support

### Long-term Vision

1. **Automated Due Diligence**

   - AI-driven risk assessment
   - Automated compliance checking
   - Real-time market value validation

2. **Smart Contract Integration**

   - Direct integration with funding mechanisms
   - Automated tokenization process
   - Smart contract-based verification

3. **Ecosystem Expansion**
   - Support for multiple device types
   - Integration with IoT devices
   - Real-time monitoring capabilities

## Importance in DOB Protocol

The DOB Validator serves as the critical first step in the device funding process by:

1. Ensuring data quality and completeness
2. Reducing manual verification time
3. Standardizing the onboarding process
4. Providing a foundation for automated funding decisions
5. Creating a trusted source of device information
