import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { prisma } from './lib/database'
import { userService, profileService, submissionService, authService, adminReviewService } from './lib/database'
import { env } from './lib/env-validation'

const app = express()
const PORT = env.PORT

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))

// Rate limiting
const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: env.AUTH_RATE_LIMIT_MAX_REQUESTS || 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs for other endpoints
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Commenting out rate limiting for e2e testing
// app.use('/api/auth', authLimiter)
// app.use('/api', apiLimiter)

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost on various ports for development
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      // Production domains
      'https://validator.dobprotocol.com',
      'https://backoffice.dobprotocol.com',
      'https://v.dobprotocol.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // In development, allow all origins for easier testing
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}))

// Request size limits
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Authentication endpoints
app.post('/api/auth/challenge', async (req, res) => {
  try {
    const { walletAddress } = req.body

    if (!walletAddress) {
      res.status(400).json({ error: 'Wallet address is required' })
      return
    }

    // Generate challenge
    const challenge = `DOB_VALIDATOR_AUTH_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store challenge
    await authService.createChallenge(walletAddress, challenge, expiresAt)

    res.json({ success: true, challenge })
    return
  } catch (error) {
    console.error('Challenge generation error:', error)
    res.status(500).json({ error: 'Failed to generate challenge' })
    return
  }
})

app.post('/api/auth/verify', async (req, res) => {
  try {
    const { walletAddress, signature, challenge } = req.body

    if (!walletAddress || !signature || !challenge) {
      res.status(400).json({ error: 'Wallet address, signature, and challenge are required' })
      return
    }

    // Get stored challenge
    const storedChallenge = await authService.getChallenge(challenge)
    if (!storedChallenge) {
      res.status(401).json({ error: 'Invalid or expired challenge' })
      return
    }

    // For now, accept any signature (in production, verify with Stellar SDK)
    // TODO: Implement proper signature verification
    const isValid = true

    if (!isValid) {
      res.status(401).json({ error: 'Invalid signature' })
      return
    }

    // Get existing user or create new one
    let user = await userService.getByWallet(walletAddress)
    if (!user) {
      user = await userService.findOrCreateByWallet(walletAddress)
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken')
    const token = jwt.sign(
      { walletAddress, userId: user.id },
      env.***REMOVED***,
      { expiresIn: env.JWT_EXPIRES_IN }
    )

    // Store session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await authService.createSession(walletAddress, token, expiresAt)

    // Clean up challenge
    await authService.deleteChallenge(challenge)

    // Calculate expiresIn in seconds
    const expiresIn = env.JWT_EXPIRES_IN || '7d'
    const expiresInSeconds = expiresIn.includes('d') 
      ? parseInt(expiresIn) * 24 * 60 * 60 
      : expiresIn.includes('h') 
        ? parseInt(expiresIn) * 60 * 60 
        : parseInt(expiresIn)

    res.json({ success: true, token, expiresIn: expiresInSeconds.toString(), user })
    return
  } catch (error) {
    console.error('Verification error:', error)
    res.status(500).json({ error: 'Failed to verify signature' })
    return
  }
})

// Profile endpoints
app.get('/api/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.***REMOVED***)
    const { walletAddress } = decoded

    console.log('🔍 Looking for profile with wallet:', walletAddress)

    const profile = await profileService.getByWallet(walletAddress)
    if (!profile) {
      console.log('❌ Profile not found for wallet:', walletAddress)
      res.status(404).json({ error: 'Profile not found' })
      return
    }

    console.log('✅ Profile found:', profile.id)
    res.json({ success: true, profile })
    return
  } catch (error: any) {
    console.error('Profile fetch error:', error)
    
    // Check if it's a JWT verification error
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Invalid token' })
      return
    }
    
    // For other errors, return 500 but with more details
    console.error('Unexpected error in profile fetch:', error)
    res.status(500).json({ error: 'Internal server error', details: error.message })
    return
  }
})

app.post('/api/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.***REMOVED***)
    const { walletAddress } = decoded

    const { name, company, email } = req.body

    // Get user
    const user = await userService.getByWallet(walletAddress)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    // Create or update profile
    const profile = await profileService.create(user.id, {
      name,
      company,
      email,
      walletAddress
    })

    res.json({ success: true, profile })
    return
  } catch (error) {
    console.error('Profile creation error:', error)
    res.status(500).json({ error: 'Failed to create profile' })
    return
  }
})

// Submissions endpoints
app.get('/api/submissions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.***REMOVED***)
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
    return
  } catch (error) {
    console.error('Submissions fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch submissions' })
    return
  }
})

app.get('/api/submissions/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.***REMOVED***)
    const { walletAddress } = decoded

    const { id } = req.params

    const submission = await submissionService.getById(id)
    if (!submission) {
      res.status(404).json({ error: 'Submission not found' })
      return
    }

    // Check if user is admin or owns the submission
    const user = await userService.getByWallet(walletAddress)
    const isAdmin = user?.role === 'ADMIN'
    const isOwner = submission.user.walletAddress === walletAddress

    if (!isAdmin && !isOwner) {
      res.status(403).json({ error: 'Access denied' })
      return
    }

    res.json({ success: true, submission })
    return
  } catch (error) {
    console.error('Submission fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch submission' })
    return
  }
})

app.post('/api/submissions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.***REMOVED***)
    const { walletAddress } = decoded

    const user = await userService.getByWallet(walletAddress)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const submissionData = req.body
    const submission = await submissionService.create(user.id, submissionData)

    res.json({ success: true, submission })
    return
  } catch (error) {
    console.error('Submission creation error:', error)
    res.status(500).json({ error: 'Failed to create submission' })
    return
  }
})

// Admin endpoints
app.put('/api/submissions/:id/status', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.***REMOVED***)
    const { walletAddress } = decoded

    const user = await userService.getByWallet(walletAddress)
    if (user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' })
      return
    }

    const { id } = req.params
    const { status, adminNotes } = req.body

    const submission = await submissionService.update(id, { status, adminNotes })

    res.json({ success: true, submission })
    return
  } catch (error) {
    console.error('Submission update error:', error)
    res.status(500).json({ error: 'Failed to update submission' })
    return
  }
})

// General submission update endpoint (admin only)
app.put('/api/submissions/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.***REMOVED***)
    const { walletAddress } = decoded

    const user = await userService.getByWallet(walletAddress)
    if (user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' })
      return
    }

    const { id } = req.params
    const updates = req.body

    // Handle admin review data separately
    const { adminNotes, adminScore, adminDecision, adminDecisionAt, ...submissionUpdates } = updates

    // Create admin review data if provided
    if (adminNotes !== undefined || adminScore !== undefined || adminDecision !== undefined) {
      const adminReviewData: any = {}
      
      if (adminNotes !== undefined) adminReviewData.notes = adminNotes
      if (adminScore !== undefined) adminReviewData.overallScore = adminScore
      if (adminDecision !== undefined) adminReviewData.decision = adminDecision.toUpperCase()
      if (adminDecisionAt !== undefined) adminReviewData.decisionAt = new Date(adminDecisionAt)

      await adminReviewService.upsert(id, adminReviewData)
    }

    // Update submission
    const submission = await submissionService.update(id, submissionUpdates)

    res.json({ success: true, submission })
    return
  } catch (error) {
    console.error('Submission update error:', error)
    res.status(500).json({ error: 'Failed to update submission' })
    return
  }
})

// Drafts endpoints
app.get('/api/drafts', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.***REMOVED***)
    const { walletAddress } = decoded

    const { limit = 10, offset = 0 } = req.query

    // Get user
    const user = await userService.getByWallet(walletAddress)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    // Get drafts for user
    const drafts = await prisma.draft.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    })

    const total = await prisma.draft.count({
      where: { userId: user.id }
    })

    res.json({ 
      success: true, 
      drafts,
      total,
      hasMore: (parseInt(offset as string) + parseInt(limit as string)) < total
    })
    return
  } catch (error) {
    console.error('Drafts fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch drafts' })
    return
  }
})

app.post('/api/drafts', async (req, res) => {
  try {
    console.log('🔍 Draft POST request received')
    console.log('🔍 Request body:', req.body)
    
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header')
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    console.log('🔍 Token received:', token.substring(0, 20) + '...')
    
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.***REMOVED***)
    console.log('🔍 JWT decoded:', decoded)
    const { walletAddress } = decoded

    console.log('🔍 Looking for user with wallet:', walletAddress)
    const user = await userService.getByWallet(walletAddress)
    if (!user) {
      console.log('❌ User not found for wallet:', walletAddress)
      res.status(404).json({ error: 'User not found' })
      return
    }
    console.log('🔍 User found:', user.id)

    const draftData = req.body
    console.log('🔍 Creating draft with data:', draftData)
    
    const draft = await prisma.draft.create({
      data: {
        userId: user.id,
        ...draftData
      }
    })

    console.log('🔍 Draft created successfully:', draft.id)
    res.json({ success: true, draft })
    return
  } catch (error: any) {
    console.error('❌ Draft creation error:', error)
    console.error('❌ Error stack:', error.stack)
    res.status(500).json({ error: 'Failed to create draft' })
    return
  }
})

app.get('/api/drafts/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.***REMOVED***)
    const { walletAddress } = decoded

    const user = await userService.getByWallet(walletAddress)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const { id } = req.params

    // Get draft by ID and user
    const draft = await prisma.draft.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (!draft) {
      res.status(404).json({ error: 'Draft not found' })
      return
    }

    res.json({ success: true, draft })
    return
  } catch (error) {
    console.error('Draft fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch draft' })
    return
  }
})

app.put('/api/drafts/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.***REMOVED***)
    const { walletAddress } = decoded

    const user = await userService.getByWallet(walletAddress)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const { id } = req.params
    const updateData = req.body

    // Check if draft exists and belongs to user
    const existingDraft = await prisma.draft.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (!existingDraft) {
      res.status(404).json({ error: 'Draft not found' })
      return
    }

    // Update the draft
    const updatedDraft = await prisma.draft.update({
      where: { id: id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    res.json({ success: true, draft: updatedDraft })
    return
  } catch (error) {
    console.error('Draft update error:', error)
    res.status(500).json({ error: 'Failed to update draft' })
    return
  }
})

app.delete('/api/drafts/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.***REMOVED***)
    const { walletAddress } = decoded

    const user = await userService.getByWallet(walletAddress)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const { id } = req.params

    // Check if draft exists and belongs to user
    const existingDraft = await prisma.draft.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (!existingDraft) {
      res.status(404).json({ error: 'Draft not found' })
      return
    }

    // Delete the draft
    await prisma.draft.delete({
      where: { id: id }
    })

    res.json({ success: true, message: 'Draft deleted successfully' })
    return
  } catch (error) {
    console.error('Draft deletion error:', error)
    res.status(500).json({ error: 'Failed to delete draft' })
    return
  }
})

// Admin endpoints
app.get('/api/admin/profiles', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.***REMOVED***)
    const { walletAddress } = decoded

    const user = await userService.getByWallet(walletAddress)
    if (user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' })
      return
    }

    const { limit = 50, offset = 0 } = req.query

    // Get all profiles with user information
    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        include: {
          user: {
            select: {
              id: true,
              walletAddress: true,
              email: true,
              name: true,
              company: true,
              role: true,
              createdAt: true,
              updatedAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      }),
      prisma.profile.count()
    ])

    res.json({ 
      success: true, 
      profiles,
      total,
      hasMore: (parseInt(offset as string) + parseInt(limit as string)) < total,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total
      }
    })
    return
  } catch (error) {
    console.error('Admin profiles fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch profiles' })
    return
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

    // Start session cleanup job (runs every hour)
    setInterval(async () => {
      try {
        await authService.cleanupExpired()
        console.log('🧹 Cleaned up expired sessions and challenges')
      } catch (error) {
        console.error('❌ Session cleanup error:', error)
      }
    }, 60 * 60 * 1000) // Run every hour

    // Run initial cleanup
    await authService.cleanupExpired()
    console.log('🧹 Initial cleanup completed')

    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/health`)
      console.log(`🔗 API base: http://localhost:${PORT}/api`)
      console.log(`🔒 Security: Rate limiting, enhanced helmet, session cleanup active`)
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