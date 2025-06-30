import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WalletState {
  walletAddress: string | null
  setWalletAddress: (address: string | null) => void
  clearWallet: () => void
}

const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      walletAddress: null,
      setWalletAddress: (address) => set({ walletAddress: address }),
      clearWallet: () => set({ walletAddress: null }),
    }),
    {
      name: 'wallet-storage',
    }
  )
)

export function useWallet() {
  const { walletAddress, setWalletAddress, clearWallet } = useWalletStore()

  const connectWallet = async (address: string) => {
    setWalletAddress(address)
  }

  const disconnectWallet = () => {
    clearWallet()
  }

  return {
    walletAddress,
    isConnected: !!walletAddress,
    connectWallet,
    disconnectWallet,
  }
} 