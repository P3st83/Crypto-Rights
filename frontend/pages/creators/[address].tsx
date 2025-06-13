import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useWeb3 } from '@/context/Web3Context';

// Content type for content cards
type ContentType = 'text' | 'image' | 'audio' | 'video';

interface CreatorContent {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  previewUrl: string;
  tokenId: string;
  price: string;
  views: number;
  likes: number;
  createdAt: Date;
}

interface Creator {
  address: string;
  username: string;
  bio: string;
  avatar: string;
  verified: boolean;
  joinedDate: Date;
  social: {
    twitter: string;
    instagram: string;
    website: string;
  };
  stats: {
    totalContent: number;
    totalSales: number;
    followers: number;
    following: number;
  };
}

// Subscription plan type
interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  duration: number; // in days
  description: string;
  benefits: string[];
}

export default function CreatorProfile() {
  const router = useRouter();
  const { address } = router.query;
  const { isConnected, account, connectWallet } = useWeb3();
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [creatorContent, setCreatorContent] = useState<CreatorContent[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch creator data
  useEffect(() => {
    const fetchCreatorData = async () => {
      if (!address) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, we'd fetch from the API
        // const res = await fetch(`/api/users/${address}`);
        // const data = await res.json();
        
        // For now, use mock data for creator
        const mockCreator: Creator = {
          address: address as string,
          username: 'BlockchainExpert',
          bio: 'Educator and developer in the blockchain space with over 5 years of experience. Creating educational content about crypto, blockchain, and Web3 technologies.',
          avatar: `https://avatars.dicebear.com/api/identicon/${address}.svg`,
          verified: true,
          joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
          social: {
            twitter: 'blockchainexpert',
            instagram: 'blockchain_expert',
            website: 'https://blockchainexpert.com'
          },
          stats: {
            totalContent: 12,
            totalSales: 156,
            followers: 487,
            following: 32
          }
        };
        
        // Mock content by this creator
        const mockContent: CreatorContent[] = [
          {
            id: '1',
            title: 'Introduction to Blockchain',
            description: 'Learn the basics of blockchain technology and its applications.',
            contentType: 'text',
            previewUrl: 'https://placekitten.com/400/300',
            tokenId: '1',
            price: '0.05',
            views: 1240,
            likes: 89,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          },
          {
            id: '2',
            title: 'Smart Contract Development',
            description: 'A comprehensive guide to developing smart contracts on Ethereum.',
            contentType: 'text',
            previewUrl: 'https://placekitten.com/401/300',
            tokenId: '2',
            price: '0.08',
            views: 950,
            likes: 72,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
          {
            id: '3',
            title: 'Blockchain Architecture Explained',
            description: 'Detailed diagrams and explanations of blockchain architecture.',
            contentType: 'image',
            previewUrl: 'https://placekitten.com/402/300',
            tokenId: '3',
            price: '0.03',
            views: 783,
            likes: 45,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            id: '4',
            title: 'Web3 Development Podcast',
            description: 'Weekly podcast discussing trends in Web3 development.',
            contentType: 'audio',
            previewUrl: 'https://placekitten.com/403/300',
            tokenId: '4',
            price: '0.02',
            views: 612,
            likes: 38,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: '5',
            title: 'DeFi Explained',
            description: 'Video tutorial series on decentralized finance protocols.',
            contentType: 'video',
            previewUrl: 'https://placekitten.com/404/300',
            tokenId: '5',
            price: '0.1',
            views: 1560,
            likes: 124,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
        ];
        
        // Mock subscription plans
        const mockSubscriptionPlans: SubscriptionPlan[] = [
          {
            id: '1',
            name: 'Basic',
            price: '0.01',
            duration: 30, // 30 days
            description: 'Access to basic content and weekly updates',
            benefits: [
              'Premium articles',
              'Community access',
              'Early content notifications'
            ]
          },
          {
            id: '2',
            name: 'Pro',
            price: '0.05',
            duration: 30,
            description: 'Full access to all content and extra perks',
            benefits: [
              'All premium content',
              'Exclusive community access',
              'Monthly live Q&A sessions',
              'Direct messaging with creator',
              'Vote on upcoming content'
            ]
          },
        ];
        
        setCreator(mockCreator);
        setCreatorContent(mockContent);
        setSubscriptionPlans(mockSubscriptionPlans);
        
        // Check if following
        if (isConnected && account) {
          // In a real app, we'd check against API
          // const followRes = await fetch(`/api/users/${account}/following/${address}`);
          // const { isFollowing } = await followRes.json();
          
          setIsFollowing(Math.random() > 0.5); // Mock - randomly set
          setIsSubscribed(Math.random() > 0.7); // Mock - randomly set
        }
        
      } catch (error) {
        console.error('Error fetching creator data:', error);
        setError('Failed to load creator profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCreatorData();
  }, [address, isConnected, account]);
  
  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }
    
    try {
      // In a real app, we'd call API
      // const action = isFollowing ? 'unfollow' : 'follow';
      // await fetch(`/api/users/${address}/${action}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      // });
      
      // Toggle following state
      setIsFollowing(prev => !prev);
      
      // Update follower count
      setCreator(prev => {
        if (!prev) return prev;
        
        const followerDelta = isFollowing ? -1 : 1;
        return {
          ...prev,
          stats: {
            ...prev.stats,
            followers: prev.stats.followers + followerDelta
          }
        };
      });
      
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status. Please try again.');
    }
  };
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };
  
  // Format address for display
  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="loader"></div>
        </div>
      </div>
    );
  }
  
  if (error || !creator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Creator not found'}
        </div>
        <div className="mt-4">
          <Link href="/explore" className="text-indigo-600 hover:text-indigo-800">
            ← Back to Explore
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Creator Profile Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32"></div>
        <div className="px-6 py-4 sm:px-8 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-shrink-0 -mt-16 sm:-mt-20 mb-4 sm:mb-0 sm:mr-6">
              <img
                src={creator.avatar}
                alt={creator.username}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white"
              />
            </div>
            
            <div className="flex-grow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center">
                    <h1 className="text-2xl sm:text-3xl font-bold">{creator.username}</h1>
                    {creator.verified && (
                      <span className="ml-2 text-blue-500 text-lg">✓</span>
                    )}
                  </div>
                  <p className="text-gray-600">{formatAddress(creator.address)}</p>
                </div>
                
                <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
                  {!isConnected ? (
                    <button
                      onClick={connectWallet}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Connect Wallet
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleFollowToggle}
                        className={`px-4 py-2 rounded-md ${
                          isFollowing
                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      
                      {!isSubscribed && (
                        <Link
                          href={`/creators/${creator.address}/subscribe`}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                          Subscribe
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-700">{creator.bio}</p>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-6">
                <div className="text-center">
                  <div className="text-lg font-bold">{creator.stats.totalContent}</div>
                  <div className="text-sm text-gray-600">Content</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{creator.stats.followers}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{creator.stats.following}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{creator.stats.totalSales}</div>
                  <div className="text-sm text-gray-600">Sales</div>
                </div>
                <div className="text-sm text-gray-500 ml-auto self-end">
                  Joined {formatDate(creator.joinedDate)}
                </div>
              </div>
              
              {/* Social links */}
              <div className="mt-4 flex gap-4">
                {creator.social.twitter && (
                  <a
                    href={`https://twitter.com/${creator.social.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Twitter
                  </a>
                )}
                {creator.social.instagram && (
                  <a
                    href={`https://instagram.com/${creator.social.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-700"
                  >
                    Instagram
                  </a>
                )}
                {creator.social.website && (
                  <a
                    href={creator.social.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 font-medium whitespace-nowrap ${
                activeTab === 'content'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-4 py-2 font-medium whitespace-nowrap ${
                activeTab === 'subscriptions'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 font-medium whitespace-nowrap ${
                activeTab === 'about'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              About
            </button>
          </nav>
        </div>
      </div>
      
      {/* Tab Content */}
      <div>
        {/* Content Tab */}
        {activeTab === 'content' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creatorContent.map(content => (
                <div key={content.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={content.previewUrl}
                      alt={content.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                      {getContentTypeIcon(content.contentType)} {content.contentType.charAt(0).toUpperCase() + content.contentType.slice(1)}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{content.description}</p>
                    
                    <div className="flex justify-between items-center text-sm mb-3">
                      <div className="text-gray-500">
                        {new Date(content.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span>👁️ {content.views}</span>
                        <span>❤️ {content.likes}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-indigo-600 font-semibold">
                        {content.price} ETH
                      </div>
                      <Link
                        href={`/content/${content.id}`}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {creatorContent.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">This creator hasn't published any content yet.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Subscription Plans Tab */}
        {activeTab === 'subscriptions' && (
          <div>
            {subscriptionPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptionPlans.map(plan => (
                  <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-purple-200">
                    <div className="bg-purple-50 p-4 border-b border-purple-200">
                      <h3 className="text-xl font-bold text-purple-700">{plan.name}</h3>
                      <div className="mt-1 flex items-baseline">
                        <span className="text-2xl font-bold">{plan.price} ETH</span>
                        <span className="ml-1 text-gray-600">/ month</span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-gray-700 mb-4">{plan.description}</p>
                      
                      <h4 className="font-medium mb-2">Benefits include:</h4>
                      <ul className="space-y-2">
                        {plan.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-6">
                        {isSubscribed ? (
                          <div className="w-full py-2 bg-green-100 text-green-700 text-center rounded">
                            Currently Subscribed
                          </div>
                        ) : (
                          <Link
                            href={`/creators/${creator.address}/subscribe?plan=${plan.id}`}
                            className="block w-full py-2 bg-purple-600 text-white text-center rounded hover:bg-purple-700"
                          >
                            Subscribe Now
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  This creator doesn't have any subscription plans yet.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">About {creator.username}</h2>
            
            <div className="prose max-w-none">
              <p className="mb-4">{creator.bio}</p>
              <p>
                {creator.username} has been a member since {formatDate(creator.joinedDate)} and has
                published {creator.stats.totalContent} pieces of content with a total of {creator.stats.totalSales} sales.
              </p>
            </div>
            
            {Object.values(creator.social).some(value => value) && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Connect with {creator.username}</h3>
                
                <div className="flex flex-wrap gap-4">
                  {creator.social.twitter && (
                    <a
                      href={`https://twitter.com/${creator.social.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      Twitter
                    </a>
                  )}
                  
                  {creator.social.instagram && (
                    <a
                      href={`https://instagram.com/${creator.social.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-pink-100 text-pink-600 rounded hover:bg-pink-200"
                    >
                      Instagram
                    </a>
                  )}
                  
                  {creator.social.website && (
                    <a
                      href={creator.social.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 