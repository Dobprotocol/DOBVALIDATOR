// Shared authentication storage for API routes
// This module persists data across Next.js API route reloads
//
// =====================
// IN-MEMORY STORAGE (PRODUCTION READY)
// =====================
// In production, replace with Redis or a real database for atomic, distributed access.
// See documentation at the end of this file for migration notes.

// Use global variables to persist across API route reloads in development
declare global {
  var __challenges: Map<string, { challenge: string; timestamp: number }> | undefined
  var __sessions: Map<string, { token: string; expiresAt: number }> | undefined
  var __profiles: Map<string, any> | undefined
}

// Initialize global storage if it doesn't exist
if (typeof global !== 'undefined') {
  if (!global.__challenges) global.__challenges = new Map()
  if (!global.__sessions) global.__sessions = new Map()
  if (!global.__profiles) global.__profiles = new Map()
}

// In-memory storage (works in Vercel serverless)
const challenges = global.__challenges || new Map<string, { challenge: string; timestamp: number }>()
const sessions = global.__sessions || new Map<string, { token: string; expiresAt: number }>()
const profiles = global.__profiles || new Map<string, any>()

// Ensure global references are set
if (typeof global !== 'undefined') {
  global.__challenges = challenges
  global.__sessions = sessions
  global.__profiles = profiles
}

// Cleanup expired data every 5 minutes
let cleanupInterval: NodeJS.Timeout | null = null

function startCleanup() {
  if (cleanupInterval) return
  cleanupInterval = setInterval(() => {
    cleanupExpiredChallenges()
    cleanupExpiredSessions()
  }, 5 * 60 * 1000) // 5 minutes
}

// Start cleanup on module load
if (typeof window === 'undefined') {
  startCleanup()
}

// =====================
// Challenge Management
// =====================
export interface ChallengeData {
  challenge: string
  timestamp: number
}

export function storeChallenge(walletAddress: string, challenge: string): void {
  try {
    challenges.set(walletAddress, { challenge, timestamp: Date.now() })
    console.log('✅ [MemoryStore] Challenge stored:', { walletAddress, challenge })
  } catch (error) {
    console.error('❌ [MemoryStore] Failed to store challenge:', error)
    throw new Error('Failed to store challenge')
  }
}

export function getChallenge(walletAddress: string): ChallengeData | undefined {
  try {
    return challenges.get(walletAddress)
  } catch (error) {
    console.error('❌ [MemoryStore] Failed to get challenge:', error)
    return undefined
  }
}

export function removeChallenge(walletAddress: string): void {
  try {
    challenges.delete(walletAddress)
    console.log('🧹 [MemoryStore] Challenge removed:', walletAddress)
  } catch (error) {
    console.error('❌ [MemoryStore] Failed to remove challenge:', error)
  }
}

export function cleanupExpiredChallenges(): void {
  try {
    const now = Date.now()
    for (const [addr, data] of challenges.entries()) {
      if (now - data.timestamp > 5 * 60 * 1000) { // 5 minutes
        challenges.delete(addr)
      }
    }
  } catch (error) {
    console.error('❌ [MemoryStore] Failed to cleanup challenges:', error)
  }
}

// =====================
// Session Management
// =====================
export interface SessionData {
  token: string
  expiresAt: number
}

export function storeSession(walletAddress: string, token: string, expiresAt: number): void {
  try {
    sessions.set(walletAddress, { token, expiresAt })
    console.log('✅ [MemoryStore] Session stored:', walletAddress)
  } catch (error) {
    console.error('❌ [MemoryStore] Failed to store session:', error)
    throw new Error('Failed to store session')
  }
}

export function getSession(walletAddress: string): SessionData | undefined {
  try {
    return sessions.get(walletAddress)
  } catch (error) {
    console.error('❌ [MemoryStore] Failed to get session:', error)
    return undefined
  }
}

export function removeSession(walletAddress: string): void {
  try {
    sessions.delete(walletAddress)
    console.log('🧹 [MemoryStore] Session removed:', walletAddress)
  } catch (error) {
    console.error('❌ [MemoryStore] Failed to remove session:', error)
  }
}

export function logout(walletAddress: string): void {
  try {
    removeChallenge(walletAddress)
    removeSession(walletAddress)
    console.log('🚪 [MemoryStore] Logout completed for wallet:', walletAddress)
  } catch (error) {
    console.error('❌ [MemoryStore] Failed to logout:', error)
  }
}

export function cleanupExpiredSessions(): void {
  try {
    const now = Date.now()
    for (const [addr, data] of sessions.entries()) {
      if (now > data.expiresAt) {
        sessions.delete(addr)
      }
    }
  } catch (error) {
    console.error('❌ [MemoryStore] Failed to cleanup sessions:', error)
  }
}

// =====================
// Debug functions
// =====================
export function getDebugInfo() {
  try {
    return {
      challengesCount: challenges.size,
      sessionsCount: sessions.size,
      profilesCount: profiles.size,
      challenges: Array.from(challenges.entries()),
      sessions: Array.from(sessions.entries()),
      profiles: Array.from(profiles.entries()),
    }
  } catch (error) {
    console.error('❌ [MemoryStore] Failed to get debug info:', error)
    return {
      challengesCount: 0,
      sessionsCount: 0,
      profilesCount: 0,
      challenges: [],
      sessions: [],
      profiles: [],
    }
  }
}

// =====================
// Profile management (in-memory for production)
// =====================
export function storeProfile(walletAddress: string, profileData: any): void {
  try {
    const profileToStore = {
      ...profileData,
      walletAddress,
      createdAt: profileData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    profiles.set(walletAddress, profileToStore)
    console.log('✅ [MemoryStore] Profile stored for wallet:', walletAddress)
    console.log('🔍 [MemoryStore] Profile data stored:', profileToStore)
    console.log('🔍 [MemoryStore] Total profiles in memory:', profiles.size)
  } catch (error) {
    console.error('❌ [MemoryStore] Failed to store profile:', error)
    throw new Error('Failed to store profile')
  }
}

export function getProfile(walletAddress: string): any | undefined {
  try {
    const profile = profiles.get(walletAddress)
    console.log('🔍 [MemoryStore] Profile lookup for wallet:', walletAddress, profile ? 'found' : 'not found')
    if (profile) {
      console.log('🔍 [MemoryStore] Profile details:', { name: profile.name, company: profile.company, email: profile.email })
    }
    return profile
  } catch (error) {
    console.error('❌ [MemoryStore] Failed to get profile:', error)
    return undefined
  }
}

export function updateProfile(walletAddress: string, profileData: any): void {
  try {
    const existingProfile = profiles.get(walletAddress)
    if (existingProfile) {
      profiles.set(walletAddress, {
        ...existingProfile,
        ...profileData,
        updatedAt: new Date().toISOString()
      })
      console.log('✅ [MemoryStore] Profile updated for wallet:', walletAddress)
    }
  } catch (error) {
    console.error('❌ [MemoryStore] Failed to update profile:', error)
    throw new Error('Failed to update profile')
  }
}

export function removeProfile(walletAddress: string): void {
  try {
    profiles.delete(walletAddress)
    console.log('🧹 [MemoryStore] Profile removed for wallet:', walletAddress)
  } catch (error) {
    console.error('❌ [MemoryStore] Failed to remove profile:', error)
  }
}

export function getAllProfiles(): any {
  try {
    return Object.fromEntries(profiles)
  } catch (error) {
    console.error('❌ [MemoryStore] Failed to get all profiles:', error)
    return {}
  }
}

/*
=====================
PRODUCTION MIGRATION NOTES
=====================
- Replace all in-memory Map operations with calls to a real database or Redis.
- For Redis: Use HSET/HGET/DEL for challenge/session/profile keys, and set expiry for challenges.
- For SQL: Use tables with walletAddress as primary key:
  * challenges: walletAddress, challenge, timestamp
  * sessions: walletAddress, token, expiresAt  
  * profiles: walletAddress, name, company, email, phone, website, bio, createdAt, updatedAt
- Ensure all operations are atomic and safe for concurrent access.
- Remove or adapt the in-memory storage functions.
- In production, use a single dashboard that shows real data from the database.
- Consider using Vercel KV (Redis) for production deployments.
*/ 