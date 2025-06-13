import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_ADDRESSES } from '../utils/contracts';
import { getContractWithSigner, getContract, etherToWei, weiToEther } from '../utils/contracts';
import { toast } from 'react-toastify';

// Simple ABI for the marketplace functions we'll use
const CryptoRightsMarketplaceABI = [
  // Token listing functions
  "function listToken(uint256 tokenId, uint256 price) external",
  "function cancelListing(uint256 tokenId) external",
  "function buyToken(uint256 tokenId) external payable",
  
  // License functions
  "function createLicense(uint256 tokenId, address licensee, uint256 duration, uint256 price, string memory licenseType) external",
  "function buyLicense(uint256 tokenId, uint256 licenseId) external payable",
  
  // View functions
  "function getListingPrice(uint256 tokenId) external view returns (uint256)",
  "function isTokenListed(uint256 tokenId) external view returns (bool)",
  "function getLicensePrice(uint256 tokenId, uint256 licenseId) external view returns (uint256)",
  "function getLicenseDetails(uint256 tokenId, uint256 licenseId) external view returns (address, uint256, uint256, string memory, bool)",
  "function getAvailableLicensesForToken(uint256 tokenId) external view returns (uint256[] memory)",
  
  // Events
  "event TokenListed(uint256 indexed tokenId, address indexed seller, uint256 price)",
  "event ListingCancelled(uint256 indexed tokenId, address indexed seller)",
  "event TokenSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)",
  "event LicenseCreated(uint256 indexed tokenId, uint256 indexed licenseId, address indexed owner, uint256 price, uint256 duration)",
  "event LicensePurchased(uint256 indexed tokenId, uint256 indexed licenseId, address indexed licensee, uint256 price)"
];

// Interface for token listing
export interface TokenListing {
  tokenId: number;
  seller: string;
  price: string;
  timestamp: Date;
}

// Interface for license
export interface TokenLicense {
  licenseId: number;
  tokenId: number;
  owner: string;
  licensee: string | null;
  price: string;
  duration: number; // duration in seconds
  licenseType: string;
  isActive: boolean;
  expiration: Date | null;
}

export function useCryptoRightsMarketplace() {
  const { account, isConnected, provider, connectWallet } = useWeb3();
  const [listedTokens, setListedTokens] = useState<TokenListing[]>([]);
  const [userLicenses, setUserLicenses] = useState<TokenLicense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all listed tokens
  const fetchListedTokens = useCallback(async () => {
    if (!provider) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const contract = getContract('CryptoRightsMarketplace', provider);
      
      // Get all listed token IDs
      const tokenIds = await contract.getListedTokens();
      
      // Get details for each listing
      const listings = await Promise.all(
        tokenIds.map(async (tokenId: number) => {
          const price = await contract.getListingPrice(tokenId);
          const seller = await contract.functions.getTokenSeller(tokenId);
          
          return {
            tokenId,
            seller: seller[0], // Result comes as array from function call
            price: weiToEther(price),
            timestamp: new Date() // In a real app, we would get the actual timestamp
          };
        })
      );
      
      setListedTokens(listings);
    } catch (error) {
      console.error('Error fetching listed tokens:', error);
      setError('Failed to fetch marketplace listings');
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  // Check if a token is listed
  const isTokenListed = useCallback(async (tokenId: number): Promise<boolean> => {
    if (!provider) return false;
    
    try {
      const contract = getContract('CryptoRightsMarketplace', provider);
      return await contract.isTokenListed(tokenId);
    } catch (error) {
      console.error('Error checking if token is listed:', error);
      return false;
    }
  }, [provider]);

  // Get the listing price for a token
  const getListingPrice = useCallback(async (tokenId: number): Promise<string> => {
    if (!provider) return '0';
    
    try {
      const contract = getContract('CryptoRightsMarketplace', provider);
      const price = await contract.getListingPrice(tokenId);
      return weiToEther(price);
    } catch (error) {
      console.error('Error getting listing price:', error);
      return '0';
    }
  }, [provider]);

  // List a token for sale
  const listToken = async (tokenId: number, price: string): Promise<void> => {
    if (!isConnected) {
      toast.info('Please connect your wallet first');
      await connectWallet();
      throw new Error('Wallet not connected');
    }
    
    try {
      // Get token contract first to approve marketplace
      const tokenContract = getContractWithSigner('CryptoRightsToken', provider);
      const marketplaceContract = getContractWithSigner('CryptoRightsMarketplace', provider);
      
      // Get marketplace address
      const marketplaceAddress = marketplaceContract.address;
      
      // Approve marketplace to transfer the token
      toast.info('Approving marketplace to transfer your token...');
      const approveTx = await tokenContract.approve(marketplaceAddress, tokenId);
      await approveTx.wait();
      
      // Now list the token
      toast.info('Listing token for sale...');
      const priceInWei = etherToWei(price);
      const listTx = await marketplaceContract.listToken(tokenId, priceInWei);
      await listTx.wait();
      
      // Refresh listings
      await fetchListedTokens();
      
      toast.success(`Token #${tokenId} listed for ${price} ETH`);
    } catch (error) {
      console.error('Error listing token:', error);
      toast.error('Failed to list token');
      throw new Error('Failed to list token');
    }
  };

  // Buy a listed token
  const buyToken = async (tokenId: number, price: string): Promise<void> => {
    if (!isConnected) {
      toast.info('Please connect your wallet first');
      await connectWallet();
      throw new Error('Wallet not connected');
    }
    
    try {
      const contract = getContractWithSigner('CryptoRightsMarketplace', provider);
      
      // Convert price to wei
      const priceInWei = etherToWei(price);
      
      // Buy the token
      toast.info('Purchasing token...');
      const tx = await contract.buyToken(tokenId, { value: priceInWei });
      await tx.wait();
      
      // Refresh listings
      await fetchListedTokens();
      
      toast.success(`Successfully purchased token #${tokenId}`);
    } catch (error) {
      console.error('Error buying token:', error);
      toast.error('Failed to buy token');
      throw new Error('Failed to buy token');
    }
  };

  // Cancel a token listing
  const cancelListing = async (tokenId: number): Promise<void> => {
    if (!isConnected) {
      toast.info('Please connect your wallet first');
      await connectWallet();
      throw new Error('Wallet not connected');
    }
    
    try {
      const contract = getContractWithSigner('CryptoRightsMarketplace', provider);
      
      // Cancel the listing
      toast.info('Cancelling listing...');
      const tx = await contract.cancelListing(tokenId);
      await tx.wait();
      
      // Refresh listings
      await fetchListedTokens();
      
      toast.success(`Listing cancelled for token #${tokenId}`);
    } catch (error) {
      console.error('Error cancelling listing:', error);
      toast.error('Failed to cancel listing');
      throw new Error('Failed to cancel listing');
    }
  };

  // Fetch user's licenses
  const fetchUserLicenses = async () => {
    if (!provider) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real app, we would query events or indexed data
      // This is a simplified version for the demo
      // We would filter LicensePurchased events where licensee = account
      
      // Mock implementation - in a real app this would query the contract events
      const now = new Date();
      const mockLicenses: TokenLicense[] = [
        {
          licenseId: 1,
          tokenId: 3,
          owner: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          licensee: account,
          price: '0.1',
          duration: 30 * 24 * 60 * 60, // 30 days in seconds
          licenseType: 'personal',
          isActive: true,
          expiration: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        },
        {
          licenseId: 2,
          tokenId: 4,
          owner: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
          licensee: account,
          price: '0.2',
          duration: 90 * 24 * 60 * 60, // 90 days in seconds
          licenseType: 'commercial',
          isActive: true,
          expiration: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
        }
      ];
      
      setUserLicenses(mockLicenses);
      return mockLicenses;
    } catch (err: any) {
      console.error('Error fetching user licenses:', err);
      setError(err.message || 'Failed to fetch licenses');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch listings on mount and when account changes
  useEffect(() => {
    if (provider) {
      fetchListedTokens();
    }
  }, [provider, fetchListedTokens]);

  return {
    listedTokens,
    userLicenses,
    isLoading,
    error,
    fetchListedTokens,
    isTokenListed,
    getListingPrice,
    listToken,
    buyToken,
    cancelListing,
    fetchUserLicenses
  };
} 