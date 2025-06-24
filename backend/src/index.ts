import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { prisma } from './lib/database'
import { userService, profileService, submissionService, authService } from './lib/database'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Authentication endpoints
app.post('/api/auth/challenge', async (req, res) => {
  try {
    const { walletAddress } = req.body

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' })
    }

    // Generate challenge
    const challenge = `DOB_VALIDATOR_AUTH_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store challenge
    await authService.createChallenge(walletAddress, challenge, expiresAt)

    res.json({ success: true, challenge })
  } catch (error) {
    console.error('Challenge generation error:', error)
    res.status(500).json({ error: 'Failed to generate challenge' })
  }
})

app.post('/api/auth/verify', async (req, res) => {
  try {
    const { walletAddress, signature, challenge } = req.body

    if (!walletAddress || !signature || !challenge) {
      return res.status(400).json({ error: 'Wallet address, signature, and challenge are required' })
    }

    // Get stored challenge
    const storedChallenge = await authService.getChallenge(challenge)
    if (!storedChallenge) {
      return res.status(401).json({ error: 'Invalid or expired challenge' })
    }

    // For now, accept any signature (in production, verify with Stellar SDK)
    // TODO: Implement proper signature verification
    const isValid = true

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' })
    }

    // Create or get user
    const user = await userService.findOrCreateByWallet(walletAddress)

    // Generate JWT token
    const jwt = require('jsonwebtoken')
    const token = jwt.sign(
      { walletAddress, userId: user.id },
      process.env.***REMOVED*** || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // Store session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await authService.createSession(walletAddress, token, expiresAt)

    // Clean up challenge
    await authService.deleteChallenge(challenge)

    res.json({ success: true, token, user })
  } catch (error) {
    console.error('Verification error:', error)
    res.status(500).json({ error: 'Failed to verify signature' })
  }
})

// Profile endpoints
app.get('/api/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' })
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, process.env.***REMOVED*** || 'your-super-secret-jwt-key-change-in-production')
    const { walletAddress } = decoded

    const profile = await profileService.getByWallet(walletAddress)
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    res.json({ success: true, profile })
  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
})

app.post('/api/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' })
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, process.env.***REMOVED*** || 'your-super-secret-jwt-key-change-in-production')
    const { walletAddress } = decoded

    const { name, company, email } = req.body

    // Get user
    const user = await userService.getByWallet(walletAddress)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Create or update profile
    const profile = await profileService.create(user.id, {
      name,
      company,
      email,
      walletAddress
    })

    res.json({ success: true, profile })
  } catch (error) {
    console.error('Profile creation error:', error)
    res.status(500).json({ error: 'Failed to create profile' })
  }
})

// Submissions endpoints
app.get('/api/submissions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' })
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, process.env.***REMOVED*** || 'your-super-secret-jwt-key-change-in-production')
    const { walletAddress } = decoded

    const { status, limit = 10, offset = 0 } = req.query

    // Check if user is admin
    const user = await userService.getByWallet(walletAddress)
    const isAdmin = user?.role === 'ADMIN'

    let result
    if (isAdmin) {
      // Admin can see all submissions
      result = await submissionService.getAll({
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      })
    } else {
      // Regular users can only see their own submissions
      result = await submissionService.getByUser(walletAddress, {
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      })
    }

    res.json({ success: true, ...result })
  } catch (error) {
    console.error('Submissions fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch submissions' })
  }
})

app.get('/api/submissions/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' })
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, process.env.***REMOVED*** || 'your-super-secret-jwt-key-change-in-production')
    const { walletAddress } = decoded

    const { id } = req.params

    const submission = await submissionService.getById(id)
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' })
    }

    // Check if user is admin or owns the submission
    const user = await userService.getByWallet(walletAddress)
    const isAdmin = user?.role === 'ADMIN'
    const isOwner = submission.user.walletAddress === walletAddress

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({ success: true, submission })
  } catch (error) {
    console.error('Submission fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch submission' })
  }
})

app.post('/api/submissions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' })
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, process.env.***REMOVED*** || 'your-super-secret-jwt-key-change-in-production')
    const { walletAddress } = decoded

    const user = await userService.getByWallet(walletAddress)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const submissionData = req.body
    const submission = await submissionService.create(user.id, submissionData)

    res.json({ success: true, submission })
  } catch (error) {
    console.error('Submission creation error:', error)
    res.status(500).json({ error: 'Failed to create submission' })
  }
})

// Admin endpoints
app.put('/api/submissions/:id/status', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' })
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, process.env.***REMOVED*** || 'your-super-secret-jwt-key-change-in-production')
    const { walletAddress } = decoded

    const user = await userService.getByWallet(walletAddress)
    if (user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { id } = req.params
    const { status, adminNotes } = req.body

    const submission = await submissionService.update(id, { status, adminNotes })

    res.json({ success: true, submission })
  } catch (error) {
    console.error('Submission update error:', error)
    res.status(500).json({ error: 'Failed to update submission' })
  }
})

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/health`)
      console.log(`🔗 API base: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...')
  await prisma.$disconnect()
  process.exit(0)
})

startServer() 