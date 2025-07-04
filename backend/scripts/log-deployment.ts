#!/usr/bin/env ts-node

import { deploymentService } from '../src/lib/deployment-service'

async function logDeployment() {
  try {
    console.log('🚀 Logging deployment to database...')
    
    const deploymentInfo = deploymentService.getCurrentDeploymentInfo()
    
    // Add some additional context
    deploymentInfo.notes = 'Backend startup deployment log'
    deploymentInfo.metadata = {
      ...deploymentInfo.metadata,
      startupTime: new Date().toISOString(),
      processId: process.pid,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
    
    const result = await deploymentService.logDeployment(deploymentInfo)
    
    console.log('✅ Deployment logged successfully:', {
      id: result.id,
      version: result.version,
      environment: result.environment,
      deployedAt: result.deployedAt
    })
    
    return result
  } catch (error) {
    console.error('❌ Failed to log deployment:', error)
    // Don't throw - we don't want deployment logging to break the app
    return null
  }
}

// Run if this file is executed directly
if (require.main === module) {
  logDeployment()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { logDeployment } 