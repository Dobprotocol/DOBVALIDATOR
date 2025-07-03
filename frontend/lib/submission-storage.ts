// Shared submission storage for API endpoints
// This will be replaced with database integration later

export interface Submission {
  id: string
  name: string // Add name field for meaningful draft names
  deviceName: string
  deviceType: string
  customDeviceType: string
  location: string
  yearOfManufacture: string
  condition: string
  specifications: string
  purchasePrice: string
  currentValue: string
  expectedRevenue: string
  operationalCosts: string
  operatorWallet: string
  status: 'pending' | 'under review' | 'approved' | 'rejected' | 'draft'
  submittedAt: string
  updatedAt: string
  files: Array<{
    filename: string
    path: string
    documentType: string
  }>
  // Admin fields
  adminNotes: string | null
  adminScore: number | null
  adminDecision: 'approved' | 'rejected' | null
  adminDecisionAt: string | null
  certificateId: string | null
}

// In-memory storage (replace with database later)
const submissions = new Map<string, Submission>()

export const submissionStorage = {
  // Create a new submission
  create: (submission: Submission): Submission => {
    submissions.set(submission.id, submission)
    return submission
  },

  // Get a submission by ID
  get: (id: string): Submission | undefined => {
    return submissions.get(id)
  },

  // Get a submission by ID (alias for get)
  getById: (id: string): Submission | undefined => {
    return submissions.get(id)
  },

  // Get all submissions for a wallet address
  getByWallet: (walletAddress: string): Submission[] => {
    return Array.from(submissions.values())
      .filter(sub => sub.operatorWallet === walletAddress)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  },

  // Get all submissions (for admin)
  getAll: (): Submission[] => {
    return Array.from(submissions.values())
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  },

  // Update a submission
  update: (id: string, updates: Partial<Submission>): Submission | null => {
    const submission = submissions.get(id)
    if (!submission) return null
    
    const updatedSubmission = {
      ...submission,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    submissions.set(id, updatedSubmission)
    return updatedSubmission
  },

  // Delete a submission
  delete: (id: string): boolean => {
    return submissions.delete(id)
  },

  // Get submissions with pagination and filtering
  getPaginated: (options: {
    walletAddress?: string
    status?: string
    limit?: number
    offset?: number
    excludeDrafts?: boolean
  }): { submissions: Submission[], total: number, hasMore: boolean } => {
    let filteredSubmissions = Array.from(submissions.values())
    
    // Filter by wallet address
    if (options.walletAddress) {
      filteredSubmissions = filteredSubmissions.filter(sub => sub.operatorWallet === options.walletAddress)
    }
    
    // Filter by status
    if (options.status) {
      filteredSubmissions = filteredSubmissions.filter(sub => sub.status === options.status)
    }
    
    // Exclude drafts if requested
    if (options.excludeDrafts) {
      filteredSubmissions = filteredSubmissions.filter(sub => sub.status !== 'draft')
    }
    
    // Sort by submission date (newest first)
    filteredSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    
    const total = filteredSubmissions.length
    const limit = options.limit || 10
    const offset = options.offset || 0
    
    // Apply pagination
    const paginatedSubmissions = filteredSubmissions.slice(offset, offset + limit)
    
    return {
      submissions: paginatedSubmissions,
      total,
      hasMore: offset + limit < total
    }
  }
} 