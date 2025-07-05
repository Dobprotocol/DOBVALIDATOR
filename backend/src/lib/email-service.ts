import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { Submission, User, Profile, AdminReview } from '@prisma/client'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
  replyTo?: string
}

interface CertificateEmailData {
  submission: Submission & {
    user: User & { profile: Profile | null }
    adminReview: AdminReview | null
  }
  certificateHash: string
  stellarTxHash?: string
  certificatePath: string
  issuedAt: Date
  expiresAt?: Date
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export class EmailService {
  private transporter: nodemailer.Transporter
  private config: EmailConfig

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      from: process.env.SMTP_FROM || 'noreply@dobprotocol.com',
      replyTo: process.env.SMTP_REPLY_TO
    }

    this.transporter = nodemailer.createTransport(this.config)
  }

  async sendCertificateEmail(data: CertificateEmailData): Promise<boolean> {
    try {
      const template = this.generateCertificateEmailTemplate(data)
      const recipientEmail = data.submission.user.profile?.email || data.submission.user.email

      if (!recipientEmail) {
        throw new Error('No recipient email found')
      }

      const mailOptions = {
        from: this.config.from,
        to: recipientEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
        attachments: [
          {
            filename: `DOB_Certificate_${data.certificateHash}.pdf`,
            path: data.certificatePath,
            contentType: 'application/pdf'
          }
        ]
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('✅ Certificate email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('❌ Failed to send certificate email:', error)
      return false
    }
  }

  private generateCertificateEmailTemplate(data: CertificateEmailData): EmailTemplate {
    const operator = data.submission.user
    const profile = operator.profile
    const review = data.submission.adminReview

    const subject = `Your DOB Protocol Certificate - ${data.submission.deviceName}`

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DOB Protocol Certificate</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .certificate-info { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #667eea; }
        .score-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
        .score-item { background: white; padding: 15px; border-radius: 5px; text-align: center; }
        .score-value { font-size: 24px; font-weight: bold; color: #667eea; }
        .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .verification-link { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 TRUFA Certificate Issued</h1>
            <p>Congratulations! Your device has been successfully validated</p>
        </div>
        
        <div class="content">
            <h2>Dear ${profile?.name || operator.name || 'Operator'},</h2>
            
            <p>We are pleased to inform you that your device <strong>${data.submission.deviceName}</strong> has been successfully validated and certified through the DOB Protocol Validator system.</p>
            
            <div class="certificate-info">
                <h3>📋 Certificate Details</h3>
                <p><strong>Certificate ID:</strong> ${data.certificateHash}</p>
                <p><strong>Device:</strong> ${data.submission.deviceName}</p>
                <p><strong>Type:</strong> ${data.submission.deviceType}</p>
                <p><strong>Manufacturer:</strong> ${data.submission.manufacturer}</p>
                <p><strong>Location:</strong> ${data.submission.location}</p>
                <p><strong>Issued:</strong> ${data.issuedAt.toLocaleDateString()}</p>
                ${data.expiresAt ? `<p><strong>Expires:</strong> ${data.expiresAt.toLocaleDateString()}</p>` : ''}
            </div>

            ${review ? `
            <div class="certificate-info">
                <h3>📊 TRUFA Assessment Scores</h3>
                <div class="score-grid">
                    <div class="score-item">
                        <div class="score-value">${review.technicalScore || 0}</div>
                        <div>Technical Score</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${review.regulatoryScore || 0}</div>
                        <div>Regulatory Score</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${review.financialScore || 0}</div>
                        <div>Financial Score</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${review.environmentalScore || 0}</div>
                        <div>Environmental Score</div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <h3>Overall TRUFA Score: <span style="color: #667eea; font-size: 28px;">${review.overallScore || 0}</span></h3>
                </div>
            </div>
            ` : ''}

            <div class="certificate-info">
                <h3>🎯 What This Means</h3>
                <p>Your device has been validated and is now ready for:</p>
                <ul>
                    <li>Tokenization on the DOB Protocol</li>
                    <li>Participation in liquidity pools</li>
                    <li>Investment opportunities</li>
                    <li>Regulatory compliance verification</li>
                </ul>
            </div>

            <div class="verification-link">
                <h3>🔍 Verify Your Certificate</h3>
                <p>You can verify this certificate online at:</p>
                <a href="https://validator.dobprotocol.com/verify/${data.certificateHash}" class="btn">Verify Certificate</a>
            </div>

            ${data.stellarTxHash ? `
            <div class="certificate-info">
                <h3>⛓️ Blockchain Verification</h3>
                <p><strong>Stellar Transaction:</strong> ${data.stellarTxHash}</p>
                <p>This certificate has been recorded on the Stellar blockchain for permanent verification.</p>
            </div>
            ` : ''}

            <p><strong>Note:</strong> Your certificate PDF is attached to this email for your records.</p>
        </div>
        
        <div class="footer">
            <p>DOB Protocol Validator</p>
            <p>For support, contact: <a href="mailto:support@dobprotocol.com" style="color: white;">support@dobprotocol.com</a></p>
            <p><a href="https://dobprotocol.com" style="color: white;">https://dobprotocol.com</a></p>
        </div>
    </div>
</body>
</html>
    `

    const text = `
TRUFA Certificate Issued - ${data.submission.deviceName}

Dear ${profile?.name || operator.name || 'Operator'},

We are pleased to inform you that your device "${data.submission.deviceName}" has been successfully validated and certified through the DOB Protocol Validator system.

Certificate Details:
- Certificate ID: ${data.certificateHash}
- Device: ${data.submission.deviceName}
- Type: ${data.submission.deviceType}
- Manufacturer: ${data.submission.manufacturer}
- Location: ${data.submission.location}
- Issued: ${data.issuedAt.toLocaleDateString()}
${data.expiresAt ? `- Expires: ${data.expiresAt.toLocaleDateString()}` : ''}

${review ? `
TRUFA Assessment Scores:
- Technical Score: ${review.technicalScore || 0}
- Regulatory Score: ${review.regulatoryScore || 0}
- Financial Score: ${review.financialScore || 0}
- Environmental Score: ${review.environmentalScore || 0}
- Overall TRUFA Score: ${review.overallScore || 0}
` : ''}

What This Means:
Your device has been validated and is now ready for tokenization on the DOB Protocol, participation in liquidity pools, investment opportunities, and regulatory compliance verification.

Verify Your Certificate:
https://validator.dobprotocol.com/verify/${data.certificateHash}

${data.stellarTxHash ? `
Blockchain Verification:
Stellar Transaction: ${data.stellarTxHash}
This certificate has been recorded on the Stellar blockchain for permanent verification.
` : ''}

Note: Your certificate PDF is attached to this email for your records.

DOB Protocol Validator
For support: support@dobprotocol.com
https://dobprotocol.com
    `

    return { subject, html, text }
  }

  async sendNotificationEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.config.from,
        to,
        subject,
        html,
        text
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('✅ Notification email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('❌ Failed to send notification email:', error)
      return false
    }
  }

  async sendAdminNotification(submissionId: string, adminEmail: string): Promise<boolean> {
    const subject = 'New Submission Requires Review - DOB Protocol'
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Submission Review Required</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .btn { display: inline-block; padding: 10px 20px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 New Submission Review Required</h1>
        </div>
        <div class="content">
            <p>A new device submission requires your review and approval.</p>
            <p><strong>Submission ID:</strong> ${submissionId}</p>
            <p>Please log into the admin panel to review this submission.</p>
            <a href="https://admin.dobprotocol.com/submission-review?id=${submissionId}" class="btn">Review Submission</a>
        </div>
    </div>
</body>
</html>
    `

    const text = `
New Submission Review Required

A new device submission requires your review and approval.

Submission ID: ${submissionId}

Please log into the admin panel to review this submission:
https://admin.dobprotocol.com/submission-review?id=${submissionId}
    `

    return this.sendNotificationEmail(adminEmail, subject, html, text)
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log('✅ Email service connection verified')
      return true
    } catch (error) {
      console.error('❌ Email service connection failed:', error)
      return false
    }
  }
}

export const emailService = new EmailService() 