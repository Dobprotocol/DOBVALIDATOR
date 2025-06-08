// Common types and utilities for the DOB Validator project

export interface StellarWalletInfo {
  publicKey: string;
  wallet: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Add more shared types and utilities as needed 