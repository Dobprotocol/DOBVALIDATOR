import { prisma } from './database'
import { certificateGenerator } from './certificate-generator'
import { emailService } from './email-service'
import { Submission, User, Profile, AdminReview, Certificate } from '@prisma/client'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

interface CertificateGenerationRequest {
  submissionId: string
  stellarTxHash?: string
  adminWalletAddress: string
}

interface CertificateGenerationResult {
  success: boolean
  certificate?: Certificate
  certificatePath?: string
  emailSent?: boolean
  error?: string
}

export class CertificateService {
  async generateAndSendCertificate(request: CertificateGenerationRequest): Promise<CertificateGenerationResult> {
    try {
      console.log('🏆 Starting certificate generation for submission:', request.submissionId)

      // 1. Fetch submission with all related data
      const submission = await prisma.submission.findUnique({
        where: { id: request.submissionId },
        include: {
          user: {
            include: {
              profile: true
            }
          },
          adminReview: true,
          certificate: true
        }
      })

      if (!submission) {
        throw new Error('Submission not found')
      }

      if (submission.status !== 'APPROVED') {
        throw new Error('Submission must be approved before generating certificate')
      }

      if (submission.certificate) {
        throw new Error('Certificate already exists for this submission')
      }

      // 2. Generate certificate hash
      const certificateHash = this.generateCertificateHash(submission, request.adminWalletAddress)

      // 3. Generate PDF certificate
      const pdfBuffer = await certificateGenerator.generateCertificate({
        submission,
        certificateHash,
        stellarTxHash: request.stellarTxHash,
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year validity
      })

      // 4. Save PDF to file system
      const filename = `DOB_Certificate_${certificateHash}.pdf`
      const certificatePath = await certificateGenerator.saveCertificate(pdfBuffer, filename)

      // 5. Create certificate record in database
      const certificate = await prisma.certificate.create({
        data: {
          certificateHash,
          stellarTxHash: request.stellarTxHash,
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
          submissionId: submission.id,
          userId: submission.userId
        },
        include: {
          submission: {
            include: {
              user: {
                include: {
                  profile: true
                }
              },
              adminReview: true
            }
          }
        }
      })

      console.log('✅ Certificate created in database:', certificate.id)

      // 6. Send email with certificate
      const emailSent = await emailService.sendCertificateEmail({
        submission: submission as any,
        certificateHash,
        stellarTxHash: request.stellarTxHash ?? undefined,
        certificatePath,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt ?? undefined
      })

      if (emailSent) {
        console.log('✅ Certificate email sent successfully')
      } else {
        console.warn('⚠️ Failed to send certificate email')
      }

      return {
        success: true,
        certificate,
        certificatePath,
        emailSent
      }

    } catch (error) {
      console.error('❌ Certificate generation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private generateCertificateHash(submission: Submission & {
    user: User & { profile: Profile | null }
    adminReview: AdminReview | null
  }, adminWalletAddress: string): string {
    const data = {
      submissionId: submission.id,
      deviceName: submission.deviceName,
      deviceType: submission.deviceType,
      operatorWallet: submission.user.walletAddress,
      validatorWallet: adminWalletAddress,
      issuedAt: new Date().toISOString(),
      trufaScore: submission.adminReview?.overallScore || 0
    }

    const hashInput = JSON.stringify(data, Object.keys(data).sort())
    return `DOB_CERT_${crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 16)}`
  }

  async getCertificateByHash(certificateHash: string): Promise<Certificate | null> {
    return prisma.certificate.findUnique({
      where: { certificateHash },
      include: {
        submission: {
          include: {
            user: {
              include: {
                profile: true
              }
            },
            adminReview: true
          }
        }
      }
    })
  }

  async getCertificatesByUser(walletAddress: string): Promise<Certificate[]> {
    return prisma.certificate.findMany({
      where: {
        user: { walletAddress }
      },
      include: {
        submission: {
          include: {
            adminReview: true
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    })
  }

  async verifyCertificate(certificateHash: string): Promise<{
    valid: boolean
    certificate?: Certificate
    error?: string
  }> {
    try {
      const certificate = await this.getCertificateByHash(certificateHash)
      
      if (!certificate) {
        return { valid: false, error: 'Certificate not found' }
      }

      if (certificate.status !== 'ACTIVE') {
        return { valid: false, error: `Certificate is ${certificate.status.toLowerCase()}` }
      }

      if (certificate.expiresAt && certificate.expiresAt < new Date()) {
        return { valid: false, error: 'Certificate has expired' }
      }

      return { valid: true, certificate }
    } catch (error) {
      return { valid: false, error: 'Verification failed' }
    }
  }

  async revokeCertificate(certificateHash: string, reason: string): Promise<boolean> {
    try {
      await prisma.certificate.update({
        where: { certificateHash },
        data: {
          status: 'REVOKED',
          expiresAt: new Date() // Immediate expiration
        }
      })

      console.log(`✅ Certificate ${certificateHash} revoked: ${reason}`)
      return true
    } catch (error) {
      console.error('❌ Failed to revoke certificate:', error)
      return false
    }
  }

  async resendCertificateEmail(certificateHash: string): Promise<boolean> {
    try {
      const certificate = await this.getCertificateByHash(certificateHash)
      
      if (!certificate) {
        throw new Error('Certificate not found')
      }

      const certificatePath = path.join(__dirname, '../../uploads/certificates', `DOB_Certificate_${certificateHash}.pdf`)
      
      if (!fs.existsSync(certificatePath)) {
        throw new Error('Certificate PDF file not found')
      }

      const emailSent = await emailService.sendCertificateEmail({
        submission: (certificate as any).submission,
        certificateHash,
        stellarTxHash: certificate.stellarTxHash ?? undefined,
        certificatePath,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt ?? undefined
      })

      return emailSent
    } catch (error) {
      console.error('❌ Failed to resend certificate email:', error)
      return false
    }
  }

  async getCertificateStats(): Promise<{
    total: number
    active: number
    expired: number
    revoked: number
  }> {
    const [total, active, expired, revoked] = await Promise.all([
      prisma.certificate.count(),
      prisma.certificate.count({ where: { status: 'ACTIVE' } }),
      prisma.certificate.count({ 
        where: { 
          status: 'ACTIVE',
          expiresAt: { lt: new Date() }
        } 
      }),
      prisma.certificate.count({ where: { status: 'REVOKED' } })
    ])

    return { total, active, expired, revoked }
  }
}

export const certificateService = new CertificateService() 