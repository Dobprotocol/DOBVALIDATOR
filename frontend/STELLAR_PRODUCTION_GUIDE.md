# Stellar Smart Contract Production Deployment Guide

## 🎯 **Overview**

This guide covers deploying the DOB Validator Stellar smart contract integration to production, including environment configuration, wallet integration, and transaction signing.

## 🚀 **Production Checklist**

### **1. Environment Configuration**

#### **Required Environment Variables**

```bash
# Network Configuration
NEXT_PUBLIC_STELLAR_NETWORK=public
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon.stellar.org
CONTRACT_ADDRESS=YOUR_PRODUCTION_CONTRACT_ADDRESS

# Application URLs
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.com
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
NEXT_PUBLIC_BACKOFFICE_URL=https://your-backoffice-domain.com
```

#### **Environment Validation**

The application validates environment variables at build time. Ensure all required variables are set:

```bash
# Test environment configuration
npm run build
```

### **2. Smart Contract Deployment**

#### **Contract Requirements**

- **Contract Address**: Deploy your smart contract to Stellar mainnet
- **Admin Wallets**: Configure authorized admin wallets in the contract
- **Permissions**: Ensure proper access control for validation operations

#### **Contract Verification**

```bash
# Verify contract is accessible
curl https://horizon.stellar.org/accounts/YOUR_CONTRACT_ADDRESS
```

### **3. Wallet Integration**

#### **Supported Wallets**

- ✅ **Freighter** - Most popular Stellar wallet
- ✅ **xBull** - Alternative Stellar wallet
- ✅ **Albedo** - Web-based Stellar wallet

#### **Wallet Requirements**

- Users must have XLM for transaction fees (minimum 0.00001 XLM)
- Wallet must support transaction signing
- Wallet must be connected to mainnet

### **4. Transaction Flow**

#### **Authentication Flow**

1. **Challenge Generation**: Backend creates unique challenge
2. **Transaction Creation**: Frontend creates Stellar transaction with challenge
3. **Wallet Signing**: User signs transaction with their wallet
4. **Verification**: Backend verifies signature and issues JWT token

#### **Validation Flow**

1. **Metadata Creation**: Create TRUFA validation metadata
2. **Transaction Building**: Build Stellar transaction with metadata
3. **Admin Signing**: Admin wallet signs the transaction
4. **Network Submission**: Submit signed transaction to Stellar network
5. **Confirmation**: Wait for transaction confirmation

### **5. Security Considerations**

#### **Authentication Security**

- ✅ Challenge expiration (5 minutes)
- ✅ One-time use challenges
- ✅ Wallet address verification
- ✅ Transaction signature verification

#### **Transaction Security**

- ✅ Admin wallet verification
- ✅ Transaction timeout (30 seconds)
- ✅ Proper fee calculation
- ✅ Network validation

#### **Data Security**

- ✅ Metadata hashing
- ✅ Secure JWT tokens
- ✅ HTTPS enforcement
- ✅ CORS configuration

### **6. Monitoring & Analytics**

#### **Transaction Monitoring**

```typescript
// Monitor transaction status
const status =
  await stellarContractService.getTransactionStatus(transactionHash);
console.log("Transaction status:", status);
```

#### **Contract Statistics**

```typescript
// Get contract statistics
const stats = await stellarContractService.getContractStats();
console.log("Contract stats:", stats);
```

#### **Error Handling**

- Network connection failures
- Insufficient balance errors
- Invalid signature errors
- Transaction timeout errors

### **7. Testing in Production**

#### **Test Scenarios**

1. **Wallet Connection**

   ```bash
   # Test with Freighter wallet
   # Test with xBull wallet
   # Test with Albedo wallet
   ```

2. **Authentication Flow**

   ```bash
   # Test challenge generation
   # Test transaction signing
   # Test JWT token issuance
   ```

3. **Validation Submission**
   ```bash
   # Test metadata creation
   # Test transaction building
   # Test network submission
   # Test confirmation
   ```

#### **Explorer Verification**

- Verify transactions on Stellar Expert
- Check transaction metadata
- Validate contract interactions

### **8. Deployment Steps**

#### **Step 1: Environment Setup**

```bash
# Copy environment template
cp env.example .env.local

# Configure production values
NEXT_PUBLIC_STELLAR_NETWORK=public
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon.stellar.org
CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
```

#### **Step 2: Build & Deploy**

```bash
# Build for production
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, etc.)
```

#### **Step 3: Verify Deployment**

```bash
# Test frontend deployment
curl https://your-frontend-domain.com/health

# Test backend deployment
curl https://your-backend-domain.com/health

# Test Stellar connection
curl https://horizon.stellar.org/health
```

### **9. Troubleshooting**

#### **Common Issues**

**"Network connection failed"**

- Check Horizon URL configuration
- Verify network connectivity
- Check firewall settings

**"Insufficient balance"**

- User needs XLM for transaction fees
- Minimum 0.00001 XLM required
- Cannot be avoided (Simple Signer requirement)

**"Invalid signature"**

- Verify wallet is properly connected
- Check transaction format
- Ensure correct network configuration

**"Contract not found"**

- Verify contract address
- Check contract deployment
- Ensure contract is accessible

#### **Debug Commands**

```bash
# Check environment variables
echo $NEXT_PUBLIC_STELLAR_NETWORK
echo $NEXT_PUBLIC_STELLAR_HORIZON_URL

# Test Stellar connection
curl https://horizon.stellar.org/health

# Check contract status
curl https://horizon.stellar.org/accounts/YOUR_CONTRACT_ADDRESS
```

### **10. Performance Optimization**

#### **Transaction Optimization**

- Use appropriate fee levels
- Optimize transaction size
- Implement retry logic
- Cache account sequences

#### **User Experience**

- Show loading states
- Provide clear error messages
- Implement progress indicators
- Add transaction confirmation

### **11. Backup & Recovery**

#### **Data Backup**

- Backup contract metadata
- Backup user authentication data
- Backup transaction history
- Backup configuration files

#### **Recovery Procedures**

- Contract redeployment
- Data restoration
- Configuration recovery
- User re-authentication

### **12. Maintenance**

#### **Regular Tasks**

- Monitor transaction success rates
- Update admin wallet list
- Review security configurations
- Update dependencies

#### **Updates**

- Stellar SDK updates
- Contract upgrades
- Security patches
- Feature enhancements

## 📞 **Support**

For production issues:

1. Check this guide for common solutions
2. Review application logs
3. Verify network configuration
4. Test with known working wallets
5. Contact development team

## 🔗 **Resources**

- [Stellar Documentation](https://developers.stellar.org/)
- [Stellar Expert Explorer](https://stellar.expert/)
- [Simple Signer Documentation](https://sign.bigger.systems/)
- [Freighter Wallet](https://www.freighter.app/)
- [xBull Wallet](https://xbull.app/)
- [Albedo Wallet](https://albedo.link/)
