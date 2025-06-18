import { useState, useEffect } from 'react';

interface WalletState {
  address: string | null;
  isConnected: boolean;
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
  });

  useEffect(() => {
    // Check if wallet is already connected
    const checkWalletConnection = async () => {
      try {
        // TODO: Implement actual wallet connection check
        // This is a placeholder for the actual implementation
        const connectedAddress = localStorage.getItem('walletAddress');
        if (connectedAddress) {
          setWalletState({
            address: connectedAddress,
            isConnected: true,
          });
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkWalletConnection();
  }, []);

  return {
    ...walletState,
  };
} 