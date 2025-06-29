# TRUFA Certificate Viewer

A reusable component for displaying TRUFA certification badges and details for validated DOB Protocol projects.

## Overview

The TRUFA Certificate Viewer is a React component that displays certification information for infrastructure operators who have successfully validated their projects through the DOB Protocol Validator. This component can be embedded in various contexts:

- Email notifications
- DOB Protocol Pool Marketplace
- Project dashboards
- Public verification pages

## Features

- Displays TRUFA certification badge
- Shows project validation details
- Includes verification status
- Displays certification date and validity
- QR code for verification
- Blockchain transaction reference
- Responsive design for all devices

## Usage

```tsx
import { TrufaCertificateViewer } from '@dob/shared/trufa-certificate-viewer';

// Basic usage
<TrufaCertificateViewer
  projectId="123"
  certificateId="cert_xyz"
  mode="full" // or "compact" for email
/>

// With custom styling
<TrufaCertificateViewer
  projectId="123"
  certificateId="cert_xyz"
  theme="dark"
  className="custom-class"
/>
```

## Props

| Prop          | Type                | Description                                |
| ------------- | ------------------- | ------------------------------------------ |
| projectId     | string              | Unique identifier of the validated project |
| certificateId | string              | Unique identifier of the TRUFA certificate |
| mode          | 'full' \| 'compact' | Display mode of the certificate            |
| theme         | 'light' \| 'dark'   | Visual theme of the certificate            |
| className     | string              | Additional CSS classes                     |

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
cd shared/trufa-certificate-viewer
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

## Integration

The component is designed to be easily integrated into:

1. Email templates
2. Web applications
3. Mobile applications
4. PDF exports

## Security

- All certificate data is verified against the blockchain
- QR codes contain signed verification URLs
- Certificate data is immutable once issued

## License

Copyright (c) 2025 DOB Protocol. All rights reserved.
