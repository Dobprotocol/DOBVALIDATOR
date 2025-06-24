// Admin wallet configuration for DOB Validator backoffice

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
  /**
   * Check if a wallet address is an admin
   */
  isAdminWallet(walletAddress: string): boolean {
    return ADMIN_WALLETS.some(wallet => 
      wallet.address === walletAddress && wallet.isActive
    )
  }

  /**
   * Get admin wallet details
   */
  getAdminWallet(walletAddress: string): AdminWallet | null {
    return ADMIN_WALLETS.find(wallet => 
      wallet.address === walletAddress && wallet.isActive
    ) || null
  }

  /**
   * Check if admin has specific permission
   */
  hasPermission(walletAddress: string, permission: string): boolean {
    const admin = this.getAdminWallet(walletAddress)
    if (!admin) return false
    
    return admin.permissions.includes(permission)
  }

  /**
   * Get all active admin wallets
   */
  getActiveAdmins(): AdminWallet[] {
    return ADMIN_WALLETS.filter(wallet => wallet.isActive)
  }

  /**
   * Get admins by role
   */
  getAdminsByRole(role: AdminWallet['role']): AdminWallet[] {
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
    const activeAdmins = this.getActiveAdmins()
    return {
      totalAdmins: activeAdmins.length,
      superAdmins: activeAdmins.filter(a => a.role === 'SUPER_ADMIN').length,
      validators: activeAdmins.filter(a => a.role === 'VALIDATOR').length,
      reviewers: activeAdmins.filter(a => a.role === 'REVIEWER').length
    }
  }
}

// Create and export singleton instance
const adminConfigService = new AdminConfigService()

export { adminConfigService }
export default adminConfigService 