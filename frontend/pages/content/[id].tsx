import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ethers } from 'ethers';
import { useWeb3 } from '../../src/context/Web3Context';
import { publicClient, CONTRACT_ADDRESSES } from '../../src/utils/contracts';
import { useCryptoRightsToken } from '../../src/hooks/useCryptoRightsToken';
import { toast } from 'react-toastify';

// Types for our content
type ContentType = 'text' | 'image' | 'audio' | 'video';

interface Comment {
  id: string;
  user: string;
  username: string;
  text: string;
  createdAt: Date;
  likes: number;
}

interface Creator {
  address: string;
  username: string;
  bio: string;
  avatar: string;
  verified: boolean;
}

interface ContentDetails {
  id: string;
  title: string;
  description: string;
  creator: string;
  creatorInfo: Creator;
  contentType: ContentType;
  previewUrl: string;
  contentUrl: string;
  tokenId: string;
  price: string;
  royaltyPercentage: number;
  hasPremium: boolean;
  premiumPrice: string;
  tags: string[];
  views: number;
  likes: number;
  createdAt: Date;
}

// Mock content data for demonstration
// In a real app, this would come from reading the blockchain
const MOCK_CONTENT = {
  id: 1,
  title: 'Abstract Digital Artwork #142',
  description: 'A unique digital artwork created using generative algorithms and hand-crafted elements. This piece represents the intersection of technology and creativity in the digital age.',
  creator: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  creatorName: 'Digital Artist',
  rightsType: 'image',
  contentUri: 'ipfs://QmXyZ123...',
  previewUri: '/images/placeholders/image.jpg',
  price: '0.5',
  royaltyPercentage: 10,
  creationDate: new Date(2023, 5, 15),
  owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  licenses: [
    { licensee: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', type: 'personal', expiration: new Date(2024, 5, 15) }
  ]
};

export default function ContentDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { account, isConnected, connectWallet } = useWeb3();
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isLicensing, setIsLicensing] = useState(false);

  // Format addresses for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Load content data
  useEffect(() => {
    if (!id) return;

    // Simulate API call to fetch content
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch the data from the blockchain
        // For now, we just use the mock data
        setContent(MOCK_CONTENT);
      } catch (error) {
        console.error('Error fetching content:', error);
        toast.error('Failed to load content details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  // Purchase the token
  const handlePurchase = async () => {
    if (!isConnected) {
      toast.info('Please connect your wallet first');
      return;
    }

    setIsPurchasing(true);
    try {
      // In a real app, this would trigger a blockchain transaction
      toast.success('Purchase successful! You now own this token.');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error purchasing token:', error);
      toast.error('Failed to purchase. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  // License the content
  const handleLicense = async () => {
    if (!isConnected) {
      toast.info('Please connect your wallet first');
      return;
    }

    setIsLicensing(true);
    try {
      // In a real app, this would trigger a blockchain transaction
      toast.success('Content licensed successfully! You can now use this content.');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error licensing content:', error);
      toast.error('Failed to license. Please try again.');
    } finally {
      setIsLicensing(false);
    }
  };

  // Check if user is the owner
  const isOwner = isConnected && content?.owner === account;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Content Not Found</h1>
        <p className="text-gray-600 mb-8">The content you are looking for does not exist or has been removed.</p>
        <Link href="/explore" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
          Explore Other Content
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{content.title} | CryptoRights</title>
        <meta name="description" content={content.description.substring(0, 160)} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-4">
          <Link href="/explore" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Explore
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Content Preview */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative aspect-square bg-gray-100">
              <img 
                src={content.previewUri} 
                alt={content.title} 
                className="object-cover w-full h-full"
              />
              <div className="absolute top-2 right-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                {content.rightsType}
              </div>
              {isOwner && (
                <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                  You Own This
                </div>
              )}
            </div>
          </div>

          {/* Content Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>
            
            <div className="mb-6">
              <p className="text-lg text-gray-700 mb-4">{content.description}</p>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="text-gray-600">Creator:</div>
                <div className="font-medium">{formatAddress(content.creator)}</div>
                
                <div className="text-gray-600">Owner:</div>
                <div className="font-medium">{formatAddress(content.owner)}</div>
                
                <div className="text-gray-600">Created:</div>
                <div className="font-medium">{content.creationDate.toLocaleDateString()}</div>
                
                <div className="text-gray-600">Token ID:</div>
                <div className="font-medium">#{content.id}</div>
                
                <div className="text-gray-600">Royalty:</div>
                <div className="font-medium">{content.royaltyPercentage}%</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-4">
              {!isOwner ? (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold">Purchase Price</h3>
                      <span className="text-2xl font-bold">{content.price} ETH</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Purchase the full ownership of this token and its associated rights.
                    </p>
                    <button
                      onClick={handlePurchase}
                      disabled={isPurchasing || !isConnected}
                      className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                    >
                      {!isConnected ? 'Connect Wallet to Purchase' : 
                       isPurchasing ? 'Processing...' : 'Purchase Token'}
                    </button>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold">License Price</h3>
                      <span className="text-2xl font-bold">{(parseFloat(content.price) * 0.2).toFixed(2)} ETH</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      License this content for personal use without purchasing the token.
                    </p>
                    <button
                      onClick={handleLicense}
                      disabled={isLicensing || !isConnected}
                      className="w-full px-4 py-3 border border-indigo-600 text-indigo-600 bg-white rounded-md hover:bg-indigo-50 disabled:border-indigo-300 disabled:text-indigo-300"
                    >
                      {!isConnected ? 'Connect Wallet to License' : 
                       isLicensing ? 'Processing...' : 'License Content'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">You Own This Token</h3>
                  <p className="text-sm text-green-700 mb-4">
                    As the owner, you have full rights to this content. You can transfer, license, or manage it from your dashboard.
                  </p>
                  <div className="flex gap-4">
                    <Link 
                      href="/dashboard" 
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Manage in Dashboard
                    </Link>
                    <Link 
                      href={`/token/${content.id}`} 
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Manage Token
                    </Link>
                    <button
                      className="px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50"
                    >
                      Transfer Ownership
                    </button>
                  </div>
                </div>
              )}
              
              {!isConnected && (
                <button
                  onClick={connectWallet}
                  className="w-full mt-4 px-4 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* License History */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">License History</h2>
          
          {content.licenses && content.licenses.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Licensee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires On
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {content.licenses.map((license: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAddress(license.licensee)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{license.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {license.expiration.toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                No licenses have been issued for this content yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 