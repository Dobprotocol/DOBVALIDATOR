# Stellar Contract Integration Testing Guide

## 🎯 **Overview**

This guide covers testing the DOB Validator Stellar smart contract integration, including both mock and real testing approaches.

## 📋 **Test Types**

### **1. Mock Testing** (Safe, No Real Transactions)

- **Purpose**: Validate code logic and data structures
- **Command**: `npm run test:stellar:mock`
- **File**: `test-stellar-integration.js`
- **Risk Level**: None (completely safe)

### **2. Real Testing** (Live Testnet Transactions)

- **Purpose**: Test actual contract interactions
- **Command**: `npm run test:stellar:real`
- **File**: `test-stellar-contract-real.js`
- **Risk Level**: Low (testnet only)

## 🚀 **Quick Start**

### **Step 1: Install Dependencies**

```bash
cd frontend
npm install
```

### **Step 2: Run Mock Test (Recommended First)**

```bash
npm run test:stellar:mock
```

### **Step 3: Run Real Test (Optional)**

```bash
npm run test:stellar:real
```

## 🔧 **Real Testing Setup**

### **Prerequisites**

1. **Testnet Stellar Wallet** with XLM balance
2. **Contract Address**: `CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN`
3. **Network**: Stellar Testnet

### **Environment Variables**

```bash
# Optional: Set real test wallet (if not set, uses sample keys)
export ADMIN_SECRET_KEY="your_test_secret_key"
export ADMIN_PUBLIC_KEY="your_test_public_key"
```

### **Getting Testnet XLM**

1. Visit: https://laboratory.stellar.org/#account-creator
2. Create a test account
3. Fund with testnet XLM (free)

## 📊 **Test Coverage**

### **Mock Tests**

- ✅ Contract service initialization
- ✅ TRUFA metadata structure validation
- ✅ Transaction creation logic
- ✅ Admin wallet verification
- ✅ Error handling scenarios

### **Real Tests**

- ✅ Contract account verification
- ✅ Admin wallet balance check
- ✅ Metadata structure validation
- ✅ Transaction creation and signing
- ✅ Transaction submission to network
- ✅ Contract query operations

## 🧪 **Test Scenarios**

### **Scenario 1: Basic Integration**

```bash
npm run test:stellar:mock
```

**Expected Result**: All mock tests pass

### **Scenario 2: Contract Connection**

```bash
npm run test:stellar:real
```

**Expected Result**: Contract found and accessible

### **Scenario 3: Transaction Flow**

```bash
# With real test wallet configured
export ADMIN_SECRET_KEY="your_key"
npm run test:stellar:real
```

**Expected Result**: Transaction created, signed, and submitted

## 📈 **Test Results Interpretation**

### **Mock Test Results**

```
✅ Contract Service: Initialized successfully
✅ Metadata Structure: Valid TRUFA format
✅ Transaction Creation: XDR generated correctly
✅ Admin Verification: Permission check passed
✅ Error Handling: Graceful failure handling
```

### **Real Test Results**

```
🔗 Testing contract connection...
✅ Contract account found: CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN
   Balance: 100.0000000
   Sequence: 123456

💰 Testing admin wallet balance...
✅ Admin wallet found: GABC123...
   Balance: 50.0000000

📋 Testing TRUFA metadata structure...
✅ Metadata structure valid
   Device ID: TEST-DEVICE-001
   TRUFA Score: 85
   Status: APPROVED

🔧 Testing transaction creation...
✅ Transaction created successfully
   Hash: abc123def456...
   Operations: 1

✍️  Testing transaction signing...
✅ Transaction signed successfully
   Signatures: 1

📤 Testing transaction submission...
✅ Transaction submitted successfully
   Hash: abc123def456...
   Ledger: 123456
   Result: success
```

## ⚠️ **Common Issues & Solutions**

### **Issue 1: Contract Not Found**

```
❌ Contract connection failed: Account not found
```

**Solution**: Verify contract address is correct

### **Issue 2: Insufficient Balance**

```
❌ Transaction submission failed: INSUFFICIENT_BALANCE
```

**Solution**: Fund test wallet with more XLM

### **Issue 3: Invalid Signature**

```
❌ Transaction signing failed: Invalid secret key
```

**Solution**: Check ADMIN_SECRET_KEY format

### **Issue 4: Network Issues**

```
❌ Contract connection failed: Network timeout
```

**Solution**: Check internet connection and Horizon URL

## 🔍 **Debugging Tips**

### **Enable Debug Logging**

```bash
export LOG_LEVEL=debug
npm run test:stellar:real
```

### **Check Network Status**

```bash
curl https://horizon-testnet.stellar.org/health
```

### **Verify Contract**

```bash
curl https://horizon-testnet.stellar.org/accounts/CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN
```

## 📚 **Integration with Development**

### **Frontend Integration**

The test results validate that our `StellarContractService` works correctly:

```typescript
// This service is now tested and ready for production use
import { StellarContractService } from "./lib/stellar-contract";

const contractService = new StellarContractService();
await contractService.submitValidation(metadata);
```

### **Backoffice Integration**

The admin wallet authentication is validated:

```typescript
// Admin wallet verification is tested and working
import { AdminConfigService } from "./lib/admin-config";

const adminService = new AdminConfigService();
const isAdmin = await adminService.verifyAdminWallet(walletAddress);
```

## 🎯 **Next Steps After Testing**

1. **Database Integration**: Replace mock data with real database
2. **Real API Integration**: Connect frontend to actual backend
3. **End-to-End Testing**: Test complete user submission flow
4. **Production Deployment**: Move to mainnet when ready

## 📞 **Support**

If you encounter issues:

1. Check this guide for common solutions
2. Review test output for specific error messages
3. Verify network and wallet configuration
4. Test with mock version first to isolate issues
