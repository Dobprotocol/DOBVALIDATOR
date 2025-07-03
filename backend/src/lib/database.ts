import { PrismaClient } from '@prisma/client'

// Global Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// =====================
// USER & PROFILE SERVICES
// =====================

export const userService = {
  // Create or find user by wallet address
  async findOrCreateByWallet(walletAddress: string, data?: { email?: string; name?: string; company?: string }) {
    return prisma.user.upsert({
      where: { walletAddress },
      update: data ? { ...data, updatedAt: new Date() } : { updatedAt: new Date() },
      create: {
        walletAddress,
        email: data?.email,
        name: data?.name,
        company: data?.company,
      },
      include: { profile: true }
    })
  },

  // Get user by wallet address
  async getByWallet(walletAddress: string) {
    return prisma.user.findUnique({
      where: { walletAddress },
      include: { profile: true }
    })
  },

  // Update user
  async update(walletAddress: string, data: { email?: string; name?: string; company?: string }) {
    return prisma.user.update({
      where: { walletAddress },
      data: { ...data, updatedAt: new Date() },
      include: { profile: true }
    })
  }
}

export const profileService = {
  // Create or update profile
  async create(userId: string, data: { name: string; company?: string; email: string; walletAddress: string }) {
    return prisma.profile.upsert({
      where: { userId },
      update: {
        ...data,
        updatedAt: new Date()
      },
      create: {
        userId,
        ...data
      }
    })
  },

  // Get profile by wallet address
  async getByWallet(walletAddress: string) {
    return prisma.profile.findUnique({
      where: { walletAddress }
    })
  },

  // Update profile
  async update(walletAddress: string, data: { name?: string; company?: string; email?: string }) {
    return prisma.profile.update({
      where: { walletAddress },
      data: { ...data, updatedAt: new Date() }
    })
  }
}

// =====================
// SUBMISSION SERVICES
// =====================

// Helper function to convert status to Prisma enum
function mapStatusToPrismaEnum(status: string): 'DRAFT' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | undefined {
  const statusMap: Record<string, 'DRAFT' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'> = {
    'draft': 'DRAFT',
    'pending': 'PENDING',
    'under_review': 'UNDER_REVIEW',
    'under review': 'UNDER_REVIEW',
    'approved': 'APPROVED',
    'rejected': 'REJECTED'
  }
  
  return statusMap[status.toLowerCase()]
}

export const submissionService = {
  // Create submission
  async create(userId: string, data: {
    deviceName: string
    deviceType: string
    location: string
    serialNumber: string
    manufacturer: string
    model: string
    yearOfManufacture: string
    condition: string
    specifications: string
    purchasePrice: string
    currentValue: string
    expectedRevenue: string
    operationalCosts: string
    files?: Array<{
      filename: string
      path: string
      size: number
      mimeType: string
      documentType: string
    }>
  }) {
    return prisma.submission.create({
      data: {
        userId,
        ...data,
        files: data.files ? {
          create: data.files
        } : undefined
      },
      include: {
        files: true,
        adminReview: true,
        certificate: true,
        user: {
          select: {
            walletAddress: true,
            name: true,
            email: true
          }
        }
      }
    })
  },

  // Get submission by ID
  async getById(id: string) {
    return prisma.submission.findUnique({
      where: { id },
      include: {
        files: true,
        adminReview: true,
        certificate: true,
        user: {
          select: {
            walletAddress: true,
            name: true,
            email: true
          }
        }
      }
    })
  },

  // Get submissions by user
  async getByUser(walletAddress: string, options?: {
    status?: string
    limit?: number
    offset?: number
  }) {
    const where: any = {
      user: { walletAddress }
    }
    
    if (options?.status) {
      const mappedStatus = mapStatusToPrismaEnum(options.status)
      if (mappedStatus) {
        where.status = mappedStatus
      }
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          files: true,
          adminReview: true,
          certificate: true,
          user: {
            select: {
              walletAddress: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' },
        take: options?.limit || 10,
        skip: options?.offset || 0
      }),
      prisma.submission.count({ where })
    ])

    return {
      submissions,
      total,
      hasMore: (options?.offset || 0) + (options?.limit || 10) < total
    }
  },

  // Get all submissions (admin only)
  async getAll(options?: {
    status?: string
    limit?: number
    offset?: number
  }) {
    const where: any = {}
    if (options?.status) {
      const mappedStatus = mapStatusToPrismaEnum(options.status)
      if (mappedStatus) {
        where.status = mappedStatus
      }
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          files: true,
          adminReview: true,
          certificate: true,
          user: {
            select: {
              walletAddress: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' },
        take: options?.limit || 10,
        skip: options?.offset || 0
      }),
      prisma.submission.count({ where })
    ])

    return {
      submissions,
      total,
      hasMore: (options?.offset || 0) + (options?.limit || 10) < total
    }
  },

  // Update submission
  async update(id: string, data: any) {
    const { adminNotes, status, ...submissionData } = data
    
    // Map status to Prisma enum if provided
    if (status) {
      const mappedStatus = mapStatusToPrismaEnum(status)
      if (mappedStatus) {
        submissionData.status = mappedStatus
      }
    }
    
    // If adminNotes are provided, create or update AdminReview
    if (adminNotes !== undefined) {
      await prisma.adminReview.upsert({
        where: { submissionId: id },
        update: { notes: adminNotes },
        create: {
          submissionId: id,
          notes: adminNotes
        }
      })
    }

    return prisma.submission.update({
      where: { id },
      data: { ...submissionData, updatedAt: new Date() },
      include: {
        files: true,
        adminReview: true,
        certificate: true,
        user: {
          select: {
            walletAddress: true,
            name: true,
            email: true
          }
        }
      }
    })
  },

  // Delete submission
  async delete(id: string) {
    return prisma.submission.delete({
      where: { id }
    })
  }
}

// =====================
// DRAFT SERVICES
// =====================

export const draftService = {
  // Create draft
  async create(userId: string, data: {
    deviceName?: string
    deviceType?: string
    serialNumber?: string
    manufacturer?: string
    model?: string
    yearOfManufacture?: string
    condition?: string
    specifications?: string
    purchasePrice?: string
    currentValue?: string
    expectedRevenue?: string
    operationalCosts?: string
    files?: Array<{
      filename: string
      path: string
      size: number
      mimeType: string
      documentType: string
    }>
  }) {
    return prisma.draft.create({
      data: {
        userId,
        ...data,
        files: data.files ? {
          create: data.files
        } : undefined
      },
      include: {
        files: true
      }
    })
  },

  // Get draft by ID
  async getById(id: string) {
    return prisma.draft.findUnique({
      where: { id },
      include: {
        files: true,
        user: {
          select: {
            walletAddress: true,
            name: true,
            email: true
          }
        }
      }
    })
  },

  // Get drafts by user
  async getByUser(walletAddress: string, options?: {
    limit?: number
    offset?: number
  }) {
    const [drafts, total] = await Promise.all([
      prisma.draft.findMany({
        where: {
          user: { walletAddress }
        },
        include: {
          files: true
        },
        orderBy: { updatedAt: 'desc' },
        take: options?.limit || 10,
        skip: options?.offset || 0
      }),
      prisma.draft.count({
        where: {
          user: { walletAddress }
        }
      })
    ])

    return {
      drafts,
      total,
      hasMore: (options?.offset || 0) + (options?.limit || 10) < total
    }
  },

  // Update draft
  async update(id: string, data: any) {
    return prisma.draft.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      include: {
        files: true
      }
    })
  },

  // Delete draft
  async delete(id: string) {
    return prisma.draft.delete({
      where: { id }
    })
  }
}

// =====================
// AUTHENTICATION SERVICES
// =====================

export const authService = {
  // Create challenge
  async createChallenge(walletAddress: string, challenge: string, expiresAt: Date) {
    return prisma.authChallenge.create({
      data: {
        walletAddress,
        challenge,
        expiresAt
      }
    })
  },

  // Get challenge
  async getChallenge(challenge: string) {
    return prisma.authChallenge.findUnique({
      where: { challenge }
    })
  },

  // Delete challenge
  async deleteChallenge(challenge: string) {
    return prisma.authChallenge.delete({
      where: { challenge }
    })
  },

  // Create session
  async createSession(walletAddress: string, token: string, expiresAt: Date) {
    return prisma.authSession.create({
      data: {
        walletAddress,
        token,
        expiresAt
      }
    })
  },

  // Get session
  async getSession(token: string) {
    return prisma.authSession.findUnique({
      where: { token }
    })
  },

  // Delete session
  async deleteSession(token: string) {
    return prisma.authSession.delete({
      where: { token }
    })
  },

  // Clean expired sessions and challenges
  async cleanupExpired() {
    const now = new Date()
    
    await Promise.all([
      prisma.authSession.deleteMany({
        where: { expiresAt: { lt: now } }
      }),
      prisma.authChallenge.deleteMany({
        where: { expiresAt: { lt: now } }
      })
    ])
  }
}

// =====================
// CERTIFICATE SERVICES
// =====================

export const certificateService = {
  // Create certificate
  async create(submissionId: string, userId: string, data: {
    certificateHash: string
    stellarTxHash?: string
    expiresAt?: Date
  }) {
    return prisma.certificate.create({
      data: {
        submissionId,
        userId,
        ...data
      },
      include: {
        submission: {
          include: {
            user: {
              select: {
                walletAddress: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })
  },

  // Get certificate by hash
  async getByHash(certificateHash: string) {
    return prisma.certificate.findUnique({
      where: { certificateHash },
      include: {
        submission: {
          include: {
            user: {
              select: {
                walletAddress: true,
                name: true,
                email: true
              }
            },
            files: true
          }
        }
      }
    })
  },

  // Get certificates by user
  async getByUser(walletAddress: string) {
    return prisma.certificate.findMany({
      where: {
        user: { walletAddress }
      },
      include: {
        submission: {
          include: {
            files: true
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    })
  }
}

// =====================
// ADMIN REVIEW SERVICES
// =====================

export const adminReviewService = {
  // Create or update admin review
  async upsert(submissionId: string, data: {
    notes?: string
    technicalScore?: number
    regulatoryScore?: number
    financialScore?: number
    environmentalScore?: number
    overallScore?: number
    decision?: 'APPROVED' | 'REJECTED'
    decisionAt?: Date
  }) {
    return prisma.adminReview.upsert({
      where: { submissionId },
      update: {
        ...data,
        reviewedAt: new Date()
      },
      create: {
        submissionId,
        ...data,
        reviewedAt: new Date()
      }
    })
  },

  // Get admin review
  async getBySubmission(submissionId: string) {
    return prisma.adminReview.findUnique({
      where: { submissionId }
    })
  }
} 