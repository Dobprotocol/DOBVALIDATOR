// Shared authentication storage for API routes
// This module persists data across Next.js API route reloads
//
// =====================
// FILE-BASED STORAGE (DEV ONLY)
// =====================
// In production, replace with Redis or a real database for atomic, distributed access.
// See documentation at the end of this file for migration notes.

import fs from 'fs'
import path from 'path'

const DATA_DIR = path.resolve(process.cwd(), 'auth-data')
const CHALLENGE_FILE = path.join(DATA_DIR, 'challenges.json')
const SESSION_FILE = path.join(DATA_DIR, 'sessions.json')
const PROFILE_FILE = path.join(DATA_DIR, 'profiles.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR)
  }
}

function readJsonFile(file: string) {
  ensureDataDir()
  if (!fs.existsSync(file)) return {}
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    console.error('Failed to read', file, e)
    return {}
  }
}

function writeJsonFile(file: string, data: any) {
  ensureDataDir()
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
}

// =====================
// Challenge Management
// =====================
export interface ChallengeData {
  challenge: string
  timestamp: number
}

export function storeChallenge(walletAddress: string, challenge: string): void {
  const all = readJsonFile(CHALLENGE_FILE)
  all[walletAddress] = { challenge, timestamp: Date.now() }
  writeJsonFile(CHALLENGE_FILE, all)
  console.log('✅ [FileStore] Challenge stored:', { walletAddress, challenge })
}

export function getChallenge(walletAddress: string): ChallengeData | undefined {
  const all = readJsonFile(CHALLENGE_FILE)
  return all[walletAddress]
}

export function removeChallenge(walletAddress: string): void {
  const all = readJsonFile(CHALLENGE_FILE)
  delete all[walletAddress]
  writeJsonFile(CHALLENGE_FILE, all)
  console.log('🧹 [FileStore] Challenge removed:', walletAddress)
}

export function cleanupExpiredChallenges(): void {
  const all = readJsonFile(CHALLENGE_FILE)
  const now = Date.now()
  let changed = false
  for (const addr in all) {
    if (now - all[addr].timestamp > 5 * 60 * 1000) {
      delete all[addr]
      changed = true
    }
  }
  if (changed) writeJsonFile(CHALLENGE_FILE, all)
}

// =====================
// Session Management
// =====================
export interface SessionData {
  token: string
  expiresAt: number
}

export function storeSession(walletAddress: string, token: string, expiresAt: number): void {
  const all = readJsonFile(SESSION_FILE)
  all[walletAddress] = { token, expiresAt }
  writeJsonFile(SESSION_FILE, all)
  console.log('✅ [FileStore] Session stored:', walletAddress)
}

export function getSession(walletAddress: string): SessionData | undefined {
  const all = readJsonFile(SESSION_FILE)
  return all[walletAddress]
}

export function removeSession(walletAddress: string): void {
  const all = readJsonFile(SESSION_FILE)
  delete all[walletAddress]
  writeJsonFile(SESSION_FILE, all)
  console.log('🧹 [FileStore] Session removed:', walletAddress)
}

export function logout(walletAddress: string): void {
  removeChallenge(walletAddress)
  removeSession(walletAddress)
  console.log('🚪 [FileStore] Logout completed for wallet:', walletAddress)
}

export function cleanupExpiredSessions(): void {
  const all = readJsonFile(SESSION_FILE)
  const now = Date.now()
  let changed = false
  for (const addr in all) {
    if (now > all[addr].expiresAt) {
      delete all[addr]
      changed = true
    }
  }
  if (changed) writeJsonFile(SESSION_FILE, all)
}

// =====================
// Debug functions
// =====================
export function getDebugInfo() {
  const challenges = readJsonFile(CHALLENGE_FILE)
  const sessions = readJsonFile(SESSION_FILE)
  const profiles = readJsonFile(PROFILE_FILE)
  return {
    challengesCount: Object.keys(challenges).length,
    sessionsCount: Object.keys(sessions).length,
    profilesCount: Object.keys(profiles).length,
    challenges: Object.entries(challenges),
    sessions: Object.entries(sessions),
    profiles: Object.entries(profiles),
  }
}

// =====================
// Profile management (file-based for dev)
// =====================
export function storeProfile(walletAddress: string, profileData: any): void {
  const all = readJsonFile(PROFILE_FILE)
  all[walletAddress] = {
    ...profileData,
    walletAddress,
    createdAt: profileData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  writeJsonFile(PROFILE_FILE, all)
  console.log('✅ [FileStore] Profile stored for wallet:', walletAddress)
}

export function getProfile(walletAddress: string): any | undefined {
  const all = readJsonFile(PROFILE_FILE)
  return all[walletAddress]
}

export function updateProfile(walletAddress: string, profileData: any): void {
  const all = readJsonFile(PROFILE_FILE)
  const existingProfile = all[walletAddress]
  if (existingProfile) {
    all[walletAddress] = {
      ...existingProfile,
      ...profileData,
      updatedAt: new Date().toISOString()
    }
    writeJsonFile(PROFILE_FILE, all)
    console.log('✅ [FileStore] Profile updated for wallet:', walletAddress)
  }
}

export function removeProfile(walletAddress: string): void {
  const all = readJsonFile(PROFILE_FILE)
  delete all[walletAddress]
  writeJsonFile(PROFILE_FILE, all)
  console.log('🧹 [FileStore] Profile removed for wallet:', walletAddress)
}

export function getAllProfiles(): any {
  return readJsonFile(PROFILE_FILE)
}

/*
=====================
PRODUCTION MIGRATION NOTES
=====================
- Replace all file-based read/write functions with calls to a real database or Redis.
- For Redis: Use HSET/HGET/DEL for challenge/session/profile keys, and set expiry for challenges.
- For SQL: Use tables with walletAddress as primary key:
  * challenges: walletAddress, challenge, timestamp
  * sessions: walletAddress, token, expiresAt  
  * profiles: walletAddress, name, company, email, phone, website, bio, createdAt, updatedAt
- Ensure all operations are atomic and safe for concurrent access.
- Remove or adapt the file utility functions.
- In production, use a single dashboard that shows real data from the database.
- For development, the mockup-dashboard is fine, but production should use /dashboard with real data.
*/ 