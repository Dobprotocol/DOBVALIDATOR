import { NextRequest, NextResponse } from 'next/server'

// Mock certificate data storage (in production, use database)
const certificates = new Map<string, any>()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const certificateId = params.id
    
    if (!certificateId) {
      return NextResponse.json(
        { error: 'Certificate ID is required' },
        { status: 400 }
      )
    }
    
    // In production, fetch from database
    const certificate = certificates.get(certificateId)
    
    if (!certificate) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Certificate not found',
          message: 'This certificate does not exist in our system'
        },
        { status: 404 }
      )
    }
    
    // Verify certificate status
    if (certificate.status !== 'issued') {
      return NextResponse.json({
        valid: false,
        error: 'Certificate not valid',
        message: 'This certificate is not currently valid',
        certificate: {
          id: certificate.id,
          status: certificate.status,
          issuedAt: certificate.issuedAt
        }
      })
    }
    
    // Return verification result
    return NextResponse.json({
      valid: true,
      certificate: {
        id: certificate.id,
        deviceName: certificate.deviceName,
        operatorName: certificate.operatorName,
        validationDate: certificate.validationDate,
        certificateType: certificate.certificateType,
        issuedAt: certificate.issuedAt,
        status: certificate.status,
        // Don't expose sensitive data like wallet addresses in public verification
      },
      message: 'Certificate is valid and authentic'
    })
    
  } catch (error) {
    console.error('Error verifying certificate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 