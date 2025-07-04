// Admin wallet configuration for DOB Validator backoffice
import { logWithDOBArt } from './utils'

export interface AdminWallet {
  address: string
  name: string
  role: 'SUPER_ADMIN' | 'VALIDATOR' | 'REVIEWER'
  permissions: string[]
  isActive: boolean
}

// Admin wallet whitelist
// In production, this would be stored in a database or environment variables
export const ADMIN_WALLETS: AdminWallet[] = [
  {
    address: 'GAAKZ5PTQ7YLHTWQJQWEPAFOHEYFADEPB4DCBE4JWT63JCYJTCGULCAC',
    name: 'Forecast',
    role: 'SUPER_ADMIN',
    permissions: ['approve', 'reject', 'review', 'manage_users', 'view_stats'],
    isActive: true
  },
  {
    address: 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN',
    name: 'Current User',
    role: 'SUPER_ADMIN',
    permissions: ['approve', 'reject', 'review', 'manage_users', 'view_stats'],
    isActive: true
  },
  {
    address: 'GDGYOBHJVNGVBCIHKDR7H6NNYRSPPK2TWANH6SIY34DJLSXUOJNXA2SN',
    name: 'Whitelist 1',
    role: 'VALIDATOR',
    permissions: ['approve', 'reject', 'review'],
    isActive: true
  },
  {
    address: 'GCLASRLEFVHLLYHIMTAC36E42OTZPKQDAL52AEKBVTIWNPVEC4GXMAFG',
    name: 'Whitelist 2',
    role: 'VALIDATOR',
    permissions: ['approve', 'reject', 'review'],
    isActive: true
  },
  {
    address: 'GC6GCTEW7Y4GA6DH7WM26NEKSW4RPI3ZVN6E3FLW3ZVNILKLV77I43BK',
    name: 'User 1',
    role: 'VALIDATOR',
    permissions: ['approve', 'reject', 'review'],
    isActive: true
  },
  {
    address: 'GCGZFA2PFQYHPGWCOL36J7DXQ3O3TFNIN24QAQ7J4BWQYH6OIGA7THOY',
    name: 'User 2',
    role: 'VALIDATOR',
    permissions: ['approve', 'reject', 'review'],
    isActive: true
  }
  // Old example wallets removed for clarity
]

// Admin configuration service
class AdminConfigService {
  // MVP Mode: Allow any wallet to connect (enabled for production MVP)
  private isMVPMode(): boolean {
    // MVP mode is enabled for all environments during the MVP phase
    // This allows any wallet to connect to the backoffice for Stellar's review process
    return true
  }

  /**
   * Check if a wallet address is an admin
   * 
   */
  isAdminWallet(walletAddress: string): boolean {
    // In MVP mode, treat any connected wallet as a VALIDATOR
    if (this.isMVPMode()) {
      logWithDOBArt(`MVP Mode: Treating wallet as VALIDATOR: ${walletAddress.slice(0, 8)}...`, 'success')
      return true
    }

    const isAdmin = ADMIN_WALLETS.some(wallet => 
      wallet.address === walletAddress && wallet.isActive
    )
    
    if (isAdmin) {
      logWithDOBArt(`Admin wallet verified: ${walletAddress.slice(0, 8)}...`, 'success')
    } else {
      logWithDOBArt(`Non-admin wallet detected: ${walletAddress.slice(0, 8)}...`, 'warning')
    }
    
    return isAdmin
  }

  /**
   * Get admin wallet details
   */
  getAdminWallet(walletAddress: string): AdminWallet | null {
    // In MVP mode, create a temporary admin profile for any wallet
    if (this.isMVPMode()) {
      const mvpAdmin: AdminWallet = {
        address: walletAddress,
        name: `MVP User (${walletAddress.slice(0, 8)}...)`,
        role: 'VALIDATOR',
        permissions: ['approve', 'reject', 'review'],
        isActive: true
      }
      
      logWithDOBArt(`MVP Mode: Created temporary admin profile for ${walletAddress.slice(0, 8)}...`, 'info')
      return mvpAdmin
    }

    const admin = ADMIN_WALLETS.find(wallet => 
      wallet.address === walletAddress && wallet.isActive
    ) || null
    
    if (admin) {
      logWithDOBArt(`Retrieved admin details for ${admin.name} (${admin.role})`, 'info')
    } else {
      logWithDOBArt(`No admin found for wallet: ${walletAddress.slice(0, 8)}...`, 'warning')
    }
    
    return admin
  }

  /**
   * Check if admin has specific permission
   */
  hasPermission(walletAddress: string, permission: string): boolean {
    // In MVP mode, grant all basic permissions
    if (this.isMVPMode()) {
      const basicPermissions = ['approve', 'reject', 'review']
      return basicPermissions.includes(permission)
    }

    const admin = this.getAdminWallet(walletAddress)
    if (!admin) return false
    
    return admin.permissions.includes(permission)
  }

  /**
   * Get all active admin wallets
   */
  getActiveAdmins(): AdminWallet[] {
    if (this.isMVPMode()) {
      // In MVP mode, return empty array since we don't have persistent admin list
      return []
    }
    
    return ADMIN_WALLETS.filter(wallet => wallet.isActive)
  }

  /**
   * Get admins by role
   */
  getAdminsByRole(role: AdminWallet['role']): AdminWallet[] {
    if (this.isMVPMode()) {
      // In MVP mode, return empty array since we don't have persistent admin list
      return []
    }
    
    return ADMIN_WALLETS.filter(wallet => 
      wallet.role === role && wallet.isActive
    )
  }

  /**
   * Add new admin wallet (for future use)
   */
  addAdminWallet(admin: Omit<AdminWallet, 'isActive'>): void {
    const newAdmin: AdminWallet = {
      ...admin,
      isActive: true
    }
    ADMIN_WALLETS.push(newAdmin)
  }

  /**
   * Deactivate admin wallet
   */
  deactivateAdminWallet(walletAddress: string): boolean {
    const admin = ADMIN_WALLETS.find(wallet => wallet.address === walletAddress)
    if (admin) {
      admin.isActive = false
      return true
    }
    return false
  }

  /**
   * Get admin statistics
   */
  getAdminStats() {
    if (this.isMVPMode()) {
      // In MVP mode, return basic stats
      return {
        totalAdmins: 0, // We don't track persistent admins in MVP mode
        superAdmins: 0,
        validators: 0,
        reviewers: 0,
        mvpMode: true
      }
    }
    
    const activeAdmins = this.getActiveAdmins()
    const superAdmins = activeAdmins?.filter(a => a.role === 'SUPER_ADMIN') || []
    const validators = activeAdmins?.filter(a => a.role === 'VALIDATOR') || []
    const reviewers = activeAdmins?.filter(a => a.role === 'REVIEWER') || []
    
    return {
      totalAdmins: activeAdmins && Array.isArray(activeAdmins) ? activeAdmins.length : 0,
      superAdmins: superAdmins.length,
      validators: validators.length,
      reviewers: reviewers.length,
      mvpMode: false
    }
  }

  /**
   * Check if MVP mode is enabled
   */
  isMVPModeEnabled(): boolean {
    return this.isMVPMode()
  }
}

// Create and export singleton instance
const adminConfigService = new AdminConfigService()

export { adminConfigService }
export default adminConfigService 