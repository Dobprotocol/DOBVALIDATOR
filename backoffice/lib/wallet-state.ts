// Wallet state management utilities
import { logWithDOBArt, logWithStellarArt, logWithBothArts } from './utils'

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
    logWithStellarArt(`Connecting wallet: ${publicKey.slice(0, 8)}... (${walletType})`, 'info')
    this.setState({
      isConnected: true,
      publicKey,
      walletType,
      isConnecting: false
    })
    logWithStellarArt('Wallet connection successful', 'success')
  }

  authenticate() {
    logWithDOBArt('Authenticating wallet', 'info')
    this.setState({
      isAuthenticated: true,
      isAuthenticating: false
    })
    logWithDOBArt('Wallet authentication successful', 'success')
  }

  disconnect() {
    logWithBothArts('Disconnecting wallet', 'info')
    this.setState({
      isConnected: false,
      isAuthenticated: false,
      publicKey: null,
      walletType: null,
      isConnecting: false,
      isAuthenticating: false
    })
    logWithBothArts('Wallet disconnection completed', 'success')
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
  logWithStellarArt(`Helper: Connecting wallet ${publicKey.slice(0, 8)}...`, 'info')
  walletStateManager.connect(publicKey, walletType)
}

export const authenticateWallet = () => {
  logWithDOBArt('Helper: Authenticating wallet', 'info')
  walletStateManager.authenticate()
}

export const disconnectWallet = () => {
  logWithBothArts('Helper: Disconnecting wallet', 'info')
  walletStateManager.disconnect()
}

export const setWalletConnecting = (isConnecting: boolean) => {
  walletStateManager.setConnecting(isConnecting)
}

export const setWalletAuthenticating = (isAuthenticating: boolean) => {
  walletStateManager.setAuthenticating(isAuthenticating)
} 