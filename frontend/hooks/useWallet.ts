import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getFreighterPublicKey, isFreighterConnected, isFreighterInstalled } from '@/lib/stellar-sdk'

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

  const connectWallet = async () => {
    if (!isFreighterInstalled()) {
      throw new Error('Please install the Freighter wallet extension')
    }

    const isConnected = await isFreighterConnected()
    if (!isConnected) {
      throw new Error('Please connect your Freighter wallet')
    }

    const publicKey = await getFreighterPublicKey()
    setWalletAddress(publicKey)
    return publicKey
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