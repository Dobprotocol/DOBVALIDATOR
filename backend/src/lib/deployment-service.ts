import { prisma } from './database'

export interface DeploymentLogData {
  version: string
  environment: string
  commitHash?: string
  branch?: string
  notes?: string
  metadata?: any
}

export const deploymentService = {
  /**
   * Log a new deployment
   */
  async logDeployment(data: DeploymentLogData) {
    try {
      const deployment = await prisma.deploymentLog.create({
        data: {
          id: this.generateId(),
          version: data.version,
          environment: data.environment,
          deployedAt: new Date(),
          commitHash: data.commitHash,
          branch: data.branch,
          notes: data.notes,
          metadata: data.metadata
        }
      })
      
      console.log(`🚀 Deployment logged: ${data.version} to ${data.environment}`)
      return deployment
    } catch (error) {
      console.error('❌ Failed to log deployment:', error)
      throw error
    }
  },

  /**
   * Get recent deployments
   */
  async getRecentDeployments(limit: number = 10) {
    return prisma.deploymentLog.findMany({
      orderBy: { deployedAt: 'desc' },
      take: limit
    })
  },

  /**
   * Get deployments by environment
   */
  async getDeploymentsByEnvironment(environment: string, limit: number = 10) {
    return prisma.deploymentLog.findMany({
      where: { environment },
      orderBy: { deployedAt: 'desc' },
      take: limit
    })
  },

  /**
   * Get the latest deployment for an environment
   */
  async getLatestDeployment(environment: string) {
    return prisma.deploymentLog.findFirst({
      where: { environment },
      orderBy: { deployedAt: 'desc' }
    })
  },

  /**
   * Get deployment statistics
   */
  async getDeploymentStats() {
    const [totalDeployments, productionDeployments, recentDeployments] = await Promise.all([
      prisma.deploymentLog.count(),
      prisma.deploymentLog.count({ where: { environment: 'production' } }),
      prisma.deploymentLog.count({
        where: {
          deployedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ])

    return {
      totalDeployments,
      productionDeployments,
      recentDeployments,
      lastUpdated: new Date().toISOString()
    }
  },

  /**
   * Generate a unique ID for deployment logs
   */
  generateId(): string {
    return 'clx' + Math.random().toString(36).substr(2, 24)
  },

  /**
   * Get current deployment info from environment
   */
  getCurrentDeploymentInfo(): DeploymentLogData {
    return {
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      commitHash: process.env.COMMIT_HASH || process.env.GITHUB_SHA,
      branch: process.env.BRANCH || process.env.GITHUB_REF_NAME,
      notes: 'Automatic deployment log',
      metadata: {
        deployedAt: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    }
  }
} 