# DOB Validator Authentication System Documentation

## Overview

The DOB Validator system uses Stellar wallet-based authentication with a challenge-response mechanism. We use **Simple Signer** for wallet integration, which **only supports transaction signing** (no message signing support).

## ⚠️ Important: Simple Signer Limitations

### **Simple Signer is Transaction-Only**

Simple Signer (`https://sign.bigger.systems`) **does not support message signing**. It only supports:

- ✅ **Transaction signing** (`/sign` endpoint)
- ✅ **Wallet connection** (`/connect` endpoint)
- ✅ **Payment operations** (`/payment` endpoint)
- ❌ **Message signing** - Not supported

### **Why This Matters**

Many Stellar dApps use message signing for fee-free authentication, but Simple Signer cannot do this. Therefore, we must use transaction signing, which requires a small fee (0.00001 XLM).

## Authentication Approach: Transaction Signing (Required by Simple Signer)

### Why Transaction Signing?

**Transaction signing is the ONLY option when using Simple Signer** because:

1. **Simple Signer Limitation**: Simple Signer only supports transaction signing, not message signing
2. **No Alternative**: Cannot use message signing for fee-free authentication
3. **Minimal Cost**: Using manageData operations with minimal fees (0.00001 XLM)
4. **Universal Support**: All Stellar wallets support transaction signing
5. **Secure**: Transaction stored on blockchain provides cryptographic proof

### Transaction Structure

We create a minimal transaction that:

- Uses `manageData` operation (minimal fee impact)
- Stores challenge in transaction data
- Has a 30-second timeout (won't execute if not submitted)
- Uses the minimum fee (0.00001 XLM)

### Alternative Approaches (Not Available with Simple Signer)

**Message signing would be preferred but is not supported:**

- ❌ **Message Signing**: Not supported by Simple Signer
- ❌ **Fee-Free Authentication**: Cannot be achieved with Simple Signer

### Security Comparison

| Aspect                    | Transaction Signing (Our Approach) | Message Signing (Not Available) |
| ------------------------- | ---------------------------------- | ------------------------------- |
| **Fee Required**          | ✅ Yes (0.00001 XLM)               | ❌ No                           |
| **Blockchain Record**     | ✅ Yes                             | ❌ No                           |
| **Verification Speed**    | ❌ Slow (confirmation)             | ✅ Fast                         |
| **User Experience**       | ⚠️ Good (minimal fee)              | ✅ Excellent                    |
| **Security Level**        | ✅ Very High                       | ✅ High                         |
| **Simple Signer Support** | ✅ Full                            | ❌ Not Supported                |

## Authentication Flow

### 1. Wallet Connection

- User clicks "Connect Wallet" button
- Opens Simple Signer window (`https://sign.bigger.systems/connect`)
- User selects their Stellar wallet (Freighter, xBull, Albedo)
- Wallet returns public key and wallet type

### 2. Challenge Generation

- Frontend requests authentication challenge from `/api/auth/challenge`
- Backend generates unique challenge and stores it with wallet address
- Challenge format: `DOB_VALIDATOR_AUTH_{timestamp}_{randomId}`

### 3. Transaction Creation

- Frontend creates minimal Stellar transaction with manageData operation
- Challenge is stored in transaction data (truncated to 28 bytes)
- Transaction has 30-second timeout and minimal fee
- Opens Simple Signer window for transaction signing

### 4. Transaction Signing

- User signs the transaction with their wallet
- **Transaction requires 0.00001 XLM fee** (Simple Signer requirement)
- Returns signed XDR transaction

### 5. Signature Verification

- Frontend sends signed XDR to `/api/auth/verify`
- Backend verifies:
  - Challenge exists and is not expired (5 minutes)
  - Challenge matches the stored challenge
  - Transaction signature is valid
  - Wallet address matches transaction source
- Returns JWT token on success

### 6. Session Management

- JWT token stored in localStorage
- Token expires in 7 days
- Used for authenticated API requests

## API Endpoints

### POST /api/auth/challenge

**Request:**

```json
{
  "walletAddress": "GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN"
}
```

**Response:**

```json
{
  "challenge": "DOB_VALIDATOR_AUTH_1750389022793_9vnp73ttds"
}
```

### POST /api/auth/verify

**Request:**

```json
{
  "walletAddress": "GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN",
  "signature": "AAAAAgAAAAAAAAAAAAAA...",
  "challenge": "DOB_VALIDATOR_AUTH_1750389022793_9vnp73ttds"
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt_token_here",
  "expiresIn": "7d",
  "message": "Authentication successful"
}
```

## Frontend Components

### StellarWallet Component

- Handles wallet connection via Simple Signer
- Manages authentication flow
- Stores wallet state globally
- Handles profile creation flow

### Authentication Utilities

- `auth.ts`: JWT token management and API calls
- `wallet-state.ts`: Global wallet state management
- `auth-storage.ts`: Challenge and session storage

## Backend Integration

### Challenge Storage

Currently using in-memory storage. For production, implement:

- Redis for distributed systems
- Database table for challenges
- Automatic cleanup of expired challenges

### Session Storage

Currently using in-memory storage. For production, implement:

- Database table for sessions
- JWT blacklisting for logout
- Session cleanup on expiration

### Transaction Verification

Currently verifying transaction structure. For production:

- Implement full Ed25519 signature verification
- Verify transaction hash and signature
- Use Stellar SDK for cryptographic operations

## Security Considerations

### Challenge Security

- Challenges expire after 5 minutes
- Each challenge can only be used once
- Challenges are tied to specific wallet addresses

### Transaction Security

- Transactions have 30-second timeout
- Minimal fee prevents abuse
- Transaction data contains challenge for verification

### JWT Security

- Use strong JWT secret in production
- Implement JWT refresh mechanism
- Add rate limiting for authentication endpoints

### Wallet Verification

- Verify wallet address format (Stellar public key)
- Verify transaction source matches wallet address
- Add replay attack protection

## Production Checklist

### Backend

- [ ] Replace in-memory storage with Redis/database
- [ ] Implement full cryptographic signature verification
- [ ] Add rate limiting to auth endpoints
- [ ] Use environment variables for secrets
- [ ] Add comprehensive logging
- [ ] Implement JWT refresh mechanism

### Frontend

- [ ] Add error handling for network failures
- [ ] Implement retry logic for failed requests
- [ ] Add loading states for better UX
- [ ] Handle wallet connection failures gracefully
- [ ] Add session timeout handling

### Infrastructure

- [ ] Set up HTTPS in production
- [ ] Configure CORS properly
- [ ] Add monitoring and alerting
- [ ] Implement backup and recovery procedures

## Testing

### Manual Testing

1. Connect wallet with Freighter
2. Connect wallet with xBull
3. Connect wallet with Albedo
4. Test authentication with insufficient funds
5. Test authentication with expired challenge
6. Test logout and session cleanup

### Automated Testing

- Unit tests for challenge generation
- Unit tests for transaction verification
- Integration tests for authentication flow
- E2E tests for complete user journey

## Troubleshooting

### Common Issues

**"XDR wasn't provided" error**

- Solution: Ensure transaction is properly created and sent to Simple Signer

**"Insufficient funds" error**

- **Solution: User needs at least 0.00001 XLM for transaction fee**
- **Note: This is a Simple Signer requirement - cannot be avoided**

**"Challenge expired" error**

- Solution: Challenges expire after 5 minutes, request new challenge

**"Invalid signature" error**

- Solution: Verify wallet is properly connected and transaction is valid

### Debug Commands

```javascript
// Clear all authentication data
window.clearAllLocalStorage();

// Check current wallet state
console.log(localStorage.getItem("stellarPublicKey"));
console.log(localStorage.getItem("authToken"));
```

## Integration with Backend

### Database Schema

```sql
-- Challenges table
CREATE TABLE challenges (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(56) NOT NULL,
  challenge VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

-- Sessions table
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(56) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);
```

### Environment Variables

```bash
JWT_SECRET=your-super-secret-jwt-key
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost:5432/dobvalidator
```

## Simple Signer Integration Notes

### Why Simple Signer?

- **Popular**: Widely used in Stellar ecosystem
- **Well-maintained**: Active development and community support
- **Multi-wallet**: Supports Freighter, xBull, Albedo, and more
- **Secure**: Trusted by many Stellar dApps

### Limitations to Be Aware Of

- **Transaction-only**: No message signing support
- **Fee requirement**: Users must have XLM for authentication
- **Network dependency**: Requires blockchain confirmation
- **Slower UX**: Transaction signing takes longer than message signing

### Alternative Solutions (Future Consideration)

If fee-free authentication becomes critical, consider:

1. **Custom wallet integration** (build our own connector)
2. **Multiple authentication methods** (transaction + message signing)
3. **Fee sponsorship** (cover user fees programmatically)

This authentication system provides secure, minimal-cost wallet authentication for the DOB Validator platform using Simple Signer. While transaction signing requires a small fee, it provides the best security and compatibility with the chosen wallet integration solution.
