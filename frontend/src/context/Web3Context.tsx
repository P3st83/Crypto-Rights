import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

// Define the context props
export interface Web3ContextProps {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  provider: ethers.providers.Web3Provider | null;
  chainId: number | null;
  balance: string;
}

// Create the context with default values
const Web3Context = createContext<Web3ContextProps>({
  account: null,
  isConnected: false,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  provider: null,
  chainId: null,
  balance: '0',
});

// Provider component
export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>('0');

  // Initialize provider on component mount
  useEffect(() => {
    const initProvider = async () => {
      // Check if ethereum is available (MetaMask or similar)
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // Create ethers provider
          const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(ethersProvider);
          
          // Check if already connected
          const accounts = await ethersProvider.listAccounts();
          if (accounts.length > 0) {
            const currentAccount = accounts[0];
            setAccount(currentAccount);
            setIsConnected(true);
            
            // Get chain ID
            const network = await ethersProvider.getNetwork();
            setChainId(network.chainId);
            
            // Get account balance
            const accountBalance = await ethersProvider.getBalance(currentAccount);
            setBalance(ethers.utils.formatEther(accountBalance));
          }
        } catch (error) {
          console.error('Error initializing Web3Provider:', error);
        }
      }
    };
    
    initProvider();
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Handle account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          setAccount(null);
          setIsConnected(false);
          setBalance('0');
          toast.info('Wallet disconnected');
        } else {
          // Account changed
          const newAccount = accounts[0];
          setAccount(newAccount);
          setIsConnected(true);
          toast.success(`Connected: ${newAccount.slice(0, 6)}...${newAccount.slice(-4)}`);
          
          // Update balance
          if (provider) {
            provider.getBalance(newAccount).then(bal => {
              setBalance(ethers.utils.formatEther(bal));
            });
          }
        }
      };
      
      // Handle chain changes
      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
        
        // Reload the page on chain change as recommended by MetaMask
        window.location.reload();
      };
      
      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Clean up
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [provider]);

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('MetaMask or similar provider is required');
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      
      // Set ethers provider if not already set
      if (!provider) {
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(ethersProvider);
      }
      
      // Set account and connection status
      setAccount(account);
      setIsConnected(true);
      
      // Get chain ID
      const network = await provider!.getNetwork();
      setChainId(network.chainId);
      
      // Get account balance
      const accountBalance = await provider!.getBalance(account);
      setBalance(ethers.utils.formatEther(accountBalance));
      
      toast.success('Wallet connected successfully');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet (for UI purposes only, doesn't actually disconnect MetaMask)
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setBalance('0');
    toast.info('Wallet disconnected');
  };

  // Context value
  const value: Web3ContextProps = {
    account,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    provider,
    chainId,
    balance,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Custom hook to use the Web3 context
export const useWeb3 = () => useContext(Web3Context);

// Declare ethereum property on window
declare global {
  interface Window {
    ethereum?: any;
  }
} 