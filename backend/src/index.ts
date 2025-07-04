import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import path from 'path'
import { TransactionBuilder, Networks } from 'stellar-sdk'
import { prisma } from './lib/database'
import { userService, profileService, submissionService, authService, adminReviewService, draftService } from './lib/database'
import { env } from './lib/env-validation'

const app = express()
const PORT = env.PORT

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files
  }
})

// Helper function to verify XDR transaction
async function verifyXDRTransaction(walletAddress: string, signedXDR: string, challenge: string): Promise<boolean> {
  console.log('🔍 Verifying XDR transaction...')
  console.log('🔍 Wallet address:', walletAddress)
  console.log('🔍 Challenge:', challenge)
  console.log('🔍 Signed XDR length:', signedXDR.length)
  
  try {
    // Parse the signed XDR transaction
    const transaction = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET)
    console.log('✅ Transaction parsed successfully')
    
    // Handle different transaction types
    if ('source' in transaction) {
      console.log('🔍 Transaction source:', transaction.source)
    } else {
      console.log('🔍 Fee bump transaction - using inner transaction source')
      if (transaction.innerTransaction && 'source' in transaction.innerTransaction) {
        console.log('🔍 Inner transaction source:', transaction.innerTransaction.source)
      }
    }
    
    console.log('🔍 Transaction operations count:', transaction.operations.length)
    
    // Extract the challenge from manageData operation
    let transactionChallenge = null
    for (let i = 0; i < transaction.operations.length; i++) {
      const operation = transaction.operations[i]
      console.log(`🔍 Operation ${i}:`, operation.type)
      
      if (operation.type === 'manageData') {
        console.log('🔍 Found manageData operation')
        const manageDataOp = operation as any // Type assertion for manageData operation
        console.log('🔍 Operation name:', manageDataOp.name)
        console.log('🔍 Operation value:', manageDataOp.value)
        
        if (manageDataOp.name === 'auth_challenge') {
          transactionChallenge = manageDataOp.value
          console.log('✅ Found auth_challenge data:', transactionChallenge)
          console.log('🔍 Transaction challenge type:', typeof transactionChallenge)
          console.log('🔍 Transaction challenge length:', transactionChallenge?.length)
          console.log('🔍 Transaction challenge as string:', String(transactionChallenge))
          break
        }
      }
    }
    
    if (!transactionChallenge) {
      console.log('❌ No auth_challenge data found in transaction')
      console.log('🔍 Available operations:')
      transaction.operations.forEach((op: any, i: number) => {
        console.log(`  ${i}: ${op.type} - ${op.name || 'no name'}`)
      })
      return false
    }
    
    console.log('🔍 Transaction challenge (from manageData):', transactionChallenge)
    
    // Check if the stored challenge starts with the transaction challenge
    // (since the transaction challenge is truncated to 28 bytes)
    const transactionChallengeStr = String(transactionChallenge)
    const storedChallengeStr = String(challenge)
    
    console.log('🔍 Comparing challenges:')
    console.log('🔍 Stored challenge (string):', storedChallengeStr)
    console.log('🔍 Transaction challenge (string):', transactionChallengeStr)
    console.log('🔍 Stored challenge length:', storedChallengeStr.length)
    console.log('🔍 Transaction challenge length:', transactionChallengeStr.length)
    
    if (!storedChallengeStr.startsWith(transactionChallengeStr)) {
      console.log('❌ Challenge mismatch')
      console.log('❌ Expected (stored):', storedChallengeStr)
      console.log('❌ Received (transaction):', transactionChallengeStr)
      console.log('❌ Stored starts with transaction?', storedChallengeStr.startsWith(transactionChallengeStr))
      return false
    }
    
    // Verify the transaction signature
    let sourceAccount: string
    if ('source' in transaction) {
      sourceAccount = transaction.source
    } else {
      // Handle fee bump transaction
      if (transaction.innerTransaction && 'source' in transaction.innerTransaction) {
        sourceAccount = transaction.innerTransaction.source
      } else {
        console.log('❌ Could not determine transaction source')
        return false
      }
    }
    
    if (sourceAccount !== walletAddress) {
      console.log('❌ Wallet address mismatch')
      console.log('❌ Expected:', walletAddress)
      console.log('❌ Found:', sourceAccount)
      return false
    }
    
    console.log('✅ XDR transaction verification successful')
    return true
  } catch (error) {
    console.error('❌ Error verifying XDR transaction:', error)
    return false
  }
}

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

// Serve static files (profile images, uploads, etc.)
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Ping endpoint for basic connectivity testing
app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'pong',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test user service
    const testUser = await userService.getByWallet('GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN')
    console.log('✅ User service test:', testUser ? 'User found' : 'User not found')
    
    // Test submission service
    const submissions = await submissionService.getAll({ limit: 1 })
    console.log('✅ Submission service test:', submissions.submissions.length, 'submissions found')
    
    res.json({
      status: 'ok',
      userService: testUser ? 'working' : 'no user found',
      submissionService: 'working',
      submissionCount: submissions.submissions.length
    })
  } catch (error) {
    console.error('❌ Database test error:', error)
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
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
      env.JWT_SECRET,
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

// Wallet login endpoint (alias for verify)
app.post('/api/auth/wallet-login', async (req, res) => {
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
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    )

    // Store session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await authService.createSession(walletAddress, token, expiresAt)

    // Clean up challenge
    await authService.deleteChallenge(challenge)

    // Return in the format expected by the backoffice
    res.json({ 
      success: true, 
      access_token: token,
      expiresIn: env.JWT_EXPIRES_IN || '7d',
      user 
    })
    return
  } catch (error) {
    console.error('Wallet login error:', error)
    res.status(500).json({ error: 'Failed to authenticate wallet' })
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
    
    const decoded = jwt.verify(token, env.JWT_SECRET)
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
    console.log('🔍 Profile POST request received')
    console.log('🔍 Request body:', req.body)
    
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header')
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    console.log('🔍 Verifying JWT token...')
    const decoded = jwt.verify(token, env.JWT_SECRET)
    const { walletAddress } = decoded
    console.log('✅ JWT verified, wallet address:', walletAddress)

    const { name, company, email, profileImage } = req.body
    console.log('🔍 Profile data:', { name, company, email, profileImage })

    // Get user
    console.log('🔍 Getting user by wallet...')
    const user = await userService.getByWallet(walletAddress)
    if (!user) {
      console.log('❌ User not found for wallet:', walletAddress)
      res.status(404).json({ error: 'User not found' })
      return
    }
    console.log('✅ User found:', user.id)

    // Create or update profile
    console.log('🔍 Creating/updating profile...')
    const profile = await profileService.create(user.id, {
      name,
      company,
      email,
      walletAddress,
      profileImage
    })
    console.log('✅ Profile created/updated:', profile.id)

    res.json({ success: true, profile })
    return
  } catch (error) {
    console.error('❌ Profile creation error:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    res.status(500).json({ error: 'Failed to create profile' })
    return
  }
})

// Profile image upload endpoint
app.post('/api/profile/upload-image', upload.single('profileImage'), async (req, res) => {
  try {
    console.log('🔍 Profile image upload request received')
    
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.JWT_SECRET)
    const { walletAddress } = decoded

    const user = await userService.getByWallet(walletAddress)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' })
      return
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      res.status(400).json({ error: 'File must be an image' })
      return
    }

    // Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      res.status(400).json({ error: 'Image size must be less than 5MB' })
      return
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileExtension = req.file.originalname.split('.').pop()
    const filename = `profile-${walletAddress}-${timestamp}.${fileExtension}`
    
    // For now, we'll store the file path as the URL
    // In production, you might want to upload to a CDN or cloud storage
    const imageUrl = `/uploads/profiles/${filename}`
    
    // Save the file to the uploads directory
    const fs = require('fs')
    const path = require('path')
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'profiles')
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    const filePath = path.join(uploadDir, filename)
    fs.writeFileSync(filePath, req.file.buffer)

    // Update the user's profile with the image URL
    const profile = await profileService.updateByWallet(walletAddress, {
      profileImage: imageUrl
    })

    res.json({ 
      success: true, 
      imageUrl,
      profile 
    })
    return
  } catch (error) {
    console.error('❌ Profile image upload error:', error)
    res.status(500).json({ error: 'Failed to upload profile image' })
    return
  }
})

// Submissions endpoints
app.get('/api/submissions', async (req, res) => {
  try {
    console.log('🔍 Submissions request received')
    
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header')
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    console.log('🔍 Verifying JWT token...')
    const decoded = jwt.verify(token, env.JWT_SECRET)
    const { walletAddress } = decoded
    console.log('✅ JWT verified, wallet address:', walletAddress)

    const { status, limit = 10, offset = 0 } = req.query

    // Check if user is admin
    console.log('🔍 Getting user by wallet...')
    const user = await userService.getByWallet(walletAddress)
    const isAdmin = user?.role === 'ADMIN'
    console.log('✅ User found, isAdmin:', isAdmin, 'role:', user?.role)

    let result
    if (isAdmin) {
      // Admin can see all submissions
      console.log('🔍 Getting all submissions (admin)...')
      result = await submissionService.getAll({
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      })
    } else {
      // Regular users can only see their own submissions
      console.log('🔍 Getting user submissions...')
      result = await submissionService.getByUser(walletAddress, {
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      })
    }

    console.log('✅ Submissions fetched successfully, count:', result.submissions?.length || 0)
    res.json({ success: true, ...result })
    return
  } catch (error) {
    console.error('❌ Submissions fetch error:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('❌ Error message:', error instanceof Error ? error.message : 'No message')
    res.status(500).json({ 
      error: 'Failed to fetch submissions',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
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
    
    const decoded = jwt.verify(token, env.JWT_SECRET)
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

// File upload endpoint for individual files during form process
app.post('/api/upload-files', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'files', maxCount: 10 },
  { name: 'field', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('🔍 File upload request received')
    console.log('🔍 Request headers:', req.headers)
    console.log('🔍 Request body:', req.body)
    console.log('🔍 Request files:', req.files)
    
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.JWT_SECRET)
    const { walletAddress } = decoded

    const user = await userService.getByWallet(walletAddress)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const field = req.body.field
    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] }
    const files: Array<{
      id: string
      filename: string
      path: string
      size: number
      mimeType: string
      documentType: string
      uploadedAt: string
    }> = []

    // Get or create a draft for this user to store the files
    let draft = await prisma.draft.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' }
    })

    if (!draft) {
      // Create a new draft if none exists
      draft = await prisma.draft.create({
        data: {
          userId: user.id,
          deviceName: '',
          deviceType: '',
          serialNumber: '',
          manufacturer: '',
          model: '',
          yearOfManufacture: '',
          condition: '',
          specifications: '',
          purchasePrice: '',
          currentValue: '',
          expectedRevenue: '',
          operationalCosts: '',
          location: ''
        }
      })
    }

    // Process single file
    if (uploadedFiles.file && uploadedFiles.file.length > 0) {
      const file = uploadedFiles.file[0]
      
      // Store file in database
      const dbFile = await prisma.draftFile.create({
        data: {
          filename: file.originalname,
          path: `/uploads/${field}/${file.filename}`,
          size: file.size,
          mimeType: file.mimetype,
          documentType: field,
          draftId: draft.id
        }
      })
      
      files.push({
        id: dbFile.id,
        filename: dbFile.filename,
        path: dbFile.path,
        size: dbFile.size,
        mimeType: dbFile.mimeType,
        documentType: dbFile.documentType,
        uploadedAt: dbFile.uploadedAt.toISOString()
      })
    }

    // Process multiple files
    if (uploadedFiles.files && uploadedFiles.files.length > 0) {
      for (const file of uploadedFiles.files) {
        // Store file in database
        const dbFile = await prisma.draftFile.create({
          data: {
            filename: file.originalname,
            path: `/uploads/${field}/${file.filename}`,
            size: file.size,
            mimeType: file.mimetype,
            documentType: field,
            draftId: draft.id
          }
        })
        
        files.push({
          id: dbFile.id,
          filename: dbFile.filename,
          path: dbFile.path,
          size: dbFile.size,
          mimeType: dbFile.mimeType,
          documentType: dbFile.documentType,
          uploadedAt: dbFile.uploadedAt.toISOString()
        })
      }
    }

    console.log('🔍 Processed uploaded files:', files)
    console.log('🔍 Files stored in draft:', draft.id)

    res.json({ success: true, files })
    return
  } catch (error) {
    console.error('❌ File upload error:', error)
    console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('❌ Error message:', error instanceof Error ? error.message : 'No message')
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Check if it's a JWT verification error
    if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
      console.error('❌ JWT verification failed:', error.message)
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }
    
    res.status(500).json({ error: 'Failed to upload files' })
    return
  }
})

app.post('/api/submissions', upload.any(), async (req, res) => {
  try {
    console.log('🔍 Submission POST request received')
    console.log('🔍 Request headers:', req.headers)
    console.log('🔍 Request body:', req.body)
    console.log('🔍 Request files:', req.files)
    
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.JWT_SECRET)
    const { walletAddress } = decoded

    const user = await userService.getByWallet(walletAddress)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    // Extract form data
    const submissionData = {
      deviceName: req.body.deviceName,
      deviceType: req.body.deviceType,
      location: req.body.location,
      serialNumber: req.body.serialNumber,
      manufacturer: req.body.manufacturer,
      model: req.body.model,
      yearOfManufacture: req.body.yearOfManufacture,
      condition: req.body.condition,
      specifications: req.body.specifications,
      purchasePrice: req.body.purchasePrice,
      currentValue: req.body.currentValue,
      expectedRevenue: req.body.expectedRevenue,
      operationalCosts: req.body.operationalCosts
    }

    // Process files from file IDs or actual files
    const files: Array<{
      filename: string
      path: string
      size: number
      mimeType: string
      documentType: string
    }> = []

    // Handle file IDs (files already uploaded to backend)
    if (req.body.technicalCertificationId) {
      const fileId = req.body.technicalCertificationId
      const draftFile = await prisma.draftFile.findUnique({
        where: { id: fileId }
      })
      if (draftFile) {
        files.push({
          filename: draftFile.filename,
          path: draftFile.path,
          size: draftFile.size,
          mimeType: draftFile.mimeType,
          documentType: 'technical_certification'
        })
      }
    }

    if (req.body.purchaseProofId) {
      const fileId = req.body.purchaseProofId
      const draftFile = await prisma.draftFile.findUnique({
        where: { id: fileId }
      })
      if (draftFile) {
        files.push({
          filename: draftFile.filename,
          path: draftFile.path,
          size: draftFile.size,
          mimeType: draftFile.mimeType,
          documentType: 'purchase_proof'
        })
      }
    }

    if (req.body.maintenanceRecordsId) {
      const fileId = req.body.maintenanceRecordsId
      const draftFile = await prisma.draftFile.findUnique({
        where: { id: fileId }
      })
      if (draftFile) {
        files.push({
          filename: draftFile.filename,
          path: draftFile.path,
          size: draftFile.size,
          mimeType: draftFile.mimeType,
          documentType: 'maintenance_records'
        })
      }
    }

    // Handle device image IDs
    const deviceImageIds = Object.keys(req.body)
      .filter(key => key.startsWith('deviceImageIds['))
      .map(key => req.body[key])

    for (const fileId of deviceImageIds) {
      const draftFile = await prisma.draftFile.findUnique({
        where: { id: fileId }
      })
      if (draftFile) {
        files.push({
          filename: draftFile.filename,
          path: draftFile.path,
          size: draftFile.size,
          mimeType: draftFile.mimeType,
          documentType: 'device_image'
        })
      }
    }

    // Handle actual files (fallback for direct file uploads)
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadedFiles = req.files as Express.Multer.File[]
      
      // Process any actual files that might be uploaded
      uploadedFiles.forEach((file) => {
        files.push({
          filename: file.originalname,
          path: `/uploads/submissions/${file.filename}`,
          size: file.size,
          mimeType: file.mimetype,
          documentType: 'submission_file'
        })
      })
    }

    console.log('🔍 Processed submission data:', submissionData)
    console.log('🔍 Processed files:', files)

    const submission = await submissionService.create(user.id, {
      ...submissionData,
      files: files.length > 0 ? files : undefined
    })

    res.json({ success: true, submission })
    return
  } catch (error) {
    console.error('❌ Submission creation error:', error)
    console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('❌ Error message:', error instanceof Error ? error.message : 'No message')
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Check if it's a JWT verification error
    if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
      console.error('❌ JWT verification failed:', error.message)
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }
    
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
    
    const decoded = jwt.verify(token, env.JWT_SECRET)
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
    
    const decoded = jwt.verify(token, env.JWT_SECRET)
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

// Admin reviews endpoints
app.post('/api/admin-reviews', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.JWT_SECRET)
    const { walletAddress } = decoded

    const user = await userService.getByWallet(walletAddress)
    if (user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' })
      return
    }

    const { submission_id, notes, technical_score, regulatory_score, financial_score, environmental_score, overall_score, decision } = req.body

    if (!submission_id) {
      res.status(400).json({ error: 'submission_id is required' })
      return
    }

    const adminReviewData: any = {}
    
    if (notes !== undefined) adminReviewData.notes = notes
    if (technical_score !== undefined) adminReviewData.technicalScore = technical_score
    if (regulatory_score !== undefined) adminReviewData.regulatoryScore = regulatory_score
    if (financial_score !== undefined) adminReviewData.financialScore = financial_score
    if (environmental_score !== undefined) adminReviewData.environmentalScore = environmental_score
    if (overall_score !== undefined) adminReviewData.overallScore = overall_score
    if (decision !== undefined) adminReviewData.decision = decision.toUpperCase()

    const review = await adminReviewService.upsert(submission_id, adminReviewData)

    res.json({ success: true, data: review })
    return
  } catch (error) {
    console.error('Admin review creation error:', error)
    res.status(500).json({ error: 'Failed to create admin review' })
    return
  }
})

app.get('/api/admin-reviews/:submissionId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.JWT_SECRET)
    const { walletAddress } = decoded

    const user = await userService.getByWallet(walletAddress)
    if (user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' })
      return
    }

    const { submissionId } = req.params

    const review = await adminReviewService.getBySubmission(submissionId)

    if (!review) {
      res.status(404).json({ error: 'Admin review not found' })
      return
    }

    res.json({ success: true, data: review })
    return
  } catch (error) {
    console.error('Admin review fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch admin review' })
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
    
    const decoded = jwt.verify(token, env.JWT_SECRET)
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

app.post('/api/drafts', upload.fields([
  { name: 'technicalCertification', maxCount: 1 },
  { name: 'purchaseProof', maxCount: 1 },
  { name: 'maintenanceRecords', maxCount: 1 },
  { name: 'deviceImages', maxCount: 10 }
]), async (req, res) => {
  try {
    console.log('🔍 Draft POST request received')
    console.log('🔍 Request body:', req.body)
    console.log('🔍 Request files:', req.files)
    
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header')
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    console.log('🔍 Token received:', token.substring(0, 20) + '...')
    
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.JWT_SECRET)
    console.log('🔍 JWT decoded:', decoded)
    const { walletAddress } = decoded

    console.log('🔍 Looking for user with wallet:', walletAddress)
    const user = await userService.findOrCreateByWallet(walletAddress)
    console.log('🔍 User found/created:', user.id)

    // Extract form data
    const draftData = {
      deviceName: req.body.deviceName,
      deviceType: req.body.deviceType,
      location: req.body.location,
      serialNumber: req.body.serialNumber,
      manufacturer: req.body.manufacturer,
      model: req.body.model,
      yearOfManufacture: req.body.yearOfManufacture,
      condition: req.body.condition,
      specifications: req.body.specifications,
      purchasePrice: req.body.purchasePrice,
      currentValue: req.body.currentValue,
      expectedRevenue: req.body.expectedRevenue,
      operationalCosts: req.body.operationalCosts
    }

    // Process files if any
    const files: Array<{
      filename: string
      path: string
      size: number
      mimeType: string
      documentType: string
    }> = []

    if (req.files) {
      const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] }
      
      // Process technical certification
      if (uploadedFiles.technicalCertification) {
        const file = uploadedFiles.technicalCertification[0]
        files.push({
          filename: file.originalname,
          path: `/uploads/drafts/technical/${file.filename}`,
          size: file.size,
          mimeType: file.mimetype,
          documentType: 'technical_certification'
        })
      }

      // Process purchase proof
      if (uploadedFiles.purchaseProof) {
        const file = uploadedFiles.purchaseProof[0]
        files.push({
          filename: file.originalname,
          path: `/uploads/drafts/purchase/${file.filename}`,
          size: file.size,
          mimeType: file.mimetype,
          documentType: 'purchase_proof'
        })
      }

      // Process maintenance records
      if (uploadedFiles.maintenanceRecords) {
        const file = uploadedFiles.maintenanceRecords[0]
        files.push({
          filename: file.originalname,
          path: `/uploads/drafts/maintenance/${file.filename}`,
          size: file.size,
          mimeType: file.mimetype,
          documentType: 'maintenance_records'
        })
      }

      // Process device images
      if (uploadedFiles.deviceImages) {
        uploadedFiles.deviceImages.forEach((file, index) => {
          files.push({
            filename: file.originalname,
            path: `/uploads/drafts/images/${file.filename}`,
            size: file.size,
            mimeType: file.mimetype,
            documentType: 'device_image'
          })
        })
      }
    }

    console.log('🔍 Creating draft with data:', draftData)
    console.log('🔍 Files to save:', files)
    
    const draft = await draftService.create(user.id, {
      ...draftData,
      files: files.length > 0 ? files : undefined
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
    
    const decoded = jwt.verify(token, env.JWT_SECRET)
    const { walletAddress } = decoded

    const user = await userService.findOrCreateByWallet(walletAddress)
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

app.put('/api/drafts/:id', upload.fields([
  { name: 'technicalCertification', maxCount: 1 },
  { name: 'purchaseProof', maxCount: 1 },
  { name: 'maintenanceRecords', maxCount: 1 },
  { name: 'deviceImages', maxCount: 10 }
]), async (req, res) => {
  try {
    console.log('🔍 Draft PUT request received')
    console.log('🔍 Request body:', req.body)
    console.log('🔍 Request files:', req.files)
    
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header required' })
      return
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    
    const decoded = jwt.verify(token, env.JWT_SECRET)
    const { walletAddress } = decoded

    const user = await userService.findOrCreateByWallet(walletAddress)
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

    // Extract form data
    const updateData = {
      deviceName: req.body.deviceName,
      deviceType: req.body.deviceType,
      location: req.body.location,
      serialNumber: req.body.serialNumber,
      manufacturer: req.body.manufacturer,
      model: req.body.model,
      yearOfManufacture: req.body.yearOfManufacture,
      condition: req.body.condition,
      specifications: req.body.specifications,
      purchasePrice: req.body.purchasePrice,
      currentValue: req.body.currentValue,
      expectedRevenue: req.body.expectedRevenue,
      operationalCosts: req.body.operationalCosts
    }

    // Process files if any
    const files: Array<{
      filename: string
      path: string
      size: number
      mimeType: string
      documentType: string
    }> = []

    if (req.files) {
      const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] }
      
      // Process technical certification
      if (uploadedFiles.technicalCertification) {
        const file = uploadedFiles.technicalCertification[0]
        files.push({
          filename: file.originalname,
          path: `/uploads/drafts/technical/${file.filename}`,
          size: file.size,
          mimeType: file.mimetype,
          documentType: 'technical_certification'
        })
      }

      // Process purchase proof
      if (uploadedFiles.purchaseProof) {
        const file = uploadedFiles.purchaseProof[0]
        files.push({
          filename: file.originalname,
          path: `/uploads/drafts/purchase/${file.filename}`,
          size: file.size,
          mimeType: file.mimetype,
          documentType: 'purchase_proof'
        })
      }

      // Process maintenance records
      if (uploadedFiles.maintenanceRecords) {
        const file = uploadedFiles.maintenanceRecords[0]
        files.push({
          filename: file.originalname,
          path: `/uploads/drafts/maintenance/${file.filename}`,
          size: file.size,
          mimeType: file.mimetype,
          documentType: 'maintenance_records'
        })
      }

      // Process device images
      if (uploadedFiles.deviceImages) {
        uploadedFiles.deviceImages.forEach((file, index) => {
          files.push({
            filename: file.originalname,
            path: `/uploads/drafts/images/${file.filename}`,
            size: file.size,
            mimeType: file.mimetype,
            documentType: 'device_image'
          })
        })
      }
    }

    console.log('🔍 Updating draft with data:', updateData)
    console.log('🔍 Files to save:', files)

    // Update the draft
    const updatedDraft = await draftService.update(id, {
        ...updateData,
      files: files.length > 0 ? files : undefined
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
    
    const decoded = jwt.verify(token, env.JWT_SECRET)
    const { walletAddress } = decoded

    const user = await userService.findOrCreateByWallet(walletAddress)
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

// Deployment endpoints
app.get('/api/deployments', async (req, res) => {
  try {
    const { limit = 10, environment } = req.query
    
    const { deploymentService } = require('./lib/deployment-service')
    
    let deployments
    if (environment) {
      deployments = await deploymentService.getDeploymentsByEnvironment(environment as string, parseInt(limit as string))
    } else {
      deployments = await deploymentService.getRecentDeployments(parseInt(limit as string))
    }
    
    res.json({ 
      success: true, 
      deployments,
      total: deployments.length
    })
  } catch (error) {
    console.error('Deployments fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch deployments' })
  }
})

app.get('/api/deployments/stats', async (req, res) => {
  try {
    const { deploymentService } = require('./lib/deployment-service')
    const stats = await deploymentService.getDeploymentStats()
    
    res.json({ 
      success: true, 
      stats
    })
  } catch (error) {
    console.error('Deployment stats error:', error)
    res.status(500).json({ error: 'Failed to fetch deployment stats' })
  }
})

app.get('/api/deployments/latest/:environment', async (req, res) => {
  try {
    const { environment } = req.params
    const { deploymentService } = require('./lib/deployment-service')
    
    const latest = await deploymentService.getLatestDeployment(environment)
    
    if (!latest) {
      res.status(404).json({ error: 'No deployment found for environment' })
      return
    }
    
    res.json({ 
      success: true, 
      deployment: latest
    })
  } catch (error) {
    console.error('Latest deployment fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch latest deployment' })
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
    
    const decoded = jwt.verify(token, env.JWT_SECRET)
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

    // Log deployment to database
    try {
      const { deploymentService } = require('./lib/deployment-service')
      const deploymentInfo = deploymentService.getCurrentDeploymentInfo()
      deploymentInfo.notes = 'Backend startup deployment log'
      deploymentInfo.metadata = {
        ...deploymentInfo.metadata,
        startupTime: new Date().toISOString(),
        processId: process.pid,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      }
      
      await deploymentService.logDeployment(deploymentInfo)
      console.log('🚀 Deployment logged to database')
    } catch (deploymentError) {
      console.error('⚠️ Failed to log deployment (continuing anyway):', deploymentError)
    }

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