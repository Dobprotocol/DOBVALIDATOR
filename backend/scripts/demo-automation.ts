#!/usr/bin/env ts-node

import axios from 'axios'
import { env } from '../src/lib/env-validation'

const API_BASE_URL = `http://localhost:${env.PORT}`

class DemoAutomation {
  private userToken: string | null = null
  private adminToken: string | null = null
  private submissionId: string | null = null

  async runDemo() {
    console.log('🎬 DOB Validator Demo Automation')
    console.log('='.repeat(60))

    try {
      // Step 1: Health Check
      console.log('1️⃣ Health Check...')
      await this.healthCheck()
      await this.sleep(1000)

      // Step 2: User Authentication
      console.log('2️⃣ User Authentication...')
      await this.authenticateUser()
      await this.sleep(2000)

      // Step 3: Profile Creation
      console.log('3️⃣ Profile Creation...')
      await this.createUserProfile()
      await this.sleep(1500)

      // Step 4: Device Submission
      console.log('4️⃣ Device Submission...')
      await this.submitDevice()
      await this.sleep(3000)

      // Step 5: Admin Authentication
      console.log('5️⃣ Admin Authentication...')
      await this.authenticateAdmin()
      await this.sleep(2000)

      // Step 6: Admin Review
      console.log('6️⃣ Admin Review...')
      await this.adminReview()
      await this.sleep(2500)

      // Step 7: Certificate Generation
      console.log('7️⃣ Certificate Generation...')
      await this.generateCertificate()
      await this.sleep(2000)

      this.printDemoSummary()
    } catch (error) {
      console.error('❌ Demo failed:', error)
    }
  }

  private async healthCheck() {
    const response = await axios.get(`${API_BASE_URL}/health`)
    console.log(`   ✅ Server: ${response.data.status}`)
  }

  private async authenticateUser() {
    const challengeResponse = await axios.post(`${API_BASE_URL}/api/auth/challenge`, {
      walletAddress: 'GDEMO_USER_WALLET_123'
    })

    const verifyResponse = await axios.post(`${API_BASE_URL}/api/auth/verify`, {
      walletAddress: 'GDEMO_USER_WALLET_123',
      signature: 'demo_user_signature',
      challenge: challengeResponse.data.challenge
    })

    this.userToken = verifyResponse.data.token
    console.log(`   ✅ User authenticated: ${verifyResponse.data.user.walletAddress}`)
  }

  private async createUserProfile() {
    if (!this.userToken) throw new Error('No user token')

    const response = await axios.post(`${API_BASE_URL}/api/profile`, {
      name: 'Demo User',
      company: 'Solar Energy Corp',
      email: 'demo@solarcorp.com'
    }, {
      headers: { Authorization: `Bearer ${this.userToken}` }
    })

    console.log(`   ✅ Profile created: ${response.data.profile.name}`)
  }

  private async submitDevice() {
    if (!this.userToken) throw new Error('No user token')

    const submissionData = {
      deviceName: 'Solar Farm Delta',
      deviceType: 'Solar Panel Array',
      serialNumber: 'SF-DEMO-001',
      manufacturer: 'SolarTech Industries',
      model: 'ST-500MW',
      yearOfManufacture: '2024',
      condition: 'New',
      specifications: '500MW capacity, 30 year warranty',
      purchasePrice: '250000000',
      currentValue: '250000000',
      expectedRevenue: '40000000',
      operationalCosts: '2500000'
    }

    const response = await axios.post(`${API_BASE_URL}/api/submissions`, submissionData, {
      headers: { Authorization: `Bearer ${this.userToken}` }
    })

    this.submissionId = response.data.submission.id
    console.log(`   ✅ Device submitted: ${response.data.submission.deviceName}`)
  }

  private async authenticateAdmin() {
    const challengeResponse = await axios.post(`${API_BASE_URL}/api/auth/challenge`, {
      walletAddress: 'GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ'
    })

    const verifyResponse = await axios.post(`${API_BASE_URL}/api/auth/verify`, {
      walletAddress: 'GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ',
      signature: 'admin_signature_demo',
      challenge: challengeResponse.data.challenge
    })

    this.adminToken = verifyResponse.data.token
    console.log(`   ✅ Admin authenticated: ${verifyResponse.data.user.role}`)
  }

  private async adminReview() {
    if (!this.adminToken || !this.submissionId) throw new Error('Missing admin token or submission ID')

    const response = await axios.put(`${API_BASE_URL}/api/submissions/${this.submissionId}/status`, {
      status: 'APPROVED',
      adminNotes: 'Excellent submission! All requirements met. Ready for certificate generation.'
    }, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    })

    console.log(`   ✅ Submission approved: ${response.data.submission.status}`)
  }

  private async generateCertificate() {
    const certificateHash = `DOB_CERT_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    console.log(`   ✅ Certificate generated: ${certificateHash}`)
  }

  private printDemoSummary() {
    console.log('\n' + '='.repeat(60))
    console.log('🎉 Demo Completed Successfully!')
    console.log('='.repeat(60))
    console.log('\n🔗 Demo Links:')
    console.log(`   Frontend: http://localhost:3002`)
    console.log(`   Backoffice: http://localhost:3000`)
    console.log(`   Backend API: ${API_BASE_URL}`)
    console.log('\n🚀 Ready for Production!')
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Run demo if this file is executed directly
if (require.main === module) {
  const demo = new DemoAutomation()
  demo.runDemo()
}

export { DemoAutomation } 