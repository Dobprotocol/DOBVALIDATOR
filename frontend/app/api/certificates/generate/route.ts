import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '../../auth/verify/route'
import { supabaseService } from '@/lib/supabase-service'
import crypto from 'crypto'

// Certificate generation schema
const certificateSchema = z.object({
  deviceId: z.string().min(1, "Device ID is required"),
  deviceName: z.string().min(1, "Device name is required"),
  operatorName: z.string().min(1, "Operator name is required"),
  validationDate: z.string().min(1, "Validation date is required"),
  certificateType: z.enum(['technical', 'financial', 'comprehensive']),
  metadata: z.record(z.any()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = certificateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const { deviceId, deviceName, operatorName, validationDate, certificateType, metadata } = validationResult.data
    
    // Get user by wallet address
    const user = await supabaseService.getUserByWallet(auth.user.walletAddress)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Generate certificate hash for blockchain verification
    const certificateHash = crypto
      .createHash('sha256')
      .update(`${deviceId}-${deviceName}-${operatorName}-${validationDate}-${Date.now()}`)
      .digest('hex')
    
    // Prepare certificate data for Supabase
    const supabaseCertificateData = {
      certificate_hash: certificateHash,
      stellar_tx_hash: null, // Will be set when blockchain transaction is completed
      issued_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      status: 'ACTIVE',
      submission_id: deviceId, // Assuming deviceId is actually submission_id
      user_id: user.id,
      // Additional metadata can be stored in a separate field or as JSON
      metadata: {
        deviceName,
        operatorName,
        validationDate,
        certificateType,
        ...metadata
      }
    }
    
    // Create certificate in Supabase
    const createdCertificate = await supabaseService.createCertificate(supabaseCertificateData)
    
    // TODO: Generate actual PDF certificate
    // This would involve:
    // 1. Creating a PDF template
    // 2. Filling in the certificate data
    // 3. Adding QR code for verification
    // 4. Storing the PDF file
    
    return NextResponse.json({
      success: true,
      certificate: {
        id: createdCertificate.id,
        certificateHash: createdCertificate.certificate_hash,
        deviceId,
        deviceName,
        operatorName,
        validationDate,
        certificateType,
        issuedAt: createdCertificate.issued_at,
        status: createdCertificate.status,
        pdfUrl: `/api/certificates/${createdCertificate.id}/pdf`,
        verificationUrl: `/api/certificates/${createdCertificate.certificate_hash}/verify`,
      },
      message: 'Certificate generated successfully'
    })
    
  } catch (error) {
    console.error('Error generating certificate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get certificate by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const certificateId = searchParams.get('id')
    
    if (!certificateId) {
      return NextResponse.json(
        { error: 'Certificate ID is required' },
        { status: 400 }
      )
    }
    
    const certificate = await supabaseService.getCertificateById(certificateId)
    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        certificateHash: certificate.certificate_hash,
        stellarTxHash: certificate.stellar_tx_hash,
        issuedAt: certificate.issued_at,
        expiresAt: certificate.expires_at,
        status: certificate.status,
        metadata: certificate.metadata
      }
    })
    
  } catch (error) {
    console.error('Error retrieving certificate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 