import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useWeb3 } from '../../src/context/Web3Context';
import { useCryptoRightsMarketplace } from '../../src/hooks/useCryptoRightsMarketplace';
import { formatAddress } from '../../src/utils/contracts';

// License types
const LICENSE_TYPES = {
  personal: { name: 'Personal', color: 'green', description: 'For personal use only, no commercial rights' },
  commercial: { name: 'Commercial', color: 'blue', description: 'For commercial use with specific limitations' },
  exclusive: { name: 'Exclusive', color: 'purple', description: 'Exclusive commercial rights for a specified period' }
};

// Content types
const CONTENT_TYPES = [
  { id: 'all', name: 'All Types' },
  { id: 'music', name: 'Music' },
  { id: 'image', name: 'Images' },
  { id: 'video', name: 'Video' },
  { id: 'text', name: 'Text/Documents' }
];

// License filter type
interface LicenseFilter {
  contentType: string;
  licenseType: string;
  durationMin: number | null;
  durationMax: number | null;
  priceMin: number | null;
  priceMax: number | null;
  searchTerm: string;
}

// Mock tokens with license offerings
const MOCK_TOKENS_WITH_LICENSES = [
  {
    tokenId: 1,
    title: 'Epic Music Track #1',
    rightsType: 'music',
    creator: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    creatorName: 'MusicMaster',
    previewImage: '/images/placeholders/music.jpg',
    licenses: [
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
      }
    ]
  },
  {
    tokenId: 2,
    title: 'Digital Art Collection',
    rightsType: 'image',
    creator: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    creatorName: 'PixelArtist',
    previewImage: '/images/placeholders/image.jpg',
    licenses: [
      {
        id: 3,
        licenseType: 'personal',
        duration: 30 * 24 * 60 * 60, // 30 days in seconds
        price: '0.03',
        maxLicenses: 200,
        sold: 15,
        active: true
      },
      {
        id: 4,
        licenseType: 'exclusive',
        duration: 365 * 24 * 60 * 60, // 1 year in seconds
        price: '1.5',
        maxLicenses: 1,
        sold: 0,
        active: true
      }
    ]
  },
  {
    tokenId: 3,
    title: 'Documentary Film Rights',
    rightsType: 'video',
    creator: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    creatorName: 'FilmMaker',
    previewImage: '/images/placeholders/video.jpg',
    licenses: [
      {
        id: 5,
        licenseType: 'personal',
        duration: 60 * 24 * 60 * 60, // 60 days in seconds
        price: '0.1',
        maxLicenses: 50,
        sold: 10,
        active: true
      },
      {
        id: 6,
        licenseType: 'commercial',
        duration: 180 * 24 * 60 * 60, // 180 days in seconds
        price: '0.5',
        maxLicenses: 10,
        sold: 3,
        active: true
      },
      {
        id: 7,
        licenseType: 'exclusive',
        duration: 730 * 24 * 60 * 60, // 2 years in seconds
        price: '3.0',
        maxLicenses: 1,
        sold: 0,
        active: true
      }
    ]
  },
  {
    tokenId: 4,
    title: 'Research Paper Publication',
    rightsType: 'text',
    creator: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    creatorName: 'Researcher',
    previewImage: '/images/placeholders/text.jpg',
    licenses: [
      {
        id: 8,
        licenseType: 'personal',
        duration: 365 * 24 * 60 * 60, // 1 year in seconds
        price: '0.08',
        maxLicenses: 100,
        sold: 25,
        active: true
      },
      {
        id: 9,
        licenseType: 'commercial',
        duration: 365 * 24 * 60 * 60, // 1 year in seconds
        price: '0.4',
        maxLicenses: 30,
        sold: 5,
        active: true
      }
    ]
  },
  {
    tokenId: 5,
    title: 'Music Album Rights',
    rightsType: 'music',
    creator: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    creatorName: 'MusicProducer',
    previewImage: '/images/placeholders/music.jpg',
    licenses: [
      {
        id: 10,
        licenseType: 'personal',
        duration: 90 * 24 * 60 * 60, // 90 days in seconds
        price: '0.15',
        maxLicenses: 150,
        sold: 30,
        active: true
      },
      {
        id: 11,
        licenseType: 'commercial',
        duration: 365 * 24 * 60 * 60, // 1 year in seconds
        price: '0.75',
        maxLicenses: 25,
        sold: 12,
        active: true
      },
      {
        id: 12,
        licenseType: 'exclusive',
        duration: 1095 * 24 * 60 * 60, // 3 years in seconds
        price: '5.0',
        maxLicenses: 1,
        sold: 0,
        active: true
      }
    ]
  }
];

export default function LicensesMarketplacePage() {
  const router = useRouter();
  const { account, isConnected, connectWallet } = useWeb3();
  const { isLoading: isMarketplaceLoading } = useCryptoRightsMarketplace();
  
  const [isLoading, setIsLoading] = useState(true);
  const [tokensWithLicenses, setTokensWithLicenses] = useState<any[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<any[]>([]);
  const [isPurchasingLicense, setIsPurchasingLicense] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<LicenseFilter>({
    contentType: 'all',
    licenseType: '',
    durationMin: null,
    durationMax: null,
    priceMin: null,
    priceMax: null,
    searchTerm: ''
  });
  
  // Load tokens with licenses
  useEffect(() => {
    const fetchLicenses = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch this from the blockchain
        // For now, we'll use mock data
        setTokensWithLicenses(MOCK_TOKENS_WITH_LICENSES);
      } catch (error) {
        console.error('Error fetching tokens with licenses:', error);
        toast.error('Failed to load license marketplace');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLicenses();
  }, []);
  
  // Apply filters when filter state or tokens change
  useEffect(() => {
    if (!tokensWithLicenses.length) return;
    
    let filtered = [...tokensWithLicenses];
    
    // Filter by content type
    if (filters.contentType !== 'all') {
      filtered = filtered.filter(token => token.rightsType === filters.contentType);
    }
    
    // Filter by license type
    if (filters.licenseType) {
      filtered = filtered.filter(token => 
        token.licenses.some(license => license.licenseType === filters.licenseType && license.active)
      );
    }
    
    // Filter by price
    if (filters.priceMin !== null) {
      filtered = filtered.filter(token => 
        token.licenses.some(license => parseFloat(license.price) >= filters.priceMin! && license.active)
      );
    }
    
    if (filters.priceMax !== null) {
      filtered = filtered.filter(token => 
        token.licenses.some(license => parseFloat(license.price) <= filters.priceMax! && license.active)
      );
    }
    
    // Filter by duration
    if (filters.durationMin !== null) {
      filtered = filtered.filter(token => 
        token.licenses.some(license => 
          license.duration >= (filters.durationMin! * 24 * 60 * 60) && license.active
        )
      );
    }
    
    if (filters.durationMax !== null) {
      filtered = filtered.filter(token => 
        token.licenses.some(license => 
          license.duration <= (filters.durationMax! * 24 * 60 * 60) && license.active
        )
      );
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(token => 
        token.title.toLowerCase().includes(searchLower) || 
        token.creatorName.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredTokens(filtered);
  }, [filters, tokensWithLicenses]);
  
  // Handle filter changes
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
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
  const handlePurchaseLicense = async (tokenId: number, licenseId: number, price: string) => {
    if (!isConnected) {
      toast.info('Please connect your wallet first');
      await connectWallet();
      return;
    }
    
    setIsPurchasingLicense(true);
    
    try {
      // In a real app, this would call the contract method
      toast.info(`Purchasing license for token #${tokenId}...`);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('License purchased successfully!');
      
      // In a real app, we would update the licenses list
      // For this demo, just redirect to licenses page
      router.push('/licenses');
    } catch (error) {
      console.error('Error purchasing license:', error);
      toast.error('Failed to purchase license. Please try again.');
    } finally {
      setIsPurchasingLicense(false);
    }
  };
  
  // Render the filter sidebar
  const renderFilterSidebar = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4">Filter Licenses</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content Type
          </label>
          <select
            value={filters.contentType}
            onChange={(e) => handleFilterChange('contentType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {CONTENT_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Type
          </label>
          <select
            value={filters.licenseType}
            onChange={(e) => handleFilterChange('licenseType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Any Type</option>
            {Object.entries(LICENSE_TYPES).map(([id, { name }]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range (ETH)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin !== null ? filters.priceMin : ''}
              onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseFloat(e.target.value) : null)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              step="0.01"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax !== null ? filters.priceMax : ''}
              onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseFloat(e.target.value) : null)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (days)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.durationMin !== null ? filters.durationMin : ''}
              onChange={(e) => handleFilterChange('durationMin', e.target.value ? parseInt(e.target.value) : null)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              min="1"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.durationMax !== null ? filters.durationMax : ''}
              onChange={(e) => handleFilterChange('durationMax', e.target.value ? parseInt(e.target.value) : null)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              min="1"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by title or creator"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <button
          onClick={() => setFilters({
            contentType: 'all',
            licenseType: '',
            durationMin: null,
            durationMax: null,
            priceMin: null,
            priceMax: null,
            searchTerm: ''
          })}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Reset Filters
        </button>
      </div>
    );
  };
  
  // Render a token card with its licenses
  const renderTokenCard = (token: any) => {
    return (
      <div key={token.tokenId} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="aspect-video bg-gray-100 relative">
          {token.previewImage && (
            <img 
              src={token.previewImage}
              alt={token.title}
              className="object-cover w-full h-full"
            />
          )}
          <div className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded capitalize">
            {token.rightsType}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium">
              <Link href={`/token/${token.tokenId}`} className="text-indigo-600 hover:text-indigo-800">
                {token.title}
              </Link>
            </h3>
            <Link href={`/token/${token.tokenId}`} className="text-xs text-gray-500">
              #{token.tokenId}
            </Link>
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            By <span className="font-medium">{token.creatorName}</span> ({formatAddress(token.creator)})
          </div>
          
          <h4 className="font-medium mb-2">Available Licenses:</h4>
          
          <div className="space-y-3">
            {token.licenses
              .filter((license: any) => license.active && license.sold < license.maxLicenses)
              .map((license: any) => (
                <div key={license.id} className="border rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${LICENSE_TYPES[license.licenseType as keyof typeof LICENSE_TYPES].color}-100 text-${LICENSE_TYPES[license.licenseType as keyof typeof LICENSE_TYPES].color}-800 capitalize`}>
                      {LICENSE_TYPES[license.licenseType as keyof typeof LICENSE_TYPES].name}
                    </span>
                    <span className="font-bold">{license.price} ETH</span>
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-3">
                    <div>Duration: {formatDuration(license.duration)}</div>
                    <div>Available: {license.maxLicenses - license.sold} of {license.maxLicenses}</div>
                  </div>
                  
                  <button
                    onClick={() => handlePurchaseLicense(token.tokenId, license.id, license.price)}
                    disabled={isPurchasingLicense}
                    className="w-full py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                  >
                    {isPurchasingLicense ? 'Processing...' : 'Purchase License'}
                  </button>
                </div>
              ))}
            
            {token.licenses.filter((license: any) => license.active && license.sold < license.maxLicenses).length === 0 && (
              <div className="text-center py-2 text-sm text-gray-500">
                No active licenses available
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t">
            <Link 
              href={`/token/${token.tokenId}`}
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              View All Details →
            </Link>
          </div>
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
        <title>License Marketplace | CryptoRights</title>
        <meta name="description" content="Browse and purchase licenses for digital content on the CryptoRights platform" />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">License Marketplace</h1>
            <p className="mt-1 text-sm text-gray-500">
              Browse and license content without purchasing full rights
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <Link 
              href="/licenses"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              View My Licenses
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/4">
            {renderFilterSidebar()}
          </div>
          
          <div className="lg:w-3/4">
            {filteredTokens.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTokens.map(token => renderTokenCard(token))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
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
                  Try adjusting your filters or search criteria.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setFilters({
                      contentType: 'all',
                      licenseType: '',
                      durationMin: null,
                      durationMax: null,
                      priceMin: null,
                      priceMax: null,
                      searchTerm: ''
                    })}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-12 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">About Content Licensing</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(LICENSE_TYPES).map(([key, { name, color, description }]) => (
                <div key={key} className={`border border-${color}-200 rounded-lg p-4 bg-${color}-50`}>
                  <h3 className={`font-semibold text-lg text-${color}-700 mb-2`}>{name} License</h3>
                  <p className="text-gray-600 text-sm mb-3">{description}</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {key === 'personal' && (
                      <>
                        <li>• Non-commercial use only</li>
                        <li>• Cannot modify or redistribute</li>
                        <li>• Perfect for students and hobbyists</li>
                      </>
                    )}
                    {key === 'commercial' && (
                      <>
                        <li>• Limited commercial use</li>
                        <li>• Limited modification rights</li>
                        <li>• Suitable for small businesses</li>
                      </>
                    )}
                    {key === 'exclusive' && (
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
    </>
  );
} 