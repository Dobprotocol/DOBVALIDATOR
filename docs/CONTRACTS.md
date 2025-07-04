# DOB Protocol - Smart Contract Documentation

## Overview

DOB Protocol utilizes Stellar Soroban smart contracts to provide trustless project validation and status management. This document provides comprehensive documentation for the DOB Validator smart contract.

## Contract Architecture

### Core Contract

**DOB Validator Contract** - Main project validation and status management contract

## DOB Validator Contract

### Contract Information

- **Contract Address**: `CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN`
- **Network**: Stellar Testnet
- **WASM Hash**: `cd45e70c30a0676f7eda6b817e6aa4949570b9ee0053e029649bb0d77e2d32a8`
- **Soroban Version**: 1.87.0
- **SDK Version**: 22.0.8

### Purpose

The DOB Validator contract is responsible for:

- Project status management (Pending, Approved, Rejected)
- Whitelist management for authorized addresses
- Project hash storage and retrieval
- Admin role management

### Data Structures

#### `ProjectData`

```rust
pub struct ProjectData {
    pub hash: [u8; 32],        // 32-byte project hash
    pub status: ProjectStatusEnum
}
```

#### `ProjectStatusEnum`

```rust
pub enum ProjectStatusEnum {
    NotSet,     // Initial state
    Pending,    // Submitted for review
    Approved,   // Approved by admin
    Rejected    // Rejected by admin
}
```

#### `DataKey`

```rust
pub enum DataKey {
    Admin,                      // Admin address
    Whitelist(Address),         // Whitelisted address
    ProjectStatus([u8; 32]),    // Project status by hash
    ProjectIndex(u32),          // Project index
    ProjectIndexLength          // Total number of projects
}
```

### Contract Functions

#### `__constructor(admin: Address, whitelist_addresses: Vec<Address>)`

Initialize the contract with admin and whitelist addresses.

**Parameters:**

- `admin`: Admin address with full control
- `whitelist_addresses`: Initial list of whitelisted addresses

**Access Control:** Only callable during contract deployment

#### `is_whitelisted(address: Address) -> bool`

Check if an address is whitelisted.

**Parameters:**

- `address`: Address to check

**Returns:**

- `bool`: True if address is whitelisted, false otherwise

#### `add_to_whitelist(address: Address)`

Add an address to the whitelist.

**Parameters:**

- `address`: Address to add to whitelist

**Access Control:** Admin only

#### `remove_from_whitelist(address: Address)`

Remove an address from the whitelist.

**Parameters:**

- `address`: Address to remove from whitelist

**Access Control:** Admin only

#### `add_project(from: Address, project_hash: [u8; 32])`

Add a new project to the system.

**Parameters:**

- `from`: Address submitting the project (must be whitelisted)
- `project_hash`: 32-byte hash of the project data

**Access Control:** Whitelisted addresses only

**Behavior:**

- Creates new project with status `Pending`
- Increments project index counter
- Stores project hash and status

#### `set_project_approved(from: Address, project_hash: [u8; 32])`

Approve a project.

**Parameters:**

- `from`: Admin address approving the project
- `project_hash`: 32-byte hash of the project to approve

**Access Control:** Admin only

**Behavior:**

- Changes project status to `Approved`
- Emits approval event

#### `set_project_rejected(from: Address, project_hash: [u8; 32])`

Reject a project.

**Parameters:**

- `from`: Admin address rejecting the project
- `project_hash`: 32-byte hash of the project to reject

**Access Control:** Admin only

**Behavior:**

- Changes project status to `Rejected`
- Emits rejection event

#### `reset_project(project_hash: [u8; 32])`

Reset a project status to `NotSet`.

**Parameters:**

- `project_hash`: 32-byte hash of the project to reset

**Access Control:** Admin only

**Behavior:**

- Changes project status to `NotSet`
- Allows project to be resubmitted

#### `get_project_status(project_hash: [u8; 32]) -> ProjectStatusEnum`

Get the status of a specific project.

**Parameters:**

- `project_hash`: 32-byte hash of the project

**Returns:**

- `ProjectStatusEnum`: Current status of the project

#### `get_projects_statuses_in_bulk(start: u32, end: u32) -> Vec<ProjectData>`

Get project statuses for a range of project indices.

**Parameters:**

- `start`: Starting project index
- `end`: Ending project index

**Returns:**

- `Vec<ProjectData>`: Array of project data for the specified range

#### `get_projects_statuses_from_vec(project_hashes: Vec<[u8; 32]>) -> Vec<ProjectStatusEnum>`

Get statuses for specific project hashes.

**Parameters:**

- `project_hashes`: Array of 32-byte project hashes

**Returns:**

- `Vec<ProjectStatusEnum>`: Array of project statuses in same order

#### `get_all_projects_statuses() -> Vec<ProjectData>`

Get all project statuses in the system.

**Returns:**

- `Vec<ProjectData>`: Array of all project data

#### `set_admin(new_admin: Address)`

Change the admin address.

**Parameters:**

- `new_admin`: New admin address

**Access Control:** Current admin only

**Behavior:**

- Updates admin address
- Only current admin can change admin

### Contract Storage

The contract stores the following data:

```rust
{
    "Admin": Address,                    // Current admin address
    "ProjectIndex": u32,                 // Current project index
    "ProjectIndexLength": u32,           // Total number of projects
    "ProjectStatus": Vec<ProjectData>,   // Project statuses
    "Whitelist": Vec<Address>           // Whitelisted addresses
}
```

### Access Control

#### Admin Functions

- `add_to_whitelist`
- `remove_from_whitelist`
- `set_project_approved`
- `set_project_rejected`
- `reset_project`
- `set_admin`

#### Whitelisted Functions

- `add_project`

#### Public Functions

- `is_whitelisted`
- `get_project_status`
- `get_projects_statuses_in_bulk`
- `get_projects_statuses_from_vec`
- `get_all_projects_statuses`

### Workflow

1. **Contract Deployment**
   - Admin address is set
   - Initial whitelist is configured

2. **Project Submission**
   - Whitelisted address calls `add_project`
   - Project hash is stored with `Pending` status
   - Project index is incremented

3. **Project Review**
   - Admin reviews project data (off-chain)
   - Admin calls `set_project_approved` or `set_project_rejected`
   - Project status is updated on-chain

4. **Status Queries**
   - Anyone can query project statuses
   - Bulk queries available for efficiency

### Integration with Frontend

The contract integrates with the frontend through:

- **Project Submission**: Frontend generates project hash and calls `add_project`
- **Status Tracking**: Frontend queries project statuses for dashboard display
- **Admin Interface**: Backoffice calls approval/rejection functions
- **Whitelist Management**: Admin manages authorized addresses

### Security Considerations

#### Access Control

- Only admin can approve/reject projects
- Only whitelisted addresses can submit projects
- Admin can manage whitelist

#### Data Integrity

- Project hashes are immutable once stored
- Status changes are logged on-chain
- No direct data modification possible

#### Input Validation

- Project hashes must be exactly 32 bytes
- Address validation for admin and whitelist
- Index bounds checking for bulk queries

### Testing

#### Unit Tests

```bash
cargo test
```

#### Integration Tests

```bash
# Test project submission flow
soroban contract invoke --id <contract_id> add_project \
  --from <whitelisted_address> \
  --project-hash <32_byte_hash>

# Test project approval
soroban contract invoke --id <contract_id> set_project_approved \
  --from <admin_address> \
  --project-hash <32_byte_hash>

# Query project status
soroban contract invoke --id <contract_id> get_project_status \
  --project-hash <32_byte_hash>
```

### Contract Interaction Examples

#### JavaScript/TypeScript

```typescript
import { SorobanRpc, Contract } from "soroban-client";

// Initialize client
const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org");
const contract = new Contract(
  "CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN"
);

// Add project
const projectHash = new Uint8Array(32); // 32-byte hash
const result = await contract.call("add_project", {
  from: "GABC123...",
  project_hash: projectHash,
});

// Get project status
const status = await contract.call("get_project_status", {
  project_hash: projectHash,
});

// Approve project (admin only)
await contract.call("set_project_approved", {
  from: "GADMIN123...",
  project_hash: projectHash,
});
```

#### Rust

```rust
use soroban_sdk::{Address, Env, BytesN};

#[contract]
pub struct DobValidator;

#[contractimpl]
impl DobValidator {
    pub fn add_project(
        e: &mut Env,
        from: Address,
        project_hash: BytesN<32>
    ) -> Result<(), Error> {
        // Implementation
    }
}
```

### Monitoring

#### Contract Events

Monitor contract events for:

- Project submissions
- Status changes (Approved/Rejected)
- Whitelist modifications
- Admin changes

#### Key Metrics

- Number of projects submitted
- Approval/rejection rates
- Whitelist size
- Admin activity

### Deployment

#### Testnet Deployment

```bash
# Deploy contract
soroban contract deploy \
  --network testnet \
  --source admin \
  target/wasm32-unknown-unknown/release/dob_validator.wasm

# Initialize contract
soroban contract invoke \
  --network testnet \
  --id <contract_id> \
  --source admin \
  -- __constructor \
  --admin <admin_address> \
  --whitelist-addresses '["GABC123...", "GDEF456..."]'
```

#### Environment Configuration

```env
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
CONTRACT_ID=CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN
```

### Support and Resources

- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Documentation](https://developers.stellar.org/docs)
- [Contract Explorer](https://stellar.expert/explorer/testnet/contract/CBS3QODERORJH4GPDAWNQMUNTB4O6LO6NUETRXE5H2NSR3G542QOWKTN)

### License

Smart contracts are licensed under the MIT License.
