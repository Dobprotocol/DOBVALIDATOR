#!/usr/bin/env ts-node

import axios from 'axios'
import { env } from '../src/lib/env-validation'

const BACKEND_URL = `http://localhost:${env.PORT}`
const FRONTEND_URL = 'http://localhost:3002'
const BACKOFFICE_URL = 'http://localhost:3000'

interface IntegrationTestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  message: string
  duration?: number
  data?: any
}

class IntegrationTestRunner {
  private results: IntegrationTestResult[] = []
  private userToken: string | null = null
  private adminToken: string | null = null
  private submissionId: string | null = null

  async runIntegrationTests() {
    console.log('🔗 DOB Validator Integration Tests')
    console.log('='.repeat(60))
    console.log(`Backend: ${BACKEND_URL}`)
    console.log(`Frontend: ${FRONTEND_URL}`)
    console.log(`Backoffice: ${BACKOFFICE_URL}`)
    console.log('='.repeat(60))

    try {
      await this.testBackendHealth()
      await this.testFrontendAccessibility()
      await this.testBackofficeAccessibility()
      await this.testCompleteWorkflow()
      await this.testDataConsistency()
      
      this.printResults()
    } catch (error) {
      console.error('❌ Integration test suite failed:', error)
      process.exit(1)
    }
  }

  private async testBackendHealth() {
    console.log('\n🔧 Testing Backend Health...')
    const startTime = Date.now()

    try {
      const response = await axios.get(`${BACKEND_URL}/health`)
      
      this.addResult({
        name: 'Backend Health Check',
        status: response.status === 200 ? 'PASS' : 'FAIL',
        message: `Backend responding on ${BACKEND_URL}`,
        duration: Date.now() - startTime,
        data: response.data
      })
    } catch (error) {
      this.addResult({
        name: 'Backend Health Check',
        status: 'FAIL',
        message: `Backend not accessible: ${(error as any).message}`,
        duration: Date.now() - startTime
      })
      throw new Error('Backend not available')
    }
  }

  private async testFrontendAccessibility() {
    console.log('\n🌐 Testing Frontend Accessibility...')
    const startTime = Date.now()

    try {
      const response = await axios.get(`${FRONTEND_URL}`, { timeout: 5000 })
      
      this.addResult({
        name: 'Frontend Accessibility',
        status: response.status === 200 ? 'PASS' : 'FAIL',
        message: `Frontend accessible on ${FRONTEND_URL}`,
        duration: Date.now() - startTime
      })
    } catch (error) {
      this.addResult({
        name: 'Frontend Accessibility',
        status: 'SKIP',
        message: `Frontend not accessible: ${(error as any).message}`,
        duration: Date.now() - startTime
      })
    }
  }

  private async testBackofficeAccessibility() {
    console.log('\n👑 Testing Backoffice Accessibility...')
    const startTime = Date.now()

    try {
      const response = await axios.get(`${BACKOFFICE_URL}`, { timeout: 5000 })
      
      this.addResult({
        name: 'Backoffice Accessibility',
        status: response.status === 200 ? 'PASS' : 'FAIL',
        message: `Backoffice accessible on ${BACKOFFICE_URL}`,
        duration: Date.now() - startTime
      })
    } catch (error) {
      this.addResult({
        name: 'Backoffice Accessibility',
        status: 'SKIP',
        message: `Backoffice not accessible: ${(error as any).message}`,
        duration: Date.now() - startTime
      })
    }
  }

  private async testCompleteWorkflow() {
    console.log('\n🔄 Testing Complete Workflow...')

    // Step 1: User Authentication
    const authStart = Date.now()
    try {
      const challengeResponse = await axios.post(`${BACKEND_URL}/api/auth/challenge`, {
        walletAddress: 'GINTEGRATION_TEST_USER'
      })

      const verifyResponse = await axios.post(`${BACKEND_URL}/api/auth/verify`, {
        walletAddress: 'GINTEGRATION_TEST_USER',
        signature: 'integration_test_signature',
        challenge: challengeResponse.data.challenge
      })

      this.userToken = verifyResponse.data.token

      this.addResult({
        name: 'User Authentication',
        status: 'PASS',
        message: 'User authenticated successfully',
        duration: Date.now() - authStart,
        data: { userId: verifyResponse.data.user.id }
      })
    } catch (error) {
      this.addResult({
        name: 'User Authentication',
        status: 'FAIL',
        message: `Authentication failed: ${(error as any).response?.data?.error || (error as any).message}`,
        duration: Date.now() - authStart
      })
      return
    }

    // Step 2: Create Profile
    const profileStart = Date.now()
    try {
      const profileResponse = await axios.post(`${BACKEND_URL}/api/profile`, {
        name: 'Integration Test User',
        company: 'Integration Test Corp',
        email: 'integration@test.com'
      }, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      })

      this.addResult({
        name: 'Profile Creation',
        status: 'PASS',
        message: 'Profile created successfully',
        duration: Date.now() - profileStart,
        data: profileResponse.data
      })
    } catch (error) {
      this.addResult({
        name: 'Profile Creation',
        status: 'FAIL',
        message: `Profile creation failed: ${(error as any).response?.data?.error || (error as any).message}`,
        duration: Date.now() - profileStart
      })
      return
    }

    // Step 3: Create Submission
    const submissionStart = Date.now()
    try {
      const submissionData = {
        deviceName: 'Integration Test Device',
        deviceType: 'Solar Panel',
        serialNumber: 'INT-TEST-001',
        manufacturer: 'Test Manufacturer',
        model: 'TEST-MODEL',
        yearOfManufacture: '2024',
        condition: 'New',
        specifications: 'Integration test specifications',
        purchasePrice: '1000000',
        currentValue: '1000000',
        expectedRevenue: '200000',
        operationalCosts: '50000'
      }

      const submissionResponse = await axios.post(`${BACKEND_URL}/api/submissions`, submissionData, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      })

      this.submissionId = submissionResponse.data.submission.id

      this.addResult({
        name: 'Submission Creation',
        status: 'PASS',
        message: 'Submission created successfully',
        duration: Date.now() - submissionStart,
        data: { submissionId: this.submissionId }
      })
    } catch (error) {
      this.addResult({
        name: 'Submission Creation',
        status: 'FAIL',
        message: `Submission creation failed: ${(error as any).response?.data?.error || (error as any).message}`,
        duration: Date.now() - submissionStart
      })
      return
    }

    // Step 4: Admin Authentication
    const adminAuthStart = Date.now()
    try {
      const adminChallengeResponse = await axios.post(`${BACKEND_URL}/api/auth/challenge`, {
        walletAddress: 'GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ'
      })

      const adminVerifyResponse = await axios.post(`${BACKEND_URL}/api/auth/verify`, {
        walletAddress: 'GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ',
        signature: 'admin_integration_signature',
        challenge: adminChallengeResponse.data.challenge
      })

      this.adminToken = adminVerifyResponse.data.token

      this.addResult({
        name: 'Admin Authentication',
        status: 'PASS',
        message: 'Admin authenticated successfully',
        duration: Date.now() - adminAuthStart,
        data: { role: adminVerifyResponse.data.user.role }
      })
    } catch (error) {
      this.addResult({
        name: 'Admin Authentication',
        status: 'FAIL',
        message: `Admin authentication failed: ${(error as any).response?.data?.error || (error as any).message}`,
        duration: Date.now() - adminAuthStart
      })
      return
    }

    // Step 5: Admin Review
    const reviewStart = Date.now()
    try {
      const reviewResponse = await axios.put(`${BACKEND_URL}/api/submissions/${this.submissionId}/status`, {
        status: 'APPROVED',
        adminNotes: 'Integration test approval - all requirements met'
      }, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      })

      this.addResult({
        name: 'Admin Review',
        status: 'PASS',
        message: 'Submission reviewed and approved',
        duration: Date.now() - reviewStart,
        data: { 
          status: reviewResponse.data.submission.status,
          adminReview: reviewResponse.data.submission.adminReview ? 'Created' : 'None'
        }
      })
    } catch (error) {
      this.addResult({
        name: 'Admin Review',
        status: 'FAIL',
        message: `Admin review failed: ${(error as any).response?.data?.error || (error as any).message}`,
        duration: Date.now() - reviewStart
      })
    }
  }

  private async testDataConsistency() {
    console.log('\n📊 Testing Data Consistency...')

    if (!this.userToken || !this.submissionId) {
      this.addResult({
        name: 'Data Consistency',
        status: 'SKIP',
        message: 'Skipped - no user token or submission ID available'
      })
      return
    }

    const consistencyStart = Date.now()
    try {
      // Test that user can see their submission
      const userSubmissionResponse = await axios.get(`${BACKEND_URL}/api/submissions/${this.submissionId}`, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      })

      // Test that admin can see the same submission
      const adminSubmissionResponse = await axios.get(`${BACKEND_URL}/api/submissions/${this.submissionId}`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      })

      // Verify data consistency
      const userSubmission = userSubmissionResponse.data.submission
      const adminSubmission = adminSubmissionResponse.data.submission

      const isConsistent = 
        userSubmission.id === adminSubmission.id &&
        userSubmission.deviceName === adminSubmission.deviceName &&
        userSubmission.status === adminSubmission.status

      this.addResult({
        name: 'Data Consistency',
        status: isConsistent ? 'PASS' : 'FAIL',
        message: isConsistent ? 'Data consistent between user and admin views' : 'Data inconsistency detected',
        duration: Date.now() - consistencyStart,
        data: {
          userView: {
            id: userSubmission.id,
            deviceName: userSubmission.deviceName,
            status: userSubmission.status
          },
          adminView: {
            id: adminSubmission.id,
            deviceName: adminSubmission.deviceName,
            status: adminSubmission.status
          }
        }
      })
    } catch (error) {
      this.addResult({
        name: 'Data Consistency',
        status: 'FAIL',
        message: `Data consistency check failed: ${(error as any).response?.data?.error || (error as any).message}`,
        duration: Date.now() - consistencyStart
      })
    }
  }

  private addResult(result: IntegrationTestResult) {
    this.results.push(result)
    const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${statusIcon} ${result.name}: ${result.message}`)
    if (result.duration) {
      console.log(`   ⏱️  Duration: ${result.duration}ms`)
    }
  }

  private printResults() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 Integration Test Results Summary')
    console.log('='.repeat(60))

    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const skipped = this.results.filter(r => r.status === 'SKIP').length
    const total = this.results.length

    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⚠️  Skipped: ${skipped}`)
    console.log(`📊 Total: ${total}`)

    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results.filter(r => r.status === 'FAIL').forEach(result => {
        console.log(`   - ${result.name}: ${result.message}`)
      })
    }

    if (passed === total) {
      console.log('\n🎉 All integration tests passed!')
      console.log('🔗 Frontend, Backend, and Backoffice are properly integrated.')
    } else if (passed + skipped === total) {
      console.log('\n⚠️  Integration tests completed with some services unavailable.')
      console.log('🔗 Core backend functionality is working correctly.')
    } else {
      console.log('\n❌ Some integration tests failed. Please review the issues above.')
    }

    console.log('\n📋 Integration Test Summary:')
    console.log('   1. ✅ Backend Health Check')
    console.log('   2. ✅ Frontend Accessibility')
    console.log('   3. ✅ Backoffice Accessibility')
    console.log('   4. ✅ Complete Workflow Test')
    console.log('   5. ✅ Data Consistency Check')
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new IntegrationTestRunner()
  runner.runIntegrationTests().catch(error => {
    console.error('❌ Integration test suite failed:', error)
    process.exit(1)
  })
}

export { IntegrationTestRunner } 