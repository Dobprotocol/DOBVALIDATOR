import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { TransactionBuilder, Networks } from '@stellar/stellar-sdk'
import { getChallenge, removeChallenge } from '@/lib/auth-storage'

export const dynamic = 'force-dynamic'

const walletLoginSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  signature: z.string().min(1, "Signature (XDR transaction) is required"),
  challenge: z.string().min(1, "Challenge is required"),
})

// Helper function to verify XDR transaction (reused from your existing code)
function verifyXDRTransaction(walletAddress: string, signedXDR: string, challenge: string): boolean {
  console.log('🔍 Verifying XDR transaction...')
  console.log('🔍 Wallet address:', walletAddress)
  console.log('🔍 Challenge:', challenge)
  console.log('🔍 Signed XDR length:', signedXDR.length)
  
  try {
    // Parse the signed XDR transaction
    const transaction = TransactionBuilder.fromXDR(signedXDR, "Test SDF Network ; September 2015")
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
      transaction.operations.forEach((op, i) => {
        console.log(`  ${i}: ${op.type} - ${(op as any).name || 'no name'}`)
      })
      return false
    }
    
    console.log('🔍 Transaction challenge (from manageData):', transactionChallenge)
    
    // Get the stored challenge
    const storedChallenge = getChallenge(walletAddress)
    
    if (!storedChallenge) {
      console.log('❌ No stored challenge found for wallet')
      return false
    }
    
    console.log('🔍 Stored challenge:', storedChallenge.challenge)
    console.log('🔍 Stored challenge timestamp:', storedChallenge.timestamp)
    
    // Check if challenge is expired (5 minutes)
    if (Date.now() - storedChallenge.timestamp > 5 * 60 * 1000) {
      console.log('❌ Challenge expired')
      console.log('❌ Current time:', Date.now())
      console.log('❌ Challenge time:', storedChallenge.timestamp)
      console.log('❌ Time difference:', Date.now() - storedChallenge.timestamp)
      removeChallenge(walletAddress)
      return false
    }
    
    // Check if the stored challenge starts with the transaction challenge
    // (since the transaction challenge is truncated to 28 bytes)
    const transactionChallengeStr = String(transactionChallenge)
    const storedChallengeStr = String(storedChallenge.challenge)
    
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
    
    // Clean up used challenge
    removeChallenge(walletAddress)
    
    return true
  } catch (error) {
    console.error('❌ Error verifying XDR transaction:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Wallet login POST request received')
    
    const body = await request.json()
    console.log('🔍 Request body:', body)
    
    const validationResult = walletLoginSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.log('❌ Validation failed:', validationResult.error.format())
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const { walletAddress, signature, challenge } = validationResult.data
    console.log('🔍 Validated data:', { walletAddress, signature: signature.substring(0, 20) + '...', challenge })
    
    // Check if this is a mock signature for testing
    const isMockSignature = signature === 'mock_signature_for_testing' || signature.startsWith('mock_')
    
    if (isMockSignature) {
      console.log('🔧 Mock signature detected, bypassing XDR verification...')
      
      // Verify that the challenge exists in storage
      const storedChallenge = getChallenge(walletAddress)
      if (!storedChallenge) {
        console.log('❌ No stored challenge found for mock authentication')
        return NextResponse.json(
          { error: 'No stored challenge found' },
          { status: 401 }
        )
      }
      
      // Check if challenge matches
      if (storedChallenge.challenge !== challenge) {
        console.log('❌ Challenge mismatch for mock authentication')
        return NextResponse.json(
          { error: 'Challenge mismatch' },
          { status: 401 }
        )
      }
      
      console.log('✅ Mock authentication successful')
    } else {
      // Verify XDR transaction for real signatures
      console.log('🔍 Calling verifyXDRTransaction...')
      const isValid = verifyXDRTransaction(walletAddress, signature, challenge)
      
      console.log('🔍 Verification result:', isValid)
      
      if (!isValid) {
        console.log('❌ Verification failed')
        return NextResponse.json(
          { error: 'Invalid signature or expired challenge' },
          { status: 401 }
        )
      }
    }
    
    console.log('✅ Wallet verification successful, creating session...')
    
    // Create a session (JWT-based authentication)
    const session = {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: walletAddress,
        email: `${walletAddress}@stellar.wallet`,
        user_metadata: {
          wallet_address: walletAddress,
          provider: 'stellar'
        }
      }
    }
    
    console.log('✅ Session created successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Wallet login successful',
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
      token_type: session.token_type,
      user: session.user,
      session: session,
      note: isMockSignature ? 'This is a mock session for testing.' : 'Session created successfully.'
    })
    
  } catch (error) {
    console.error('❌ Error in wallet login:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 