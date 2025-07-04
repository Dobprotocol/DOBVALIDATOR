# DOB Protocol - Smart Contract Documentation

## Overview

DOB Protocol utilizes Stellar Soroban smart contracts to provide trustless validation, certificate generation, and investment management capabilities. This document provides comprehensive documentation for all smart contracts in the ecosystem.

## Contract Architecture

### Core Contracts

1. **DOB Validator Contract** - Main validation and scoring contract
2. **Certificate Generator** - Digital certificate creation and verification

## DOB Validator Contract

### Contract Address

- **Testnet**: `CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN`
- **Mainnet**: `TBD`

### Purpose

The DOB Validator contract is the core contract responsible for:

- Project validation and scoring
- TRUFA score calculation
- Multi-signature approval process
- Certificate issuance

### Key Functions

#### `initialize()`

Initialize the contract with admin addresses and configuration.

```rust
pub fn initialize(
    e: &mut Env,
    admin_addresses: Vec<Address>,
    min_signatures: u32,
    trufa_weights: TrufaWeights
) -> Result<(), Error>
```

**Parameters:**

- `admin_addresses`: List of admin wallet addresses
- `min_signatures`: Minimum required signatures for approval
- `trufa_weights`: Scoring weights for TRUFA algorithm

#### `submit_project(project_data: ProjectData)`

Submit a new project for validation.

```rust
pub fn submit_project(
    e: &mut Env,
    project_data: ProjectData
) -> Result<u32, Error>
```

**Parameters:**

- `project_data`: Project information and metadata

**Returns:**

- Project ID for tracking

#### `calculate_trufa_score(project_id: u32)`

Calculate TRUFA score for a project.

```rust
pub fn calculate_trufa_score(
    e: &mut Env,
    project_id: u32
) -> Result<TrufaScore, Error>
```

**Returns:**

- `TrufaScore` struct with technical, regulatory, and financial scores

#### `approve_project(project_id: u32, admin_signature: Signature)`

Approve a project with admin signature.

```rust
pub fn approve_project(
    e: &mut Env,
    project_id: u32,
    admin_signature: Signature
) -> Result<(), Error>
```

#### `reject_project(project_id: u32, reason: String, admin_signature: Signature)`

Reject a project with reason and admin signature.

```rust
pub fn reject_project(
    e: &mut Env,
    project_id: u32,
    reason: String,
    admin_signature: Signature
) -> Result<(), Error>
```

### Data Structures

#### `ProjectData`

```rust
pub struct ProjectData {
    pub title: String,
    pub description: String,
    pub operator_address: Address,
    pub technical_specs: String,
    pub financial_metrics: FinancialMetrics,
    pub documents_hash: String,
    pub submission_timestamp: u64,
}
```

#### `TrufaScore`

```rust
pub struct TrufaScore {
    pub technical_score: u32,    // 0-100
    pub regulatory_score: u32,   // 0-100
    pub financial_score: u32,    // 0-100
    pub overall_score: u32,      // 0-100
    pub calculated_at: u64,
}
```

#### `FinancialMetrics`

```rust
pub struct FinancialMetrics {
    pub total_investment: i128,
    pub expected_roi: u32,       // Percentage
    pub payback_period: u32,     // Months
    pub risk_level: u32,         // 1-5 scale
}
```

### TRUFA Scoring Algorithm

The TRUFA (Technical, Regulatory, and Financial Assessment) scoring algorithm:

```rust
pub fn calculate_overall_score(
    technical: u32,
    regulatory: u32,
    financial: u32,
    weights: &TrufaWeights
) -> u32 {
    let weighted_sum =
        (technical as u64 * weights.technical as u64) +
        (regulatory as u64 * weights.regulatory as u64) +
        (financial as u64 * weights.financial as u64);

    (weighted_sum / 100) as u32
}
```

**Default Weights:**

- Technical: 40%
- Regulatory: 30%
- Financial: 30%

### Events

#### `ProjectSubmitted`

```rust
pub struct ProjectSubmitted {
    pub project_id: u32,
    pub operator_address: Address,
    pub submission_timestamp: u64,
}
```

#### `ProjectApproved`

```rust
pub struct ProjectApproved {
    pub project_id: u32,
    pub trufa_score: TrufaScore,
    pub approved_by: Address,
    pub approval_timestamp: u64,
}
```

#### `ProjectRejected`

```rust
pub struct ProjectRejected {
    pub project_id: u32,
    pub reason: String,
    pub rejected_by: Address,
    pub rejection_timestamp: u64,
}
```

## Certificate Generator Contract

### Contract Address

- **Testnet**: `CXYZ9876543210ZYXWVU...`
- **Mainnet**: `TBD`

### Purpose

Generate and verify digital certificates for approved projects.

### Key Functions

#### `generate_certificate(project_id: u32, certificate_data: CertificateData)`

Generate a new certificate for an approved project.

```rust
pub fn generate_certificate(
    e: &mut Env,
    project_id: u32,
    certificate_data: CertificateData
) -> Result<String, Error>
```

**Returns:**

- Certificate hash for verification

#### `verify_certificate(certificate_hash: String)`

Verify the authenticity of a certificate.

```rust
pub fn verify_certificate(
    e: &mut Env,
    certificate_hash: String
) -> Result<CertificateInfo, Error>
```

#### `revoke_certificate(certificate_hash: String, reason: String)`

Revoke a certificate with reason.

```rust
pub fn revoke_certificate(
    e: &mut Env,
    certificate_hash: String,
    reason: String
) -> Result<(), Error>
```

### Data Structures

#### `CertificateData`

```rust
pub struct CertificateData {
    pub project_id: u32,
    pub operator_name: String,
    pub project_title: String,
    pub trufa_score: TrufaScore,
    pub valid_until: u64,
    pub certificate_type: CertificateType,
}
```

#### `CertificateInfo`

```rust
pub struct CertificateInfo {
    pub certificate_hash: String,
    pub project_id: u32,
    pub is_valid: bool,
    pub issued_at: u64,
    pub valid_until: u64,
    pub revoked_at: Option<u64>,
    pub revocation_reason: Option<String>,
}
```

## Investment Manager Contract

### Contract Address

- **Testnet**: `CINV1234567890INVEST...`
- **Mainnet**: `TBD`

### Purpose

Manage fractional investments in validated infrastructure projects.

### Key Functions

#### `create_investment_pool(project_id: u32, total_amount: i128, min_investment: i128)`

Create an investment pool for a validated project.

```rust
pub fn create_investment_pool(
    e: &mut Env,
    project_id: u32,
    total_amount: i128,
    min_investment: i128
) -> Result<u32, Error>
```

#### `invest(pool_id: u32, amount: i128)`

Invest in a project pool.

```rust
pub fn invest(
    e: &mut Env,
    pool_id: u32,
    amount: i128
) -> Result<InvestmentReceipt, Error>
```

#### `withdraw_investment(pool_id: u32, receipt_id: u32)`

Withdraw investment (if allowed by project terms).

```rust
pub fn withdraw_investment(
    e: &mut Env,
    pool_id: u32,
    receipt_id: u32
) -> Result<(), Error>
```

### Data Structures

#### `InvestmentPool`

```rust
pub struct InvestmentPool {
    pub pool_id: u32,
    pub project_id: u32,
    pub total_amount: i128,
    pub raised_amount: i128,
    pub min_investment: i128,
    pub max_investment: i128,
    pub status: PoolStatus,
    pub created_at: u64,
}
```

#### `InvestmentReceipt`

```rust
pub struct InvestmentReceipt {
    pub receipt_id: u32,
    pub pool_id: u32,
    pub investor_address: Address,
    pub amount: i128,
    pub shares: u32,
    pub invested_at: u64,
}
```

## Governance Contract

### Contract Address

- **Testnet**: `CGOV1234567890GOVERN...`
- **Mainnet**: `TBD`

### Purpose

Manage protocol governance, voting, and parameter updates.

### Key Functions

#### `propose_update(proposal: Proposal)`

Create a new governance proposal.

```rust
pub fn propose_update(
    e: &mut Env,
    proposal: Proposal
) -> Result<u32, Error>
```

#### `vote(proposal_id: u32, vote: Vote)`

Vote on a governance proposal.

```rust
pub fn vote(
    e: &mut Env,
    proposal_id: u32,
    vote: Vote
) -> Result<(), Error>
```

#### `execute_proposal(proposal_id: u32)`

Execute an approved proposal.

```rust
pub fn execute_proposal(
    e: &mut Env,
    proposal_id: u32
) -> Result<(), Error>
```

## Contract Deployment

### Prerequisites

- Stellar Testnet account with XLM
- Soroban CLI installed
- Contract source code compiled

### Deployment Steps

1. **Compile Contracts**

```bash
cd contracts
soroban contract build
```

2. **Deploy to Testnet**

```bash
soroban contract deploy \
  --network testnet \
  --source admin \
  target/wasm32-unknown-unknown/release/dob_validator.wasm
```

3. **Initialize Contract**

```bash
soroban contract invoke \
  --network testnet \
  --id <contract_id> \
  --source admin \
  -- initialize \
  --admin-addresses '["GABC123...", "GDEF456..."]' \
  --min-signatures 2 \
  --trufa-weights '{"technical": 40, "regulatory": 30, "financial": 30}'
```

### Environment Configuration

#### Testnet

```env
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_SECRET_KEY=your_testnet_secret_key
```

#### Mainnet

```env
STELLAR_NETWORK=public
STELLAR_RPC_URL=https://soroban.stellar.org
STELLAR_SECRET_KEY=your_mainnet_secret_key
```

## Contract Interaction Examples

### JavaScript/TypeScript

```typescript
import { SorobanRpc, Contract } from "soroban-client";

// Initialize client
const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org");
const contract = new Contract("CABC1234567890ABCDEF...");

// Submit project
const projectData = {
  title: "Solar Farm Project",
  description: "Large-scale solar farm",
  operator_address: "GABC123...",
  technical_specs: "Technical specifications...",
  financial_metrics: {
    total_investment: 1000000,
    expected_roi: 15,
    payback_period: 60,
    risk_level: 3,
  },
  documents_hash: "QmHash...",
  submission_timestamp: Date.now(),
};

const result = await contract.call("submit_project", projectData);
```

### Rust

```rust
use soroban_sdk::{Address, Env, String};

#[contract]
pub struct DobValidator;

#[contractimpl]
impl DobValidator {
    pub fn submit_project(
        e: &mut Env,
        project_data: ProjectData
    ) -> Result<u32, Error> {
        // Implementation
    }
}
```

## Security Considerations

### Access Control

- Multi-signature requirements for critical operations
- Role-based access control
- Admin address management

### Input Validation

- Parameter bounds checking
- Data type validation
- Malicious input prevention

### Error Handling

- Graceful error recovery
- Detailed error messages
- State consistency maintenance

### Audit Trail

- Event logging for all operations
- Immutable transaction history
- Transparent governance

## Testing

### Unit Tests

```bash
cd contracts
cargo test
```

### Integration Tests

```bash
cargo test --test integration_tests
```

### Testnet Testing

```bash
# Deploy to testnet
soroban contract deploy --network testnet target/...

# Run test scenarios
npm run test:contracts
```

## Monitoring and Analytics

### Contract Events

Monitor contract events for:

- Project submissions
- Approval/rejection decisions
- Investment activities
- Governance proposals

### Performance Metrics

- Transaction throughput
- Gas usage optimization
- Contract call frequency
- Error rates

### Health Checks

- Contract availability
- RPC endpoint status
- Network connectivity
- Balance monitoring

## Upgrade Strategy

### Contract Upgrades

1. **Proxy Pattern**: Use upgradeable proxy contracts
2. **Migration Scripts**: Automated data migration
3. **Backward Compatibility**: Maintain API compatibility
4. **Governance Approval**: Require governance approval for upgrades

### Version Management

- Semantic versioning for contracts
- Migration documentation
- Rollback procedures
- Testing in staging environment

## Support and Resources

### Documentation

- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Documentation](https://developers.stellar.org/docs)
- [Contract Examples](https://github.com/stellar/soroban-examples)

### Community

- [Stellar Discord](https://discord.gg/stellarlabs)
- [GitHub Issues](https://github.com/blessedux/DOBVALIDATOR/issues)
- [Developer Forum](https://stellar.org/developers/community)

### Tools

- [Soroban CLI](https://github.com/stellar/soroban-cli)
- [Stellar Laboratory](https://laboratory.stellar.org)
- [Stellar Expert](https://stellar.expert)

## License

Smart contracts are licensed under the MIT License.
