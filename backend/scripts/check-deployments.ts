#!/usr/bin/env ts-node


import { deploymentService } from '../src/lib/deployment-service'

async function checkDeployments() {
  try {
    console.log('🔍 Checking deployment history...\n')
    
    // Get recent deployments
    const recentDeployments = await deploymentService.getRecentDeployments(5)
    
    console.log('📋 Recent Deployments:')
    console.log('=====================')
    
    if (recentDeployments.length === 0) {
      console.log('No deployments found in database.')
      return
    }
    
    recentDeployments.forEach((deployment: any, index: number) => {
      console.log(`${index + 1}. ${deployment.version} (${deployment.environment})`)
      console.log(`   Deployed: ${deployment.deployedAt.toLocaleString()}`)
      console.log(`   Commit: ${deployment.commitHash || 'N/A'}`)
      console.log(`   Branch: ${deployment.branch || 'N/A'}`)
      console.log(`   Notes: ${deployment.notes || 'N/A'}`)
      console.log('')
    })
    
    // Get deployment stats
    const stats = await deploymentService.getDeploymentStats()
    
    console.log('📊 Deployment Statistics:')
    console.log('========================')
    console.log(`Total Deployments: ${stats.totalDeployments}`)
    console.log(`Production Deployments: ${stats.productionDeployments}`)
    console.log(`Recent Deployments (7 days): ${stats.recentDeployments}`)
    console.log(`Last Updated: ${stats.lastUpdated}`)
    
    // Get latest production deployment
    const latestProduction = await deploymentService.getLatestDeployment('production')
    if (latestProduction) {
      console.log('\n🚀 Latest Production Deployment:')
      console.log('================================')
      console.log(`Version: ${latestProduction.version}`)
      console.log(`Deployed: ${latestProduction.deployedAt.toLocaleString()}`)
      console.log(`Commit: ${latestProduction.commitHash || 'N/A'}`)
    }
    
  } catch (error) {
    console.error('❌ Failed to check deployments:', error)
    process.exit(1)
  }
}

// Run if this file is executed directly
if (require.main === module) {
  checkDeployments()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { checkDeployments } 