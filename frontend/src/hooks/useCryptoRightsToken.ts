import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getContractWithSigner } from '../utils/contracts';
import { toast } from 'react-toastify';

// Define an interface for token metadata
export interface TokenMetadata {
  id: number;
  uri: string;
  rightsType: string;
  createdAt: Date;
  creator: string;
  owner: string;
}

export function useCryptoRightsToken() {
  const { account, isConnected, provider, connectWallet } = useWeb3();
  const [userTokens, setUserTokens] = useState<TokenMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user tokens
  const fetchUserTokens = useCallback(async () => {
    if (!isConnected || !account) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const contract = getContractWithSigner('CryptoRightsToken', provider);
      
      // Call the tokensOfOwner function from the contract
      const tokens = await contract.tokensOfOwner(account);
      
      // Map the tokens to a more usable format
      const formattedTokens = await Promise.all(
        tokens.map(async (tokenId: number) => {
          // Get token URI and other details from contract
          const uri = await contract.tokenURI(tokenId);
          const rightsType = await contract.getRightsType(tokenId);
          const creator = await contract.getCreator(tokenId);
          
          // In a real app, we would fetch and parse metadata from the URI
          // For now, we just return the basic info
          return {
            id: tokenId,
            uri,
            rightsType,
            createdAt: new Date(),
            creator,
            owner: account
          };
        })
      );
      
      setUserTokens(formattedTokens);
    } catch (error) {
      console.error('Error fetching user tokens:', error);
      setError('Failed to fetch your tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [account, isConnected, provider]);

  // Create a new right
  const createRight = async (
    tokenURI: string, 
    rightsType: string,
    royaltyBasisPoints = 1000 // Default 10% (1000 basis points)
  ): Promise<number> => {
    if (!isConnected) {
      toast.info('Please connect your wallet first');
      await connectWallet();
      throw new Error('Wallet not connected');
    }
    
    try {
      const contract = getContractWithSigner('CryptoRightsToken', provider);
      
      // Call the createRight function from the contract with royalty parameter
      const tx = await contract.createRight(tokenURI, rightsType, royaltyBasisPoints);
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      // Get the token ID from the event
      const event = receipt.events?.find((e: any) => e.event === 'Transfer');
      const tokenId = event?.args?.tokenId?.toNumber() || 0;
      
      // Refresh user tokens
      await fetchUserTokens();
      
      return tokenId;
    } catch (error) {
      console.error('Error creating right:', error);
      throw new Error('Failed to create right');
    }
  };

  // Transfer a token
  const transferToken = async (tokenId: number, to: string): Promise<void> => {
    if (!isConnected) {
      toast.info('Please connect your wallet first');
      await connectWallet();
      throw new Error('Wallet not connected');
    }
    
    try {
      const contract = getContractWithSigner('CryptoRightsToken', provider);
      
      // Call the transfer function from the contract
      const tx = await contract.transferFrom(account, to, tokenId);
      
      // Wait for the transaction to be mined
      await tx.wait();
      
      // Refresh user tokens
      await fetchUserTokens();
      
      toast.success(`Token #${tokenId} transferred successfully`);
    } catch (error) {
      console.error('Error transferring token:', error);
      throw new Error('Failed to transfer token');
    }
  };

  // Fetch user tokens when account changes
  useEffect(() => {
    if (account) {
      fetchUserTokens();
    } else {
      setUserTokens([]);
    }
  }, [account, fetchUserTokens]);

  return {
    userTokens,
    isLoading,
    error,
    fetchUserTokens,
    createRight,
    transferToken
  };
} 