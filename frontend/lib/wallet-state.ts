// Wallet state management utilities

export interface WalletState {
  isConnected: boolean
  isAuthenticated: boolean
  publicKey: string | null
  walletType: string | null
  isConnecting: boolean
  isAuthenticating: boolean
}

class WalletStateManager {
  private state: WalletState = {
    isConnected: false,
    isAuthenticated: false,
    publicKey: null,
    walletType: null,
    isConnecting: false,
    isAuthenticating: false
  }

  private listeners: Set<(state: WalletState) => void> = new Set()

  getState(): WalletState {
    return { ...this.state }
  }

  setState(updates: Partial<WalletState>) {
    this.state = { ...this.state, ...updates }
    this.notifyListeners()
  }

  connect(publicKey: string, walletType: string) {
    this.setState({
      isConnected: true,
      publicKey,
      walletType,
      isConnecting: false
    })
  }

  authenticate() {
    this.setState({
      isAuthenticated: true,
      isAuthenticating: false
    })
  }

  disconnect() {
    this.setState({
      isConnected: false,
      isAuthenticated: false,
      publicKey: null,
      walletType: null,
      isConnecting: false,
      isAuthenticating: false
    })
  }

  setConnecting(isConnecting: boolean) {
    this.setState({ isConnecting })
  }

  setAuthenticating(isAuthenticating: boolean) {
    this.setState({ isAuthenticating })
  }

  subscribe(listener: (state: WalletState) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.getState())
      } catch (error) {
        console.error('Error in wallet state listener:', error)
      }
    })
  }
}

// Global wallet state manager instance
export const walletStateManager = new WalletStateManager()

// Helper functions
export const getWalletState = () => walletStateManager.getState()

export const connectWallet = (publicKey: string, walletType: string) => {
  walletStateManager.connect(publicKey, walletType)
}

export const authenticateWallet = () => {
  walletStateManager.authenticate()
}

export const disconnectWallet = () => {
  walletStateManager.disconnect()
}

export const setWalletConnecting = (isConnecting: boolean) => {
  walletStateManager.setConnecting(isConnecting)
}

export const setWalletAuthenticating = (isAuthenticating: boolean) => {
  walletStateManager.setAuthenticating(isAuthenticating)
} 