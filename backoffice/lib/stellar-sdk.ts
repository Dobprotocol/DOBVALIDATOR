import { Networks } from '@stellar/stellar-sdk'

declare global {
  interface Window {
    freighter: {
      isConnected: () => Promise<boolean>
      getPublicKey: () => Promise<string>
      signTransaction: (xdr: string, network: string) => Promise<string>
    }
  }
}

export const isFreighterInstalled = (): boolean => {
  return typeof window !== 'undefined' && window.freighter !== undefined
}

export const isFreighterConnected = async (): Promise<boolean> => {
  if (!isFreighterInstalled()) {
    return false
  }
  try {
    return await window.freighter.isConnected()
  } catch (e) {
    console.error('Error checking Freighter connection:', e)
    return false
  }
}

export const getFreighterPublicKey = async (): Promise<string | null> => {
  if (!isFreighterInstalled()) {
    return null
  }
  try {
    return await window.freighter.getPublicKey()
  } catch (e) {
    console.error('Error getting Freighter public key:', e)
    return null
  }
}

export const signTransactionWithFreighter = async (xdr: string): Promise<string | null> => {
  if (!isFreighterInstalled()) {
    return null
  }
  try {
    return await window.freighter.signTransaction(xdr, Networks.TESTNET)
  } catch (e) {
    console.error('Error signing transaction with Freighter:', e)
    return null
  }
} 