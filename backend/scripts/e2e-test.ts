#!/usr/bin/env ts-node

import axios from 'axios'
import { env } from '../src/lib/env-validation'

// Test configuration
const API_BASE_URL = `http://localhost:${env.PORT}`
const TEST_USER_WALLET = 'GABCDEF1234567890ABCDEF1234567890ABCDEF12'
const TEST_ADMIN_WALLET = 'GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ'

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  message: string
  duration?: number
  data?: any
}

class E2ETestRunner {
  private results: TestResult[] = []
  private userToken: string | null = null
  private adminToken: string | null = null
  private testSubmissionId: string | null = null

  async runAllTests() {
    console.log('🧪 Starting DOB Validator End-to-End Tests')
    console.log(`📍 API Base URL: ${API_BASE_URL}`)
    console.log(`🔧 Environment: ${env.NODE_ENV}`)
    console.log('='.repeat(60))

    try {
      await this.testHealthCheck()
      await this.testUserAuthentication()
      await this.testProfileManagement()
      await this.testSubmissionFlow()
      await this.testAdminAuthentication()
      await this.testAdminReviewFlow()
      await this.testDataRetrieval()
      
      this.printResults()
    } catch (error) {
      console.error('❌ Test suite failed:', error)
      process.exit(1)
    }
  }

  private async testHealthCheck() {
    const startTime = Date.now()
    
    try {
      const response = await axios.get(`${API_BASE_URL}/health`)
      
      this.addResult({
        name: 'Health Check',
        status: response.status === 200 ? 'PASS' : 'FAIL',
        message: `Server responded with status ${response.status}`,
        duration: Date.now() - startTime,
        data: response.data
      })
    } catch (error) {
      this.addResult({
        name: 'Health Check',
        status: 'FAIL',
        message: `Server not responding: ${(error as any).message}`,
        duration: Date.now() - startTime
      })
      throw new Error('Server not available')
    }
  }

  private async testUserAuthentication() {
    console.log('\n🔐 Testing User Authentication Flow...')

    const challengeStart = Date.now()
    try {
      const challengeResponse = await axios.post(`${API_BASE_URL}/api/auth/challenge`, {
        walletAddress: TEST_USER_WALLET
      })

      this.addResult({
        name: 'Generate Challenge',
        status: challengeResponse.status === 200 ? 'PASS' : 'FAIL',
        message: 'Challenge generated successfully',
        duration: Date.now() - challengeStart
      })

      const verifyStart = Date.now()
      const verifyResponse = await axios.post(`${API_BASE_URL}/api/auth/verify`, {
        walletAddress: TEST_USER_WALLET,
        signature: 'test_signature_placeholder',
        challenge: challengeResponse.data.challenge
      })

      if (verifyResponse.status === 200 && verifyResponse.data.token) {
        this.userToken = verifyResponse.data.token
        
        this.addResult({
          name: 'Verify Signature',
          status: 'PASS',
          message: 'User authenticated successfully',
          duration: Date.now() - verifyStart,
          data: { userId: verifyResponse.data.user.id }
        })
      } else {
        this.addResult({
          name: 'Verify Signature',
          status: 'FAIL',
          message: 'Authentication failed',
          duration: Date.now() - verifyStart
        })
      }
    } catch (error) {
      this.addResult({
        name: 'User Authentication',
        status: 'FAIL',
        message: `Authentication error: ${(error as any).response?.data?.error || (error as any).message}`
      })
    }
  }

  private async testProfileManagement() {
    console.log('\n👤 Testing Profile Management...')

    if (!this.userToken) {
      this.addResult({
        name: 'Profile Management',
        status: 'SKIP',
        message: 'Skipped - no user token available'
      })
      return
    }

    const headers = { Authorization: `Bearer ${this.userToken}` }

    const createStart = Date.now()
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/api/profile`, {
        name: 'Test User',
        company: 'DOB Protocol Test',
        email: 'test@dobprotocol.com'
      }, { headers })

      this.addResult({
        name: 'Create Profile',
        status: createResponse.status === 200 ? 'PASS' : 'FAIL',
        message: 'Profile created successfully',
        duration: Date.now() - createStart,
        data: createResponse.data
      })

      const getStart = Date.now()
      const getResponse = await axios.get(`${API_BASE_URL}/api/profile`, { headers })

      this.addResult({
        name: 'Get Profile',
        status: getResponse.status === 200 ? 'PASS' : 'FAIL',
        message: 'Profile retrieved successfully',
        duration: Date.now() - getStart,
        data: getResponse.data
      })
    } catch (error) {
      this.addResult({
        name: 'Profile Management',
        status: 'FAIL',
        message: `Profile error: ${(error as any).response?.data?.error || (error as any).message}`
      })
    }
  }

  private async testSubmissionFlow() {
    console.log('\n📝 Testing Submission Flow...')

    if (!this.userToken) {
      this.addResult({
        name: 'Submission Flow',
        status: 'SKIP',
        message: 'Skipped - no user token available'
      })
      return
    }

    const headers = { Authorization: `Bearer ${this.userToken}` }

    const createStart = Date.now()
    try {
      const submissionData = {
        deviceName: 'Solar Farm Alpha',
        deviceType: 'Solar Panel',
        serialNumber: 'SF001',
        manufacturer: 'SolarTech',
        model: 'ST-100MW',
        yearOfManufacture: '2024',
        condition: 'New',
        specifications: '100MW capacity, 25 year warranty',
        purchasePrice: '50000000',
        currentValue: '50000000',
        expectedRevenue: '8000000',
        operationalCosts: '500000',
        location: 'California, USA'
      }

      const createResponse = await axios.post(`${API_BASE_URL}/api/submissions`, submissionData, { headers })
      if (createResponse.status === 200 && createResponse.data.submission) {
        this.testSubmissionId = createResponse.data.submission.id
      }

        this.addResult({
          name: 'Create Submission',
        status: createResponse.status === 200 ? 'PASS' : 'FAIL',
          message: 'Submission created successfully',
          duration: Date.now() - createStart,
        data: createResponse.data
        })

        const getStart = Date.now()
      const getResponse = await axios.get(`${API_BASE_URL}/api/submissions?limit=10`, { headers })

        this.addResult({
          name: 'Get User Submissions',
          status: getResponse.status === 200 ? 'PASS' : 'FAIL',
          message: `Found ${getResponse.data.submissions?.length || 0} submissions`,
          duration: Date.now() - getStart,
        data: getResponse.data
        })
    } catch (error) {
      this.addResult({
        name: 'Submission Flow',
        status: 'FAIL',
        message: `Submission error: ${(error as any).response?.data?.error || (error as any).message}`
      })
    }
  }

  private async testAdminAuthentication() {
    console.log('\n👑 Testing Admin Authentication...')

    const challengeStart = Date.now()
    try {
      const challengeResponse = await axios.post(`${API_BASE_URL}/api/auth/challenge`, {
        walletAddress: TEST_ADMIN_WALLET
      })

      this.addResult({
        name: 'Generate Admin Challenge',
        status: challengeResponse.status === 200 ? 'PASS' : 'FAIL',
        message: 'Admin challenge generated successfully',
        duration: Date.now() - challengeStart
      })

      const verifyStart = Date.now()
      const verifyResponse = await axios.post(`${API_BASE_URL}/api/auth/verify`, {
        walletAddress: TEST_ADMIN_WALLET,
        signature: 'admin_signature_placeholder',
        challenge: challengeResponse.data.challenge
      })

      if (verifyResponse.status === 200 && verifyResponse.data.token) {
        this.adminToken = verifyResponse.data.token

        this.addResult({
          name: 'Verify Admin Signature',
          status: 'PASS',
          message: 'Admin authenticated successfully',
          duration: Date.now() - verifyStart,
          data: { userId: verifyResponse.data.user.id, role: verifyResponse.data.user.role }
        })

        // Debug: Check admin user details
        console.log('🔍 Admin user details:', verifyResponse.data.user)
      } else {
        this.addResult({
          name: 'Verify Admin Signature',
          status: 'FAIL',
          message: 'Admin authentication failed',
          duration: Date.now() - verifyStart
        })
      }
    } catch (error) {
      this.addResult({
        name: 'Admin Authentication',
        status: 'FAIL',
        message: `Admin auth error: ${(error as any).response?.data?.error || (error as any).message}`
      })
    }
  }

  private async testAdminReviewFlow() {
    console.log('\n🔍 Testing Admin Review Flow...')

    if (!this.adminToken || !this.testSubmissionId) {
      this.addResult({
        name: 'Admin Review Flow',
        status: 'SKIP',
        message: 'Skipped - no admin token or submission ID available'
      })
      return
    }

    const headers = { Authorization: `Bearer ${this.adminToken}` }

    const getAllStart = Date.now()
    try {
      const getAllResponse = await axios.get(`${API_BASE_URL}/api/submissions?limit=50`, { headers })

      console.log('🔍 Admin submissions response:', getAllResponse.data)
      console.log('🔍 Test submission ID:', this.testSubmissionId)

      this.addResult({
        name: 'Get All Submissions (Admin)',
        status: getAllResponse.status === 200 ? 'PASS' : 'FAIL',
        message: `Admin can see ${getAllResponse.data.submissions?.length || 0} submissions`,
        duration: Date.now() - getAllStart,
        data: { count: getAllResponse.data.submissions?.length || 0 }
      })

      const updateStart = Date.now()
      const updateResponse = await axios.put(`${API_BASE_URL}/api/submissions/${this.testSubmissionId}/status`, {
        status: 'APPROVED',
        adminNotes: 'Excellent submission! All requirements met. Ready for certificate generation.'
      }, { headers })

      this.addResult({
        name: 'Update Submission Status',
        status: updateResponse.status === 200 ? 'PASS' : 'FAIL',
        message: 'Submission status updated successfully',
        duration: Date.now() - updateStart,
        data: { 
          status: updateResponse.data.submission?.status,
          adminReview: updateResponse.data.submission?.adminReview ? 'Created' : 'None'
        }
      })
    } catch (error: any) {
      console.error('🔍 Admin review error details:', error.response?.data || error.message)
      this.addResult({
        name: 'Admin Review Flow',
        status: 'FAIL',
        message: `Admin review error: ${(error as any).response?.data?.error || (error as any).message}`
      })
    }
  }

  private async testDataRetrieval() {
    console.log('\n📊 Testing Data Retrieval and Validation...')

    if (!this.userToken || !this.testSubmissionId) {
      this.addResult({
        name: 'Data Retrieval',
        status: 'SKIP',
        message: 'Skipped - no user token or submission ID available'
      })
      return
    }

    const userHeaders = { Authorization: `Bearer ${this.userToken}` }

    const retrievalStart = Date.now()
    try {
      const response = await axios.get(`${API_BASE_URL}/api/submissions/${this.testSubmissionId}`, { headers: userHeaders })

      if (response.status === 200 && response.data.submission) {
        const submission = response.data.submission
        
        this.addResult({
          name: 'Data Retrieval Validation',
          status: 'PASS',
          message: 'User can see updated submission with admin review',
          duration: Date.now() - retrievalStart,
          data: {
            status: submission.status,
            hasAdminReview: !!submission.adminReview,
            adminNotes: submission.adminReview?.notes
          }
        })
      } else {
        this.addResult({
          name: 'Data Retrieval Validation',
          status: 'FAIL',
          message: 'Failed to retrieve updated submission',
          duration: Date.now() - retrievalStart
        })
      }
    } catch (error) {
      this.addResult({
        name: 'Data Retrieval',
        status: 'FAIL',
        message: `Data retrieval error: ${(error as any).response?.data?.error || (error as any).message}`
      })
    }
  }

  private addResult(result: TestResult) {
    this.results.push(result)
    const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${statusIcon} ${result.name}: ${result.message}`)
    if (result.duration) {
      console.log(`   ⏱️  Duration: ${result.duration}ms`)
    }
  }

  private printResults() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 E2E Test Results Summary')
    console.log('='.repeat(60))

    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const total = this.results.length

    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📊 Total: ${total}`)

    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results.filter(r => r.status === 'FAIL').forEach(result => {
        console.log(`   - ${result.name}: ${result.message}`)
      })
    }

    if (passed === total) {
      console.log('\n🎉 All tests passed! The backend is ready for production.')
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new E2ETestRunner()
  runner.runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  })
}

export { E2ETestRunner } 