import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase-service'

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
    
    // Fetch from Supabase database
    const certificate = await supabaseService.getCertificateById(certificateId)
    
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
    if (certificate.status !== 'ACTIVE') {
      return NextResponse.json({
        valid: false,
        error: 'Certificate not valid',
        message: 'This certificate is not currently valid',
        certificate: {
          id: certificate.id,
          status: certificate.status,
          issuedAt: certificate.issued_at
        }
      })
    }
    
    // Check if certificate has expired
    if (certificate.expires_at && new Date(certificate.expires_at) < new Date()) {
      return NextResponse.json({
        valid: false,
        error: 'Certificate expired',
        message: 'This certificate has expired',
        certificate: {
          id: certificate.id,
          status: certificate.status,
          issuedAt: certificate.issued_at,
          expiresAt: certificate.expires_at
        }
      })
    }
    
    // Return verification result
    return NextResponse.json({
      valid: true,
      certificate: {
        id: certificate.id,
        certificateHash: certificate.certificate_hash,
        stellarTxHash: certificate.stellar_tx_hash,
        issuedAt: certificate.issued_at,
        expiresAt: certificate.expires_at,
        status: certificate.status,
        metadata: certificate.metadata
        // Don't expose sensitive data like user IDs in public verification
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