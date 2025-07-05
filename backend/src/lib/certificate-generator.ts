import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { Submission, User, Profile, AdminReview } from '@prisma/client'

interface CertificateData {
  submission: Submission & {
    user: User & { profile: Profile | null }
    adminReview: AdminReview | null
  }
  certificateHash: string
  stellarTxHash?: string
  issuedAt: Date
  expiresAt?: Date
}

interface CertificateTemplate {
  backgroundColor: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  logoPath?: string
}

export class CertificateGenerator {
  private defaultTemplate: CertificateTemplate = {
    backgroundColor: '#FFFFFF',
    primaryColor: '#1F2937',
    secondaryColor: '#6B7280',
    accentColor: '#10B981',
    fontFamily: 'Helvetica',
    logoPath: path.join(__dirname, '../../assets/dob-logo.png')
  }

  async generateCertificate(data: CertificateData, template?: Partial<CertificateTemplate>): Promise<Buffer> {
    const mergedTemplate = { ...this.defaultTemplate, ...template }
    
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        })

        const chunks: Buffer[] = []
        doc.on('data', (chunk) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))

        this.renderCertificate(doc, data, mergedTemplate)
        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  private renderCertificate(doc: PDFKit.PDFDocument, data: CertificateData, template: CertificateTemplate) {
    // Background
    this.renderBackground(doc, template)
    
    // Header with logo
    this.renderHeader(doc, data, template)
    
    // Certificate content
    this.renderCertificateContent(doc, data, template)
    
    // Footer with verification info
    this.renderFooter(doc, data, template)
    
    // QR Code for verification
    this.renderQRCode(doc, data, template)
  }

  private renderBackground(doc: PDFKit.PDFDocument, template: CertificateTemplate) {
    // Gradient background
    const gradient = doc.linearGradient(0, 0, doc.page.width, doc.page.height)
    gradient.stop(0, template.backgroundColor)
    gradient.stop(1, '#F8FAFC')
    
    doc.rect(0, 0, doc.page.width, doc.page.height)
    doc.fill(gradient)
    
    // Decorative border
    doc.strokeColor(template.accentColor)
    doc.lineWidth(3)
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    doc.stroke()
  }

  private renderHeader(doc: PDFKit.PDFDocument, data: CertificateData, template: CertificateTemplate) {
    // Logo
    if (template.logoPath && fs.existsSync(template.logoPath)) {
      doc.image(template.logoPath, 60, 60, { width: 80, height: 80 })
    }
    
    // Title
    doc.fontSize(36)
    doc.font(template.fontFamily)
    doc.fillColor(template.primaryColor)
    doc.text('TRUFA CERTIFICATION', doc.page.width / 2, 80, { align: 'center' })
    
    // Subtitle
    doc.fontSize(18)
    doc.fillColor(template.secondaryColor)
    doc.text('DOB Protocol Validator', doc.page.width / 2, 120, { align: 'center' })
  }

  private renderCertificateContent(doc: PDFKit.PDFDocument, data: CertificateData, template: CertificateTemplate) {
    const centerX = doc.page.width / 2
    const startY = 180
    
    // Certificate ID
    doc.fontSize(14)
    doc.fillColor(template.secondaryColor)
    doc.text('Certificate ID:', centerX - 200, startY, { align: 'left' })
    doc.fontSize(12)
    doc.fillColor(template.primaryColor)
    doc.text(data.certificateHash, centerX - 200, startY + 20, { align: 'left' })
    
    // Device Information
    doc.fontSize(16)
    doc.fillColor(template.primaryColor)
    doc.text('Device Information', centerX, startY, { align: 'center' })
    
    const deviceInfo = [
      { label: 'Device Name:', value: data.submission.deviceName },
      { label: 'Device Type:', value: data.submission.deviceType },
      { label: 'Manufacturer:', value: data.submission.manufacturer },
      { label: 'Model:', value: data.submission.model },
      { label: 'Serial Number:', value: data.submission.serialNumber },
      { label: 'Location:', value: data.submission.location }
    ]
    
    let yOffset = startY + 40
    deviceInfo.forEach((info, index) => {
      const x = index < 3 ? centerX - 200 : centerX + 50
      const y = startY + 40 + (index % 3) * 25
      
      doc.fontSize(10)
      doc.fillColor(template.secondaryColor)
      doc.text(info.label, x, y, { align: 'left' })
      doc.fontSize(12)
      doc.fillColor(template.primaryColor)
      doc.text(info.value, x, y + 15, { align: 'left' })
    })
    
    // Operator Information
    const operator = data.submission.user
    const profile = operator.profile
    
    doc.fontSize(16)
    doc.fillColor(template.primaryColor)
    doc.text('Operator Information', centerX, startY + 200, { align: 'center' })
    
    const operatorInfo = [
      { label: 'Operator Name:', value: profile?.name || operator.name || 'N/A' },
      { label: 'Company:', value: profile?.company || operator.company || 'N/A' },
      { label: 'Email:', value: profile?.email || operator.email || 'N/A' },
      { label: 'Wallet Address:', value: operator.walletAddress }
    ]
    
    operatorInfo.forEach((info, index) => {
      const x = index < 2 ? centerX - 200 : centerX + 50
      const y = startY + 240 + (index % 2) * 25
      
      doc.fontSize(10)
      doc.fillColor(template.secondaryColor)
      doc.text(info.label, x, y, { align: 'left' })
      doc.fontSize(12)
      doc.fillColor(template.primaryColor)
      doc.text(info.value, x, y + 15, { align: 'left' })
    })
    
    // TRUFA Scores
    if (data.submission.adminReview) {
      this.renderTRUFAScores(doc, data.submission.adminReview, template, centerX, startY + 320)
    }
    
    // Validation Details
    doc.fontSize(16)
    doc.fillColor(template.primaryColor)
    doc.text('Validation Details', centerX, startY + 420, { align: 'center' })
    
    const validationInfo = [
      { label: 'Issued Date:', value: data.issuedAt.toLocaleDateString() },
      { label: 'Status:', value: 'ACTIVE' },
      { label: 'Decision:', value: data.submission.adminReview?.decision || 'N/A' }
    ]
    
    if (data.expiresAt) {
      validationInfo.push({ label: 'Expires:', value: data.expiresAt.toLocaleDateString() })
    }
    
    validationInfo.forEach((info, index) => {
      const x = index < 2 ? centerX - 200 : centerX + 50
      const y = startY + 460 + (index % 2) * 25
      
      doc.fontSize(10)
      doc.fillColor(template.secondaryColor)
      doc.text(info.label, x, y, { align: 'left' })
      doc.fontSize(12)
      doc.fillColor(template.primaryColor)
      doc.text(info.value, x, y + 15, { align: 'left' })
    })
  }

  private renderTRUFAScores(doc: PDFKit.PDFDocument, review: AdminReview, template: CertificateTemplate, centerX: number, startY: number) {
    doc.fontSize(16)
    doc.fillColor(template.primaryColor)
    doc.text('TRUFA Assessment Scores', centerX, startY, { align: 'center' })
    
    const scores = [
      { label: 'Technical Score:', value: review.technicalScore || 0, color: '#10B981' },
      { label: 'Regulatory Score:', value: review.regulatoryScore || 0, color: '#3B82F6' },
      { label: 'Financial Score:', value: review.financialScore || 0, color: '#F59E0B' },
      { label: 'Environmental Score:', value: review.environmentalScore || 0, color: '#8B5CF6' },
      { label: 'Overall Score:', value: review.overallScore || 0, color: template.accentColor }
    ]
    
    scores.forEach((score, index) => {
      const x = index < 3 ? centerX - 200 : centerX + 50
      const y = startY + 40 + (index % 3) * 30
      
      doc.fontSize(10)
      doc.fillColor(template.secondaryColor)
      doc.text(score.label, x, y, { align: 'left' })
      
      // Score bar
      const barWidth = 120
      const barHeight = 8
      const scorePercentage = score.value / 100
      
      doc.rect(x, y + 15, barWidth, barHeight)
      doc.strokeColor('#E5E7EB')
      doc.lineWidth(1)
      doc.stroke()
      
      doc.rect(x, y + 15, barWidth * scorePercentage, barHeight)
      doc.fillColor(score.color)
      doc.fill()
      
      doc.fontSize(12)
      doc.fillColor(template.primaryColor)
      doc.text(`${score.value}/100`, x + barWidth + 10, y + 15, { align: 'left' })
    })
  }

  private renderFooter(doc: PDFKit.PDFDocument, data: CertificateData, template: CertificateTemplate) {
    const footerY = doc.page.height - 80
    
    // Verification URL
    doc.fontSize(10)
    doc.fillColor(template.secondaryColor)
    doc.text('Verify this certificate at:', 60, footerY, { align: 'left' })
    doc.fontSize(12)
    doc.fillColor(template.accentColor)
    doc.text(`https://validator.dobprotocol.com/verify/${data.certificateHash}`, 60, footerY + 15, { align: 'left' })
    
    // Stellar Transaction
    if (data.stellarTxHash) {
      doc.fontSize(10)
      doc.fillColor(template.secondaryColor)
      doc.text('Blockchain TX:', doc.page.width - 300, footerY, { align: 'left' })
      doc.fontSize(12)
      doc.fillColor(template.primaryColor)
      doc.text(data.stellarTxHash, doc.page.width - 300, footerY + 15, { align: 'left' })
    }
  }

  private renderQRCode(doc: PDFKit.PDFDocument, data: CertificateData, template: CertificateTemplate) {
    // Generate QR code for verification
    const verificationUrl = `https://validator.dobprotocol.com/verify/${data.certificateHash}`
    
    // For now, we'll create a placeholder QR code area
    // In production, you'd use a QR code library like 'qrcode'
    const qrSize = 80
    const qrX = doc.page.width - 120
    const qrY = doc.page.height - 120
    
    doc.rect(qrX, qrY, qrSize, qrSize)
    doc.strokeColor(template.primaryColor)
    doc.lineWidth(2)
    doc.stroke()
    
    doc.fontSize(8)
    doc.fillColor(template.secondaryColor)
    doc.text('QR Code', qrX + qrSize/2, qrY + qrSize + 10, { align: 'center' })
  }

  async saveCertificate(buffer: Buffer, filename: string): Promise<string> {
    const uploadDir = path.join(__dirname, '../../uploads/certificates')
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    const filePath = path.join(uploadDir, filename)
    fs.writeFileSync(filePath, buffer)
    
    return filePath
  }
}

export const certificateGenerator = new CertificateGenerator() 