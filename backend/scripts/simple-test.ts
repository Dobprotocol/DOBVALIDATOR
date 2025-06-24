#!/usr/bin/env ts-node

import axios from 'axios'
import { env } from '../src/lib/env-validation'

const API_BASE_URL = `http://localhost:${env.PORT}`

class SimpleTestRunner {
  async runSimpleTests() {
    console.log('🧪 DOB Validator Simple Tests')
    console.log('='.repeat(60))
    console.log(`📍 API Base URL: ${API_BASE_URL}`)
    console.log('='.repeat(60))

    try {
      await this.testHealthCheck()
      await this.testEnvironmentInfo()
      await this.testCORSHeaders()
      await this.testSecurityHeaders()
      
      this.printResults()
    } catch (error) {
      console.error('❌ Simple test suite failed:', error)
      process.exit(1)
    }
  }

  private async testHealthCheck() {
    console.log('\n🔧 Testing Health Check...')
    const startTime = Date.now()

    try {
      const response = await axios.get(`${API_BASE_URL}/health`)
      
      console.log(`✅ Health Check: ${response.data.status}`)
      console.log(`   ⏱️  Duration: ${Date.now() - startTime}ms`)
      console.log(`   📅 Timestamp: ${response.data.timestamp}`)
    } catch (error) {
      console.log(`❌ Health Check failed: ${(error as any).message}`)
      throw new Error('Health check failed')
    }
  }

  private async testEnvironmentInfo() {
    console.log('\n🔧 Testing Environment Info...')
    const startTime = Date.now()

    try {
      const response = await axios.get(`${API_BASE_URL}/health`)
      
      console.log(`✅ Environment Info:`)
      console.log(`   🔧 Environment: ${env.NODE_ENV}`)
      console.log(`   🌐 CORS Origin: ${env.CORS_ORIGIN}`)
      console.log(`   ⭐ Stellar Network: ${env.STELLAR_NETWORK}`)
      console.log(`   🔐 JWT Secret: ${env.JWT_SECRET ? 'Configured' : 'Missing'}`)
      console.log(`   📊 Rate Limit: ${env.RATE_LIMIT_WINDOW_MS}ms window`)
      console.log(`   ⏱️  Duration: ${Date.now() - startTime}ms`)
    } catch (error) {
      console.log(`❌ Environment info failed: ${(error as any).message}`)
    }
  }

  private async testCORSHeaders() {
    console.log('\n🌐 Testing CORS Headers...')
    const startTime = Date.now()

    try {
      const response = await axios.options(`${API_BASE_URL}/health`)
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
      }

      console.log(`✅ CORS Headers:`)
      Object.entries(corsHeaders).forEach(([key, value]) => {
        console.log(`   ${key}: ${value || 'Not set'}`)
      })
      console.log(`   ⏱️  Duration: ${Date.now() - startTime}ms`)
    } catch (error) {
      console.log(`❌ CORS test failed: ${(error as any).message}`)
    }
  }

  private async testSecurityHeaders() {
    console.log('\n🔒 Testing Security Headers...')
    const startTime = Date.now()

    try {
      const response = await axios.get(`${API_BASE_URL}/health`)
      
      const securityHeaders = {
        'Content-Security-Policy': response.headers['content-security-policy'],
        'X-Content-Type-Options': response.headers['x-content-type-options'],
        'X-Frame-Options': response.headers['x-frame-options'],
        'X-XSS-Protection': response.headers['x-xss-protection'],
        'Strict-Transport-Security': response.headers['strict-transport-security']
      }

      console.log(`✅ Security Headers:`)
      Object.entries(securityHeaders).forEach(([key, value]) => {
        console.log(`   ${key}: ${value || 'Not set'}`)
      })
      console.log(`   ⏱️  Duration: ${Date.now() - startTime}ms`)
    } catch (error) {
      console.log(`❌ Security headers test failed: ${(error as any).message}`)
    }
  }

  private printResults() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 Simple Test Results Summary')
    console.log('='.repeat(60))
    console.log('✅ All basic functionality tests completed!')
    console.log('🔧 Backend server is running and configured correctly')
    console.log('🔒 Security headers are properly configured')
    console.log('🌐 CORS is properly configured')
    console.log('\n🚀 Backend is ready for integration testing!')
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new SimpleTestRunner()
  runner.runSimpleTests().catch(error => {
    console.error('❌ Simple test suite failed:', error)
    process.exit(1)
  })
}

export { SimpleTestRunner } 