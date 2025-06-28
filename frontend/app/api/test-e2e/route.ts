import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseService } from '@/lib/supabase-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 E2E Test endpoint called')
    
    const results = {
      environment: {},
      database: {},
      userCreation: {},
      profileCreation: {},
      submissionCreation: {},
      cleanup: {}
    }
    
    // 1. Environment Check
    results.environment = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
      nodeEnv: process.env.NODE_ENV || 'unknown'
    }
    
    // 2. Database Connection Test
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    results.database = {
      success: !connectionError,
      error: connectionError?.message,
      userCount: connectionTest?.[0]?.count || 0
    }
    
    // 3. Test User Creation
    const testWalletAddress = `TEST_E2E_${Date.now()}`
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .insert({
        wallet_address: testWalletAddress,
        email: 'test-e2e@example.com',
        name: 'E2E Test User',
        role: 'OPERATOR'
      })
      .select()
      .single()
    
    results.userCreation = {
      success: !userError,
      error: userError?.message,
      data: testUser
    }
    
    // 4. Test Profile Creation
    let testProfile = null
    let profileError = null
    
    if (testUser) {
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .insert({
          user_id: testUser.id,
          contact_person: 'E2E Test Contact',
          company_name: 'E2E Test Company',
          phone: '123-456-7890',
          website: 'https://e2e-test.com',
          description: 'E2E test description',
          industry: 'Technology',
          address: 'E2E Test Address',
          country: 'Test Country'
        })
        .select()
        .single()
      
      testProfile = profile
      profileError = pError
    }
    
    results.profileCreation = {
      success: !profileError,
      error: profileError?.message,
      data: testProfile
    }
    
    // 5. Test Submission Creation
    let testSubmission = null
    let submissionError = null
    
    if (testUser) {
      const { data: submission, error: sError } = await supabase
        .from('submissions')
        .insert({
          user_id: testUser.id,
          device_name: 'E2E Test Device',
          device_type: 'mining_rig',
          location: 'E2E Test Location',
          serial_number: 'E2E-123456',
          manufacturer: 'E2E Manufacturer',
          model: 'E2E Model',
          year_of_manufacture: '2024',
          condition: 'excellent',
          specifications: 'E2E test specifications',
          purchase_price: '1000',
          current_value: '1200',
          expected_revenue: '500',
          operational_costs: '100',
          status: 'PENDING'
        })
        .select()
        .single()
      
      testSubmission = submission
      submissionError = sError
    }
    
    results.submissionCreation = {
      success: !submissionError,
      error: submissionError?.message,
      data: testSubmission
    }
    
    // 6. Test Service Layer Methods
    const serviceTests = {
      getUserByWallet: null,
      getProfileByUserId: null,
      getUserSubmissions: null
    }
    
    if (testUser) {
      try {
        const userByWallet = await supabaseService.getUserByWallet(testWalletAddress)
        serviceTests.getUserByWallet = { success: !!userByWallet, data: userByWallet }
      } catch (error) {
        serviceTests.getUserByWallet = { success: false, error: error.message }
      }
      
      try {
        const profileByUserId = await supabaseService.getProfileByUserId(testUser.id)
        serviceTests.getProfileByUserId = { success: !!profileByUserId, data: profileByUserId }
      } catch (error) {
        serviceTests.getProfileByUserId = { success: false, error: error.message }
      }
      
      try {
        const userSubmissions = await supabaseService.getUserSubmissions(testWalletAddress)
        serviceTests.getUserSubmissions = { success: true, count: userSubmissions.length, data: userSubmissions }
      } catch (error) {
        serviceTests.getUserSubmissions = { success: false, error: error.message }
      }
    }
    
    // 7. Cleanup Test Data
    let cleanupSuccess = false
    if (testSubmission) {
      await supabase.from('submissions').delete().eq('id', testSubmission.id)
    }
    if (testProfile) {
      await supabase.from('profiles').delete().eq('id', testProfile.id)
    }
    if (testUser) {
      await supabase.from('users').delete().eq('id', testUser.id)
      cleanupSuccess = true
    }
    
    results.cleanup = {
      success: cleanupSuccess
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      serviceTests,
      summary: {
        environmentOk: results.environment.supabaseUrl === 'present' && results.environment.supabaseKey === 'present',
        databaseOk: results.database.success,
        userCreationOk: results.userCreation.success,
        profileCreationOk: results.profileCreation.success,
        submissionCreationOk: results.submissionCreation.success,
        serviceLayerOk: serviceTests.getUserByWallet?.success && serviceTests.getProfileByUserId?.success,
        cleanupOk: results.cleanup.success
      }
    })
  } catch (error) {
    console.error('❌ Error in E2E test endpoint:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
} 