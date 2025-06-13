import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useWeb3 } from '../../src/context/Web3Context';
import { useCryptoRightsToken } from '../../src/hooks/useCryptoRightsToken';
import { useCryptoRightsMarketplace } from '../../src/hooks/useCryptoRightsMarketplace';
import { fetchMetadataFromIPFS, getIPFSHttpUrl } from '../../src/utils/ipfs';
import { formatAddress, weiToEther } from '../../src/utils/contracts';
import { toast } from 'react-toastify';

// License types
const LICENSE_TYPES = {
  personal: { name: 'Personal', color: 'green' },
  commercial: { name: 'Commercial', color: 'blue' },
  exclusive: { name: 'Exclusive', color: 'purple' }
};

// Mock license offerings data - in a real app would come from the contract
const MOCK_LICENSE_OFFERINGS = [
  {
    id: 1,
    licenseType: 'personal',
    duration: 30 * 24 * 60 * 60, // 30 days in seconds
    price: '0.05',
    maxLicenses: 100,
    sold: 5,
    active: true
  },
  {
    id: 2,
    licenseType: 'commercial',
    duration: 90 * 24 * 60 * 60, // 90 days in seconds
    price: '0.2',
    maxLicenses: 20,
    sold: 2,
    active: true
  },
  {
    id: 3,
    licenseType: 'exclusive',
    duration: 365 * 24 * 60 * 60, // 1 year in seconds
    price: '1.5',
    maxLicenses: 1,
    sold: 0,
    active: true
  }
];

// Token history event type
interface TokenEvent {
  event: string;
  from: string;
  to: string | null;
  price: string | null;
  timestamp: Date;
}

// Token details type
interface TokenDetails {
  id: number;
  title: string;
  description: string;
  creator: string;
  creatorName?: string;
  rightsType: string;
  contentUri: string;
  previewUri: string;
  price: string | null;
  royaltyPercentage: number;
  creationDate: Date;
  owner: string;
  isListed: boolean;
  tokenHistory: TokenEvent[];
  attributes?: { trait_type: string; value: string | number }[];
}

export default function TokenDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { account, isConnected, connectWallet } = useWeb3();
  const { userTokens, transferToken } = useCryptoRightsToken();
  const { listToken, cancelListing, isTokenListed, getListingPrice } = useCryptoRightsMarketplace();
  
  const [token, setToken] = useState<TokenDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [availableLicenses, setAvailableLicenses] = useState<any[]>([]);
  const [isPurchasingLicense, setIsPurchasingLicense] = useState(false);

  // Load token data
  useEffect(() => {
    if (!id) return;

    const fetchToken = async () => {
      setIsLoading(true);
      try {
        // In a production app, we would fetch this from the blockchain and IPFS
        // For now, we'll use a combination of real and mock data
        let tokenData: TokenDetails;
        
        // In a real app, we would get the token owner, URI, and other details from the blockchain
        // Then fetch the metadata from IPFS
        try {
          // Query contract for token data
          const tokenContract = await fetch(`/api/tokens/${id}`);
          const contractData = await tokenContract.json();
          
          // Fetch metadata from IPFS
          const metadata = await fetchMetadataFromIPFS(contractData.tokenURI);
          
          // Extract royalty percentage from attributes
          const royaltyAttribute = metadata.attributes.find(
            (attr: any) => attr.trait_type === 'Royalty Percentage'
          );
          const royaltyPercentage = royaltyAttribute ? Number(royaltyAttribute.value) : 10;
          
          // Create token details
          tokenData = {
            id: Number(id),
            title: metadata.name,
            description: metadata.description,
            creator: contractData.creator,
            creatorName: metadata.creator?.slice(0, 8) || 'Unknown Creator',
            rightsType: metadata.rights_type,
            contentUri: metadata.animation_url || '',
            previewUri: getIPFSHttpUrl(metadata.image),
            price: contractData.isListed ? contractData.price : null,
            royaltyPercentage,
            creationDate: new Date(metadata.created_at || contractData.creationDate),
            owner: contractData.owner,
            isListed: contractData.isListed,
            tokenHistory: contractData.history || [],
            attributes: metadata.attributes
          };
        } catch (error) {
          console.warn('Error fetching on-chain data, using mock data:', error);
          // Fallback to mock data
          tokenData = {
            id: Number(id),
            title: 'Digital Music Rights #153',
            description: 'Exclusive rights to digital distribution of "Ethereum Dreams" by Blockchain Beats.',
            creator: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            creatorName: 'BlockchainBeats',
            rightsType: 'music',
            contentUri: 'ipfs://QmXyZ123...',
            previewUri: '/images/placeholders/music.jpg',
            price: '0.75',
            royaltyPercentage: 15,
            creationDate: new Date(2023, 3, 10),
            owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            isListed: true,
            tokenHistory: [
              { 
                event: 'minted', 
                from: '0x0000000000000000000000000000000000000000', 
                to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
                price: null,
                timestamp: new Date(2023, 3, 10)
              },
              { 
                event: 'listed', 
                from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
                to: null, 
                price: '0.75',
                timestamp: new Date(2023, 3, 15)
              }
            ]
          };
        }
        
        setToken(tokenData);
        
        if (isConnected && account) {
          // Check if current user is the owner
          setIsOwner(tokenData.owner.toLowerCase() === account.toLowerCase());
        }

        // In a real app, we would fetch available licenses from the contract
        // For now, use mock data
        setAvailableLicenses(MOCK_LICENSE_OFFERINGS);
      } catch (error) {
        console.error('Error fetching token:', error);
        toast.error('Failed to load token details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [id, account, isConnected]);

  // Handle token transfer
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.info('Please connect your wallet first');
      return;
    }

    if (!transferTo || !transferTo.startsWith('0x') || transferTo.length !== 42) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    setIsTransferring(true);
    try {
      // In a real app, this would call the transferToken function from the hook
      await transferToken(Number(id), transferTo);
      
      // Success message
      toast.success(`Token #${id} transferred successfully to ${formatAddress(transferTo)}`);
      setShowTransferModal(false);
      
      // Redirect to dashboard after successful transfer
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (error) {
      console.error('Error transferring token:', error);
      toast.error('Failed to transfer token. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  // Handle token listing
  const handleListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.info('Please connect your wallet first');
      return;
    }

    if (!listingPrice || parseFloat(listingPrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsListing(true);
    try {
      // Call the listToken function
      await listToken(Number(id), listingPrice);
      
      // Success message
      setShowListingModal(false);
      
      // Update token state
      setToken((prev) => prev ? { ...prev, isListed: true, price: listingPrice } : null);
    } catch (error) {
      console.error('Error listing token:', error);
      toast.error('Failed to list token. Please try again.');
    } finally {
      setIsListing(false);
    }
  };

  // Handle cancelling token listing
  const handleCancelListing = async () => {
    if (!isConnected) {
      toast.info('Please connect your wallet first');
      return;
    }

    setIsCancelling(true);
    try {
      // Call the cancelListing function
      await cancelListing(Number(id));
      
      // Update token state
      setToken((prev) => prev ? { ...prev, isListed: false, price: null } : null);
    } catch (error) {
      console.error('Error cancelling listing:', error);
      toast.error('Failed to cancel listing. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    if (days === 1) return '1 day';
    if (days < 30) return `${days} days`;
    if (days === 30) return '1 month';
    if (days < 365) return `${Math.floor(days / 30)} months`;
    if (days === 365) return '1 year';
    return `${Math.floor(days / 365)} years`;
  };

  // Handle license purchase
  const handlePurchaseLicense = async (licenseId: number, price: string) => {
    if (!isConnected) {
      toast.info('Please connect your wallet first');
      await connectWallet();
      return;
    }
    
    setIsPurchasingLicense(true);
    
    try {
      // In a real app, this would call the contract method
      toast.info(`Purchasing license #${licenseId}...`);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('License purchased successfully!');
      
      // In a real app, we would update the licenses list
      // For now, just mark the license as sold out if exclusive
      setAvailableLicenses(prev => 
        prev.map(license => 
          license.id === licenseId && license.maxLicenses === 1
            ? { ...license, sold: license.maxLicenses, active: false }
            : license.id === licenseId
            ? { ...license, sold: license.sold + 1 }
            : license
        )
      );
      
      // Push to licenses page
      router.push('/licenses');
    } catch (error) {
      console.error('Error purchasing license:', error);
      toast.error('Failed to purchase license. Please try again.');
    } finally {
      setIsPurchasingLicense(false);
    }
  };

  // Transfer Modal
  const renderTransferModal = () => {
    if (!showTransferModal) return null;

    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showTransferModal ? '' : 'hidden'}`} data-cy="transfer-modal">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-semibold mb-4">Transfer Token</h3>
          <form onSubmit={handleTransfer}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                data-cy="recipient-input"
              />
              {transferTo && !transferTo.startsWith('0x') && <div className="text-red-500 text-sm mt-1" data-cy="address-error">Invalid Ethereum address format</div>}
              {transferTo && transferTo.startsWith('0x') && transferTo.length !== 42 && <div className="text-red-500 text-sm mt-1" data-cy="address-error">Ethereum address must be 42 characters long</div>}
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isTransferring}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                data-cy="confirm-transfer"
              >
                {isTransferring ? (
                  <>
                    <span className="inline-block animate-spin mr-2">&#8635;</span>
                    Transferring...
                  </>
                ) : 'Transfer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Listing Modal
  const renderListingModal = () => {
    if (!showListingModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-semibold mb-4">List Token for Sale</h3>
          <form onSubmit={handleListing}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Price (ETH)
              </label>
              <input
                type="number"
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={() => setShowListingModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isListing}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
              >
                {isListing ? 'Listing...' : 'List Token'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Token Not Found</h1>
        <p className="text-gray-600 mb-8">The token you are looking for does not exist or has been removed.</p>
        <Link 
          href="/explore" 
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
        >
          Explore Tokens
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Token #{token.id} | CryptoRights</title>
        <meta name="description" content={`Details for NFT Token #${token.id} on CryptoRights platform`} />
      </Head>

      {renderTransferModal()}
      {renderListingModal()}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-4">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900" data-cy="token-id">Token #{token.id}</h1>
              <div className="flex space-x-2">
                <span 
                  className={`px-3 py-1 rounded-full text-sm ${
                    token.isListed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {token.isListed ? 'Listed for Sale' : 'Not Listed'}
                </span>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm capitalize">
                  {token.rightsType}
                </span>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-3" data-cy="token-title">{token.title}</h2>
            <p className="text-gray-700 mb-6">{token.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">Token Details</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-gray-600">Token ID:</div>
                    <div className="font-medium">#{token.id}</div>
                    
                    <div className="text-gray-600">Creator:</div>
                    <div className="font-medium">{formatAddress(token.creator)}</div>
                    
                    <div className="text-gray-600">Owner:</div>
                    <div className="font-medium" data-cy="token-owner">{formatAddress(token.owner)}</div>
                    
                    <div className="text-gray-600">Created:</div>
                    <div className="font-medium">{token.creationDate.toLocaleDateString()}</div>
                    
                    <div className="text-gray-600">Rights Type:</div>
                    <div className="font-medium capitalize">{token.rightsType}</div>
                    
                    <div className="text-gray-600">Royalty:</div>
                    <div className="font-medium">{token.royaltyPercentage}%</div>
                    
                    {token.isListed && token.price && (
                      <>
                        <div className="text-gray-600">Listed Price:</div>
                        <div className="font-medium">{token.price} ETH</div>
                      </>
                    )}
                    
                    <div className="text-gray-600">Content URI:</div>
                    <div className="font-medium truncate">{token.contentUri}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden">
                  {token.previewUri && (
                    token.previewUri.startsWith('/') ? (
                      <img 
                        src={token.previewUri}
                        alt={`Token #${token.id}`}
                        className="object-cover w-full h-full rounded-lg"
                      />
                    ) : (
                      <Image
                        src={token.previewUri}
                        alt={`Token #${token.id}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    )
                  )}
                </div>
              </div>
            </div>
            
            {isOwner && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Owner Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    data-cy="transfer-button"
                  >
                    Transfer Token
                  </button>
                  
                  {!token.isListed ? (
                    <button
                      onClick={() => setShowListingModal(true)}
                      className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
                    >
                      List for Sale
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelListing}
                      disabled={isCancelling}
                      className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
                    >
                      {isCancelling ? 'Cancelling...' : 'Cancel Listing'}
                    </button>
                  )}
                  
                  <Link 
                    href={`/content/${token.id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    View Content Page
                  </Link>
                  
                  <Link 
                    href={`/token/${token.id}/license`}
                    className="px-4 py-2 border border-indigo-300 text-indigo-700 rounded-md hover:bg-indigo-50"
                  >
                    Manage Licenses
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {!isOwner && (
            <div className="p-6 border-t">
              <h3 className="text-lg font-medium mb-4">Available Licenses</h3>
              {availableLicenses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {availableLicenses
                    .filter(license => license.active && license.sold < license.maxLicenses)
                    .map((license) => (
                      <div key={license.id} className="border rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${LICENSE_TYPES[license.licenseType as keyof typeof LICENSE_TYPES].color}-100 text-${LICENSE_TYPES[license.licenseType as keyof typeof LICENSE_TYPES].color}-800 capitalize`}>
                            {LICENSE_TYPES[license.licenseType as keyof typeof LICENSE_TYPES].name}
                          </span>
                          <span className="text-lg font-bold">{license.price} ETH</span>
                        </div>
                        <div className="mb-4">
                          <h4 className="font-medium mb-1">License Details</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Duration: {formatDuration(license.duration)}</li>
                            <li>• Available: {license.maxLicenses - license.sold} of {license.maxLicenses}</li>
                            {license.licenseType === 'personal' && (
                              <li>• For personal use only</li>
                            )}
                            {license.licenseType === 'commercial' && (
                              <li>• Limited commercial rights</li>
                            )}
                            {license.licenseType === 'exclusive' && (
                              <li className="font-medium text-purple-700">• Exclusive rights!</li>
                            )}
                          </ul>
                        </div>
                        <button
                          onClick={() => handlePurchaseLicense(license.id, license.price)}
                          disabled={isPurchasingLicense}
                          className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                          {isPurchasingLicense ? 'Processing...' : 'Purchase License'}
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No licenses available for this token.</p>
                </div>
              )}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Looking for more content to license?</p>
                <Link 
                  href="/marketplace/licenses"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  <span>Explore our license marketplace</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
          
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Token History</h3>
            {token.tokenHistory && token.tokenHistory.length > 0 ? (
              <div className="overflow-x-auto" data-cy="token-history">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {token.tokenHistory.map((event, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 capitalize">{event.event}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {event.from === '0x0000000000000000000000000000000000000000'
                              ? 'None (Minted)'
                              : formatAddress(event.from)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {event.to ? formatAddress(event.to) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {event.price ? `${event.price} ETH` : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {event.timestamp.toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No transaction history available for this token.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Loading indicator */}
      {isTransferring && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50" data-cy="loading-indicator">
          <div className="bg-white p-5 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
            <p>Processing Transaction...</p>
          </div>
        </div>
      )}
      
      {/* Success and error notifications */}
      <div id="notification-container" className="fixed bottom-4 right-4 z-50">
        <div id="success-notification" className="hidden bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded shadow-md" data-cy="success-notification">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Token #{token.id} transferred successfully</span>
          </div>
        </div>
        
        <div id="error-notification" className="hidden bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md" data-cy="error-notification">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Transfer failed</span>
          </div>
        </div>
      </div>
    </>
  );
} 