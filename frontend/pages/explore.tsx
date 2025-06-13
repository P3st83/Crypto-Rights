import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/context/Web3Context';
import Head from 'next/head';
import { publicClient, CONTRACT_ADDRESSES } from '@/utils/contracts';
import TokenCard from '@/components/TokenCard';

// Content types for filtering
const CONTENT_TYPES = [
  { id: 'all', label: 'All Types' },
  { id: 'text', label: 'Text & Articles', icon: '📝' },
  { id: 'image', label: 'Images & Art', icon: '🎨' },
  { id: 'audio', label: 'Music & Audio', icon: '🎵' },
  { id: 'video', label: 'Videos', icon: '🎬' }
];

// Filter options
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' }
];

// Mock token data for demonstration purposes
// In a real app, this would come from reading the blockchain
const MOCK_TOKENS = [
  {
    id: 1,
    uri: 'ipfs://QmXyZ123...',
    rightsType: 'music',
    creationDate: new Date(2023, 5, 15),
    creator: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  },
  {
    id: 2,
    uri: 'ipfs://QmAbc456...',
    rightsType: 'image',
    creationDate: new Date(2023, 6, 20),
    creator: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    owner: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  },
  {
    id: 3,
    uri: 'ipfs://QmDef789...',
    rightsType: 'video',
    creationDate: new Date(2023, 7, 10),
    creator: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    owner: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
  },
  {
    id: 4,
    uri: 'ipfs://QmGhi012...',
    rightsType: 'text',
    creationDate: new Date(2023, 8, 5),
    creator: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    owner: '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
  },
  {
    id: 5,
    uri: 'ipfs://QmJkl345...',
    rightsType: 'music',
    creationDate: new Date(2023, 9, 25),
    creator: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    owner: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
  },
  {
    id: 6,
    uri: 'ipfs://QmMno678...',
    rightsType: 'image',
    creationDate: new Date(2023, 10, 12),
    creator: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    owner: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc'
  }
];

type TokenFilter = {
  contentType: string;
  sortBy: 'newest' | 'oldest' | 'popular';
  searchTerm: string;
};

export default function Explore() {
  const { isConnected } = useWeb3();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState(MOCK_TOKENS);
  const [filteredTokens, setFilteredTokens] = useState(MOCK_TOKENS);
  const [filters, setFilters] = useState<TokenFilter>({
    contentType: 'all',
    sortBy: 'newest',
    searchTerm: ''
  });

  // Fetch content from API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // In a real app, we'd use the API
        // const res = await fetch(`/api/content?type=${contentType}&sort=${sortBy}&search=${searchQuery}&page=${currentPage}`);
        // const data = await res.json();
        
        // For now, use mock data
        const mockContent = [
          {
            id: '1',
            title: 'Introduction to Blockchain',
            description: 'Learn the basics of blockchain technology and its applications.',
            creator: '0x1234567890abcdef1234567890abcdef12345678',
            creatorName: 'Crypto Author',
            contentType: 'text',
            previewUrl: 'https://placekitten.com/400/300',
            tokenId: '1',
            price: '0.05',
            views: 1240,
            likes: 89,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: '2',
            title: 'Crypto Art Collection',
            description: 'A beautiful collection of digital art pieces.',
            creator: '0xabcdef1234567890abcdef1234567890abcdef12',
            creatorName: 'Digital Artist',
            contentType: 'image',
            previewUrl: 'https://placekitten.com/401/300',
            tokenId: '2',
            price: '0.1',
            views: 842,
            likes: 156,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: '3',
            title: 'Blockchain Beats',
            description: 'Original music inspired by the crypto revolution.',
            creator: '0x2345678901abcdef2345678901abcdef23456789',
            creatorName: 'Crypto Musician',
            contentType: 'audio',
            previewUrl: 'https://placekitten.com/402/300',
            tokenId: '3',
            price: '0.03',
            views: 523,
            likes: 42,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            id: '4',
            title: 'Web3 For Beginners',
            description: 'A video course on Web3 technology and development.',
            creator: '0x3456789012abcdef3456789012abcdef34567890',
            creatorName: 'Web3 Educator',
            contentType: 'video',
            previewUrl: 'https://placekitten.com/403/300',
            tokenId: '4',
            price: '0.08',
            views: 1823,
            likes: 215,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            id: '5',
            title: 'NFT Photography Collection',
            description: 'Stunning nature photographs as collectible NFTs.',
            creator: '0x4567890123abcdef4567890123abcdef45678901',
            creatorName: 'Crypto Photographer',
            contentType: 'image',
            previewUrl: 'https://placekitten.com/404/300',
            tokenId: '5',
            price: '0.15',
            views: 743,
            likes: 132,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            id: '6',
            title: 'Decentralized Finance Explained',
            description: 'A comprehensive guide to DeFi protocols and opportunities.',
            creator: '0x5678901234abcdef5678901234abcdef56789012',
            creatorName: 'DeFi Guru',
            contentType: 'text',
            previewUrl: 'https://placekitten.com/405/300',
            tokenId: '6',
            price: '0.07',
            views: 2105,
            likes: 178,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          }
        ];
        
        // Filter by content type if needed
        let filtered = mockContent;
        if (contentType !== 'all') {
          filtered = mockContent.filter(item => item.contentType === contentType);
        }
        
        // Filter by search query if provided
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query) ||
            item.creatorName.toLowerCase().includes(query)
          );
        }
        
        // Sort content based on selected option
        switch(sortBy) {
          case 'oldest':
            filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            break;
          case 'price-asc':
            filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
          case 'price-desc':
            filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
          case 'popular':
            filtered.sort((a, b) => b.views - a.views);
            break;
          default: // newest
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        
        setContents(filtered);
        setTotalPages(Math.ceil(filtered.length / 6)); // Assume 6 items per page
        setLoading(false);
      } catch (error) {
        console.error('Error fetching content:', error);
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [contentType, sortBy, searchQuery, currentPage]);

  // In a real app, this would fetch tokens from the blockchain
  useEffect(() => {
    // Simulate API loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...tokens];

    // Filter by content type
    if (filters.contentType !== 'all') {
      filtered = filtered.filter(token => token.rightsType === filters.contentType);
    }

    // Filter by search term
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(token => {
        // In a real app, we would search through token metadata
        return token.rightsType.toLowerCase().includes(search) || 
               token.id.toString().includes(search);
      });
    }

    // Sort tokens
    filtered.sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return b.creationDate.getTime() - a.creationDate.getTime();
      } else if (filters.sortBy === 'oldest') {
        return a.creationDate.getTime() - b.creationDate.getTime();
      } else {
        // 'popular' - in a real app, this might sort by views, likes, etc.
        return b.id - a.id;
      }
    });

    setFilteredTokens(filtered);
  }, [tokens, filters]);

  // Handler for search input
  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setSearchQuery(formData.get('search') as string);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Format wallet address
  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  // Handle filter changes
  const handleFilterChange = (filterName: keyof TokenFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  return (
    <>
      <Head>
        <title>Explore Content | CryptoRights</title>
        <meta name="description" content="Discover and acquire digital content rights on the CryptoRights platform." />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Explore Content</h1>
          <p className="text-gray-600">
            Discover amazing digital content from creators around the world.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => {setContentType(type.id); setCurrentPage(1);}}
                className={`px-3 py-1 rounded-full text-sm ${
                  contentType === type.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.icon && <span className="mr-1">{type.icon}</span>}
                {type.label}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              name="search"
              placeholder="Search for content, creators..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              defaultValue={searchQuery}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Search
            </button>
          </form>
        </div>

        <div className="mt-4 md:mt-0">
          <Link 
            href="/marketplace/licenses" 
            className="inline-flex items-center px-4 py-2 border border-indigo-500 text-indigo-600 rounded-md shadow-sm hover:bg-indigo-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View License Marketplace
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Content Type Filter */}
            <div>
              <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-1">
                Content Type
              </label>
              <select
                id="contentType"
                value={filters.contentType}
                onChange={(e) => handleFilterChange('contentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="music">Music</option>
                <option value="image">Images & Art</option>
                <option value="video">Video</option>
                <option value="text">Text & Documents</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Sort By Filter */}
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sortBy"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as 'newest' | 'oldest' | 'popular')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Search content..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading content...</p>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600">
              We couldn't find any content matching your filters. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTokens.map((token) => (
              <TokenCard
                key={token.id}
                id={token.id}
                uri={token.uri}
                rightsType={token.rightsType}
                creationDate={token.creationDate}
                creator={token.creator}
              />
            ))}
          </div>
        )}

        {/* Pagination (would be implemented in a real app) */}
        {filteredTokens.length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav className="inline-flex rounded-md shadow">
              <button className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-2 border-t border-b border-gray-300 bg-white text-indigo-600 font-medium">
                1
              </button>
              <button className="px-3 py-2 border-t border-b border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 border-t border-b border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </>
  );
}

// Content Card Component
function ContentCard({ content }) {
  const { isConnected } = useWeb3();

  const getContentTypeIcon = (type) => {
    switch(type) {
      case 'text': return '📝';
      case 'image': return '🎨';
      case 'audio': return '🎵';
      case 'video': return '🎬';
      default: return '📄';
    }
  };

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Preview Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={content.previewUrl}
          alt={content.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {getContentTypeIcon(content.contentType)} {content.contentType.charAt(0).toUpperCase() + content.contentType.slice(1)}
        </div>
      </div>
      
      {/* Content Details */}
      <div className="p-4 flex-grow">
        <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{content.description}</p>
        
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-500">
            Created {new Date(content.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>👁️ {content.views}</span>
            <span>❤️ {content.likes}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm">
            By <span className="font-medium">{content.creatorName}</span>
          </div>
          <div className="text-indigo-600 font-semibold">
            {content.price} ETH
          </div>
        </div>
      </div>
      
      {/* Action Button */}
      <div className="border-t p-4">
        <Link
          href={`/content/${content.id}`}
          className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
} 