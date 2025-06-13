import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/context/Web3Context';

// Content type for filtering
type ContentType = 'all' | 'text' | 'image' | 'audio' | 'video';

// Creator interface
interface Creator {
  address: string;
  username: string;
  bio: string;
  avatar: string;
  verified: boolean;
  contentTypes: ContentType[];
  stats: {
    totalContent: number;
    followers: number;
  };
  hasSubscription: boolean;
}

export default function CreatorsDirectory() {
  const { isConnected } = useWeb3();
  
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'content'>('popular');
  
  // Fetch creators from API
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, we'd fetch from the API
        // const res = await fetch('/api/creators');
        // const data = await res.json();
        
        // Mock creators data
        const mockCreators: Creator[] = [
          {
            address: '0x1234567890abcdef1234567890abcdef12345678',
            username: 'BlockchainExpert',
            bio: 'Educator and developer in the blockchain space.',
            avatar: 'https://avatars.dicebear.com/api/identicon/BlockchainExpert.svg',
            verified: true,
            contentTypes: ['text', 'video'],
            stats: {
              totalContent: 12,
              followers: 487
            },
            hasSubscription: true
          },
          {
            address: '0xabcdef1234567890abcdef1234567890abcdef12',
            username: 'CryptoArtist',
            bio: 'Digital artist creating NFT collections and visual experiences.',
            avatar: 'https://avatars.dicebear.com/api/identicon/CryptoArtist.svg',
            verified: true,
            contentTypes: ['image'],
            stats: {
              totalContent: 36,
              followers: 1250
            },
            hasSubscription: true
          },
          {
            address: '0x2345678901abcdef2345678901abcdef23456789',
            username: 'Web3Developer',
            bio: 'Building the future of decentralized applications.',
            avatar: 'https://avatars.dicebear.com/api/identicon/Web3Developer.svg',
            verified: false,
            contentTypes: ['text'],
            stats: {
              totalContent: 8,
              followers: 156
            },
            hasSubscription: false
          },
          {
            address: '0x3456789012abcdef3456789012abcdef34567890',
            username: 'CryptoMusician',
            bio: 'Creating music for the crypto generation.',
            avatar: 'https://avatars.dicebear.com/api/identicon/CryptoMusician.svg',
            verified: true,
            contentTypes: ['audio'],
            stats: {
              totalContent: 24,
              followers: 892
            },
            hasSubscription: true
          },
          {
            address: '0x4567890123abcdef4567890123abcdef45678901',
            username: 'DeFiAnalyst',
            bio: 'Analysis and insights on DeFi protocols and trends.',
            avatar: 'https://avatars.dicebear.com/api/identicon/DeFiAnalyst.svg',
            verified: false,
            contentTypes: ['text', 'video'],
            stats: {
              totalContent: 15,
              followers: 320
            },
            hasSubscription: false
          },
          {
            address: '0x5678901234abcdef5678901234abcdef56789012',
            username: 'NFTPhotographer',
            bio: 'Photography as NFTs, capturing moments forever on the blockchain.',
            avatar: 'https://avatars.dicebear.com/api/identicon/NFTPhotographer.svg',
            verified: true,
            contentTypes: ['image'],
            stats: {
              totalContent: 42,
              followers: 765
            },
            hasSubscription: true
          },
          {
            address: '0x6789012345abcdef6789012345abcdef67890123',
            username: 'CryptoComedian',
            bio: 'Making crypto fun one joke at a time.',
            avatar: 'https://avatars.dicebear.com/api/identicon/CryptoComedian.svg',
            verified: false,
            contentTypes: ['video', 'audio'],
            stats: {
              totalContent: 18,
              followers: 542
            },
            hasSubscription: true
          },
          {
            address: '0x7890123456abcdef7890123456abcdef78901234',
            username: 'EthereumTeacher',
            bio: 'Teaching Ethereum development for all skill levels.',
            avatar: 'https://avatars.dicebear.com/api/identicon/EthereumTeacher.svg',
            verified: true,
            contentTypes: ['text', 'video'],
            stats: {
              totalContent: 28,
              followers: 980
            },
            hasSubscription: true
          }
        ];
        
        setCreators(mockCreators);
        setFilteredCreators(mockCreators);
        
      } catch (error) {
        console.error('Error fetching creators:', error);
        setError('Failed to load creators. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCreators();
  }, []);
  
  // Apply filters
  useEffect(() => {
    if (creators.length === 0) return;
    
    let result = [...creators];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(creator => 
        creator.username.toLowerCase().includes(query) || 
        creator.bio.toLowerCase().includes(query)
      );
    }
    
    // Apply content type filter
    if (contentTypeFilter !== 'all') {
      result = result.filter(creator => 
        creator.contentTypes.includes(contentTypeFilter as ContentType)
      );
    }
    
    // Apply subscription filter
    if (subscriptionFilter !== null) {
      result = result.filter(creator => creator.hasSubscription === subscriptionFilter);
    }
    
    // Apply sorting
    if (sortBy === 'popular') {
      result.sort((a, b) => b.stats.followers - a.stats.followers);
    } else if (sortBy === 'content') {
      result.sort((a, b) => b.stats.totalContent - a.stats.totalContent);
    }
    // 'newest' sort would use joined date in a real app
    
    setFilteredCreators(result);
  }, [creators, searchQuery, contentTypeFilter, subscriptionFilter, sortBy]);
  
  // Handle search input
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSearchQuery(formData.get('search') as string);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setContentTypeFilter('all');
    setSubscriptionFilter(null);
    setSortBy('popular');
  };
  
  // Get content type icon
  const getContentTypeIcon = (type: ContentType): string => {
    switch(type) {
      case 'text': return '📝';
      case 'image': return '🎨';
      case 'audio': return '🎵';
      case 'video': return '🎬';
      default: return '📄';
    }
  };
  
  // Format address for display
  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="loader"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Creators</h1>
        <p className="text-gray-600">
          Find and follow creators in the web3 space creating amazing content
        </p>
      </div>
      
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          {/* Search */}
          <div className="flex-grow">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search creators..."
                  defaultValue={searchQuery}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </form>
          </div>
          
          {/* Sort By */}
          <div className="flex items-center">
            <label htmlFor="sortBy" className="mr-2 text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'popular' | 'newest' | 'content')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="popular">Most Popular</option>
              <option value="content">Most Content</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Content Type Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setContentTypeFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                contentTypeFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setContentTypeFilter('text')}
              className={`px-3 py-1 rounded-full text-sm ${
                contentTypeFilter === 'text'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📝 Text
            </button>
            <button
              onClick={() => setContentTypeFilter('image')}
              className={`px-3 py-1 rounded-full text-sm ${
                contentTypeFilter === 'image'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎨 Image
            </button>
            <button
              onClick={() => setContentTypeFilter('audio')}
              className={`px-3 py-1 rounded-full text-sm ${
                contentTypeFilter === 'audio'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎵 Audio
            </button>
            <button
              onClick={() => setContentTypeFilter('video')}
              className={`px-3 py-1 rounded-full text-sm ${
                contentTypeFilter === 'video'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎬 Video
            </button>
          </div>
          
          {/* Subscription Filter */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setSubscriptionFilter(subscriptionFilter === true ? null : true)}
              className={`px-3 py-1 rounded-full text-sm ${
                subscriptionFilter === true
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Has Subscriptions
            </button>
            
            {(searchQuery || contentTypeFilter !== 'all' || subscriptionFilter !== null) && (
              <button
                onClick={resetFilters}
                className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 hover:bg-red-200"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Creators Grid */}
      {filteredCreators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCreators.map(creator => (
            <Link
              key={creator.address}
              href={`/creators/${creator.address}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-24"></div>
              <div className="relative px-4 pt-0 pb-4">
                <div className="absolute -top-10 left-4">
                  <img
                    src={creator.avatar}
                    alt={creator.username}
                    className="w-20 h-20 rounded-full border-4 border-white"
                  />
                </div>
                
                <div className="mt-12">
                  <div className="flex items-center mb-1">
                    <h2 className="text-lg font-bold truncate">{creator.username}</h2>
                    {creator.verified && (
                      <span className="ml-1 text-blue-500 text-sm">✓</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3 truncate">
                    {formatAddress(creator.address)}
                  </p>
                  
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {creator.bio}
                  </p>
                  
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{creator.stats.followers}</span>
                      <span className="text-gray-600 ml-1">followers</span>
                    </div>
                    <div>
                      <span className="font-medium">{creator.stats.totalContent}</span>
                      <span className="text-gray-600 ml-1">content</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-1">
                      {creator.contentTypes.map(type => (
                        <span key={type} className="text-sm text-gray-600" title={type}>
                          {getContentTypeIcon(type)}
                        </span>
                      ))}
                    </div>
                    
                    {creator.hasSubscription && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        Subscription
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600 mb-4">No creators found matching your criteria</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Reset Filters
          </button>
        </div>
      )}
      
      {/* Join as Creator CTA (for non-creators) */}
      <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Share Your Content?</h2>
          <p className="text-lg mb-6">
            Join CryptoRights as a creator and start monetizing your digital content with the power of blockchain technology.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/create"
              className="px-6 py-3 bg-white text-indigo-700 font-medium rounded-lg hover:bg-gray-100"
            >
              Create Content
            </Link>
            <Link
              href="/subscriptions/create"
              className="px-6 py-3 bg-indigo-800 text-white font-medium rounded-lg hover:bg-indigo-900"
            >
              Create Subscription Plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 