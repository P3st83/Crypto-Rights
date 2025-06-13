import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useWeb3 } from '../src/context/Web3Context';
import { useCryptoRightsMarketplace } from '../src/hooks/useCryptoRightsMarketplace';
import { formatAddress } from '../src/utils/contracts';

// License types and descriptions
const LICENSE_TYPES = [
  { id: 'personal', name: 'Personal', description: 'For personal use only, no commercial rights' },
  { id: 'commercial', name: 'Commercial', description: 'For commercial use with specific limitations' },
  { id: 'exclusive', name: 'Exclusive', description: 'Exclusive commercial rights for a specified period' },
];

export default function LicensesPage() {
  const router = useRouter();
  const { account, isConnected, connectWallet } = useWeb3();
  const { userLicenses, fetchUserLicenses, isLoading, error } = useCryptoRightsMarketplace();
  
  const [activeTab, setActiveTab] = useState('active');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedLicenseType, setSelectedLicenseType] = useState('personal');
  const [duration, setDuration] = useState(30); // days
  
  // Fetch user licenses on page load
  useEffect(() => {
    if (isConnected) {
      fetchUserLicenses();
    } else {
      // Redirect if not connected
      toast.info('Please connect your wallet to view your licenses');
      router.push('/');
    }
  }, [isConnected, fetchUserLicenses, router]);
  
  // Filter licenses based on active tab
  const filteredLicenses = userLicenses.filter(license => {
    if (activeTab === 'active') {
      return license.isActive;
    } else if (activeTab === 'expired') {
      return !license.isActive;
    }
    return true;
  });
  
  // Format duration for display
  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    if (days === 1) return '1 day';
    return `${days} days`;
  };
  
  // Calculate days remaining for a license
  const getDaysRemaining = (expirationDate: Date | null) => {
    if (!expirationDate) return 0;
    
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Purchase new license mock function
  const handlePurchaseLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.info('Please connect your wallet first');
      await connectWallet();
      return;
    }
    
    toast.info(`Purchasing ${selectedLicenseType} license for ${duration} days...`);
    
    // In a real app, this would call the contract method
    // For now, we just show success and close the modal
    setTimeout(() => {
      toast.success('License purchased successfully!');
      setShowPurchaseModal(false);
      fetchUserLicenses();
    }, 2000);
  };
  
  // Purchase modal
  const renderPurchaseModal = () => {
    if (!showPurchaseModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="px-6 py-4 border-b">
            <h3 className="text-xl font-semibold">Purchase New License</h3>
          </div>
          
          <form onSubmit={handlePurchaseLicense} className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Type
              </label>
              <select
                value={selectedLicenseType}
                onChange={(e) => setSelectedLicenseType(e.target.value)}
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
                Duration (days)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={1}
                max={365}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Price
              </label>
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {(0.01 * duration * (selectedLicenseType === 'personal' ? 1 : selectedLicenseType === 'commercial' ? 2 : 5)).toFixed(3)} ETH
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Price is calculated based on license type and duration
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowPurchaseModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Purchase License
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
  
  return (
    <>
      <Head>
        <title>My Licenses | CryptoRights</title>
        <meta name="description" content="Manage your content licenses on the CryptoRights platform" />
      </Head>
      
      {renderPurchaseModal()}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Licenses</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your content licenses and rights
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Purchase New License
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'active'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Active Licenses
              </button>
              <button
                onClick={() => setActiveTab('expired')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'expired'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Expired Licenses
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'all'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Licenses
              </button>
            </nav>
          </div>
          
          {filteredLicenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
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
                  {filteredLicenses.map((license) => (
                    <tr key={`${license.tokenId}-${license.licenseId}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{license.licenseId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/token/${license.tokenId}`} 
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          Token #{license.tokenId}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                          {license.licenseType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatAddress(license.owner)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDuration(license.duration)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {license.isActive ? (
                          <div className="text-sm text-gray-900">
                            <span className="text-green-600 font-medium">Active</span>
                            <span className="text-gray-500 ml-1">
                              ({getDaysRemaining(license.expiration)} days left)
                            </span>
                          </div>
                        ) : (
                          <div className="text-sm text-red-600 font-medium">Expired</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/content/${license.tokenId}`} 
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View Content
                        </Link>
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No licenses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'active' ? "You don't have any active licenses." :
                 activeTab === 'expired' ? "You don't have any expired licenses." :
                 "You haven't purchased any licenses yet."}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Purchase Your First License
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">About Licenses</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {LICENSE_TYPES.map((type) => (
                  <div key={type.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">{type.name} License</h3>
                    <p className="text-gray-600 text-sm mb-3">{type.description}</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {type.id === 'personal' && (
                        <>
                          <li>• Non-commercial use only</li>
                          <li>• Cannot modify or redistribute</li>
                          <li>• Perfect for students and hobbyists</li>
                        </>
                      )}
                      {type.id === 'commercial' && (
                        <>
                          <li>• Limited commercial use</li>
                          <li>• Limited modification rights</li>
                          <li>• Suitable for small businesses</li>
                        </>
                      )}
                      {type.id === 'exclusive' && (
                        <>
                          <li>• Full commercial rights</li>
                          <li>• Modification and distribution allowed</li>
                          <li>• Exclusive usage for duration</li>
                        </>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 