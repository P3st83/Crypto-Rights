import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useWeb3 } from '../../../src/context/Web3Context';
import { useCryptoRightsToken } from '../../../src/hooks/useCryptoRightsToken';
import { useCryptoRightsMarketplace } from '../../../src/hooks/useCryptoRightsMarketplace';
import { formatAddress } from '../../../src/utils/contracts';

// License types
const LICENSE_TYPES = [
  { id: 'personal', name: 'Personal', description: 'For personal use only, no commercial rights' },
  { id: 'commercial', name: 'Commercial', description: 'For commercial use with specific limitations' },
  { id: 'exclusive', name: 'Exclusive', description: 'Exclusive commercial rights for a specified period' },
];

// Duration options in days
const DURATION_OPTIONS = [
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 180, label: '180 days' },
  { value: 365, label: '1 year' },
  { value: 730, label: '2 years' },
  { value: 3650, label: '10 years' },
];

// Interface for creating a new license
interface NewLicenseOffer {
  licenseType: string;
  duration: number;
  price: string;
  maxLicenses: number;
}

// Mock license offerings
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

export default function ManageLicensesPage() {
  const router = useRouter();
  const { id } = router.query;
  const { account, isConnected, connectWallet } = useWeb3();
  const { userTokens } = useCryptoRightsToken();
  
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [licenseOfferings, setLicenseOfferings] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // New license form state
  const [newLicense, setNewLicense] = useState<NewLicenseOffer>({
    licenseType: 'personal',
    duration: 30,
    price: '0.05',
    maxLicenses: 10
  });
  
  // Load token data and check ownership
  useEffect(() => {
    if (!id || !router.isReady) return;
    
    const fetchToken = async () => {
      setIsLoading(true);
      try {
        // Convert id to number
        const numericId = Number(id);
        setTokenId(numericId);
        
        // Fetch token data (in a real app this would come from the blockchain)
        // For now we use mock data
        const mockTokenData = {
          id: numericId,
          name: `Token #${numericId}`,
          rightsType: 'music',
          owner: account || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' // Set to connected account for demo
        };
        
        setTokenData(mockTokenData);
        
        // Check if current user is the token owner
        setIsOwner(account?.toLowerCase() === mockTokenData.owner.toLowerCase());
        
        // Fetch license offerings (in a real app this would come from the blockchain)
        // For now we use mock data
        setLicenseOfferings(MOCK_LICENSE_OFFERINGS);
      } catch (error) {
        console.error('Error fetching token:', error);
        toast.error('Failed to load token details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchToken();
  }, [id, router.isReady, account]);
  
  // Redirect if not owner after loading
  useEffect(() => {
    if (!isLoading && !isOwner && tokenId) {
      toast.info('Only the token owner can manage licenses');
      router.push(`/token/${tokenId}`);
    }
  }, [isLoading, isOwner, tokenId, router]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewLicense(prev => ({
      ...prev,
      [name]: name === 'price' ? value : Number(value)
    }));
  };
  
  // Handle license creation form submission
  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.info('Please connect your wallet first');
      await connectWallet();
      return;
    }
    
    if (!newLicense.price || parseFloat(newLicense.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    
    toast.info('Creating new license offering...');
    
    // In a real app, this would call the contract
    // For now, just simulate a delay and add to the list
    setTimeout(() => {
      const newLicenseId = licenseOfferings.length + 1;
      const newOffering = {
        id: newLicenseId,
        licenseType: newLicense.licenseType,
        duration: newLicense.duration * 24 * 60 * 60, // Convert days to seconds
        price: newLicense.price,
        maxLicenses: newLicense.maxLicenses,
        sold: 0,
        active: true
      };
      
      setLicenseOfferings(prev => [...prev, newOffering]);
      setShowCreateModal(false);
      toast.success('License offering created successfully!');
    }, 1500);
  };
  
  // Handle toggling a license offering's active state
  const toggleLicenseActive = (licenseId: number) => {
    setLicenseOfferings(prev => 
      prev.map(license => 
        license.id === licenseId 
          ? { ...license, active: !license.active } 
          : license
      )
    );
    
    toast.success(`License offering ${licenseId} ${
      licenseOfferings.find(l => l.id === licenseId)?.active 
        ? 'deactivated' 
        : 'activated'
    }`);
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
  
  // Render the create license modal
  const renderCreateModal = () => {
    if (!showCreateModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="px-6 py-4 border-b">
            <h3 className="text-xl font-semibold">Create New License Offering</h3>
          </div>
          
          <form onSubmit={handleCreateLicense} className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Type
              </label>
              <select
                name="licenseType"
                value={newLicense.licenseType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {LICENSE_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.description}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <select
                name="duration"
                value={newLicense.duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (ETH)
              </label>
              <input
                type="number"
                name="price"
                value={newLicense.price}
                onChange={handleInputChange}
                min="0.001"
                step="0.001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Licenses Available
              </label>
              <input
                type="number"
                name="maxLicenses"
                value={newLicense.maxLicenses}
                onChange={handleInputChange}
                min="1"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Set to 1 for an exclusive license
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create License
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
  
  if (!tokenData || !isOwner) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <>
      <Head>
        <title>Manage Licenses for Token #{tokenId} | CryptoRights</title>
        <meta name="description" content="Create and manage license offerings for your digital content" />
      </Head>
      
      {renderCreateModal()}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-4">
          <Link href={`/token/${tokenId}`} className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Token
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Licenses</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage license offerings for Token #{tokenId}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create New License
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-medium">Token Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-500">Token ID</span>
              <p className="font-medium">#{tokenId}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Name</span>
              <p className="font-medium">{tokenData.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Rights Type</span>
              <p className="font-medium capitalize">{tokenData.rightsType}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Owner</span>
              <p className="font-medium">{formatAddress(tokenData.owner)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-medium">License Offerings</h2>
          </div>
          
          {licenseOfferings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {licenseOfferings.map((license) => (
                    <tr key={license.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{license.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                          {license.licenseType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDuration(license.duration)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{license.price} ETH</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {license.maxLicenses - license.sold} / {license.maxLicenses}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {license.active ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => toggleLicenseActive(license.id)}
                          className={`mr-2 px-3 py-1 rounded ${
                            license.active 
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {license.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No license offerings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first license offering to start monetizing your content.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create License Offering
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-medium">License Sales History</h2>
          </div>
          
          <div className="text-center py-16">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sales yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              License sales will appear here once someone purchases a license.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 