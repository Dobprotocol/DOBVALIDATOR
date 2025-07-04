# Soroban Contract Integration & Admin Workflow (Backoffice)

## Overview

This document describes how the DOB Validator backoffice integrates with the Soroban smart contract on Stellar testnet, and outlines the admin/validator workflow for submitting validated metadata on-chain.

---

## 1. Admin/Validator Workflow

1. **Admin logs in with a whitelisted Stellar wallet**

   - Wallet must be present in `backoffice/lib/admin-config.ts` (`ADMIN_WALLETS` array)
   - Only active wallets with appropriate permissions can sign and submit

2. **Admin reviews a device submission**

   - Submissions are fetched from the backend (API integration required)
   - Admin can approve or reject, and add notes/scores

3. **Admin clicks "Sign and Submit to Stellar"**

   - The app prompts for the admin's Stellar secret key (for demo/testing; in production, use wallet integration)
   - The contract call is made using the Soroban client
   - The transaction is signed and submitted to the Soroban contract

4. **Transaction status is displayed**
   - The UI shows the transaction hash and status (pending/confirmed)
   - Errors are shown if the contract call fails

---

## 2. Contract Call Pattern

- The contract call is implemented in `backoffice/lib/stellar-contract.ts`:

  - `submitValidationToSoroban({ adminSecret, adminPublic, metadata })`
  - Tries both `symbol` and `bytes` types for the deviceId
  - Handles transaction signing and submission
  - Returns transaction result/status

- The UI logic is in `backoffice/components/submission-review.tsx`:
  - Calls `stellarContractService.submitValidationToSoroban` on approval/rejection
  - Handles wallet authentication and feedback

---

## 3. Updating the Admin Wallet Whitelist

- Edit `backoffice/lib/admin-config.ts` and update the `ADMIN_WALLETS` array
- Add new admin/validator addresses as needed
- Restart the backoffice app after changes

---

## 4. Logging & Auditability

- All contract call attempts and results are logged to the browser console
- (Planned) Logs can be extended to file or external service for production auditability
- Errors and transaction hashes are shown in the UI for transparency

---

## 5. Environment & Config Requirements

- Ensure the Soroban contract address is correct in `stellar-contract.ts`
- All admin wallets must be whitelisted in `admin-config.ts`
- For production, use secure wallet integrations (not plain secret keys)
- Use environment variables for sensitive config in production

---

## 6. Gotchas & Requirements for Future Devs

- The contract interface (argument types) may change; always confirm with the SC dev
- Only whitelisted wallets can sign and submit
- Always test on testnet before mainnet deployment
- Keep contract call and admin workflow documentation up to date

---

**For questions or updates, contact joaquin@dobprotocol.com**
