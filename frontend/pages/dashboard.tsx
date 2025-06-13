import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useWeb3 } from '../src/context/Web3Context';
import { useCryptoRightsMarketplace } from '../src/hooks/useCryptoRightsMarketplace';
import { formatAddress } from '../src/utils/contracts';

// Define tab types for dashboard
type TabType = 'my-content' | 'earnings' | 'purchases' | 'subscriptions' | 'licenses' | 'settings';

// Mock data for dashboard
const mockMyContent = [
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
    sales: 12,
    earnings: '0.57',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Crypto Art Collection',
    description: 'A beautiful collection of digital art pieces.',
    contentType: 'image',
    previewUrl: 'https://placekitten.com/401/300',
    tokenId: '2',
    price: '0.1',
    views: 842,
    likes: 156,
    sales: 8,
    earnings: '0.74',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

const mockEarnings = [
  {
    id: '1',
    type: 'sale',
    contentId: '1',
    contentTitle: 'Introduction to Blockchain',
    buyer: '0x1234...5678',
    amount: '0.05',
    platformFee: '0.00125',
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    type: 'royalty',
    contentId: '1',
    contentTitle: 'Introduction to Blockchain',
    buyer: '0x8765...4321',
    amount: '0.005',
    platformFee: '0',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    type: 'premium',
    contentId: '1',
    contentTitle: 'Introduction to Blockchain',
    buyer: '0x2468...1357',
    amount: '0.02',
    platformFee: '0.0005',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    type: 'sale',
    contentId: '2',
    contentTitle: 'Crypto Art Collection',
    buyer: '0x1357...2468',
    amount: '0.1',
    platformFee: '0.0025',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

const mockPurchases = [
  {
    id: '1',
    title: 'Advanced Smart Contract Development',
    creator: '0x9876...5432',
    creatorName: 'Blockchain Expert',
    contentType: 'text',
    previewUrl: 'https://placekitten.com/402/300',
    price: '0.08',
    purchaseDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'NFT Collection #42',
    creator: '0x5432...9876',
    creatorName: 'Digital Creator',
    contentType: 'image',
    previewUrl: 'https://placekitten.com/403/300',
    price: '0.12',
    purchaseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
];

const mockSubscriptions = [
  {
    id: '1',
    creator: '0x9876...5432',
    creatorName: 'Blockchain Expert',
    planName: 'Pro Access',
    price: '0.05',
    startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    active: true,
    autoRenew: true,
  },
  {
    id: '2',
    creator: '0x5432...9876',
    creatorName: 'Digital Creator',
    planName: 'VIP Member',
    price: '0.1',
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    active: true,
    autoRenew: false,
  },
];

// Mock licenses data
const mockLicenses = [
  {
    licenseId: 1,
    tokenId: 3,
    owner: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    licensee: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    price: '0.1',
    duration: 30 * 24 * 60 * 60, // 30 days in seconds
    licenseType: 'personal',
    isActive: true,
    expiration: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) // 20 days from now
  },
  {
    licenseId: 2,
    tokenId: 4,
    owner: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    licensee: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    price: '0.2',
    duration: 90 * 24 * 60 * 60, // 90 days in seconds
    licenseType: 'commercial',
    isActive: true,
    expiration: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000) // 85 days from now
  },
  {
    licenseId: 3,
    tokenId: 5,
    owner: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    licensee: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    price: '0.05',
    duration: 30 * 24 * 60 * 60, // 30 days in seconds
    licenseType: 'personal',
    isActive: false,
    expiration: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  }
];

export default function Dashboard() {
  const { isConnected, account, connectWallet } = useWeb3();
  const { userLicenses, fetchUserLicenses } = useCryptoRightsMarketplace();
  const [activeTab, setActiveTab] = useState<TabType>('my-content');
  const [userProfile, setUserProfile] = useState({
    username: '',
    bio: '',
    avatar: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected && typeof window !== 'undefined') {
      router.push('/');
    }
  }, [isConnected, router]);

  // Simulate fetching user profile
  useEffect(() => {
    if (isConnected && account) {
      // In a real app, we'd fetch from API
      // const fetchProfile = async () => {
      //   const res = await fetch(`/api/users/${account}`);
      //   const data = await res.json();
      //   setUserProfile(data);
      // };
      // fetchProfile();

      // Mock data for now
      setUserProfile({
        username: account?.substring(0, 6) + '...' + account?.substring(account.length - 4),
        bio: 'Creator and collector of digital content on the blockchain.',
        avatar: `https://avatars.dicebear.com/api/identicon/${account}.svg`,
      });
    }
  }, [isConnected, account]);

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString();
  };

  // Get stats for content 
  const getContentStats = () => {
    const totalSales = mockMyContent.reduce((acc, item) => acc + item.sales, 0);
    const totalEarnings = mockMyContent.reduce((acc, item) => acc + parseFloat(item.earnings), 0);
    const totalViews = mockMyContent.reduce((acc, item) => acc + item.views, 0);
    const totalLikes = mockMyContent.reduce((acc, item) => acc + item.likes, 0);

    return { totalSales, totalEarnings, totalViews, totalLikes };
  };

  // Get total earnings
  const getTotalEarnings = () => {
    return mockEarnings.reduce((acc, item) => acc + parseFloat(item.amount), 0);
  };

  // Get content type icon
  const getContentTypeIcon = (type: string): string => {
    switch(type) {
      case 'text': return '📝';
      case 'image': return '🎨';
      case 'audio': return '🎵';
      case 'video': return '🎬';
      default: return '📄';
    }
  };

  // Get transaction icon
  const getTransactionIcon = (type: string): string => {
    switch(type) {
      case 'sale': return '💰';
      case 'royalty': return '👑';
      case 'premium': return '⭐';
      case 'subscription': return '🔄';
      default: return '��';
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
  
  // Calculate days remaining for a license
  const getDaysRemaining = (expirationDate: Date | null) => {
    if (!expirationDate) return 0;
    
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Render profile section
  const renderProfile = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
            <img
              src={userProfile.avatar}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{userProfile.username}</h1>
            <p className="text-gray-600 mt-1">{userProfile.bio}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Edit Profile
              </button>
              <Link
                href="/create"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create New Content
              </Link>
              <Link
                href="/subscriptions/create"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Create Subscription Plan
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <div className="text-center">
              <div className="text-2xl font-bold">{mockMyContent.length}</div>
              <div className="text-sm text-gray-600">Content Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{getContentStats().totalSales}</div>
              <div className="text-sm text-gray-600">Sales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{getContentStats().totalEarnings.toFixed(2)} ETH</div>
              <div className="text-sm text-gray-600">Earnings</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render my content tab
  const renderMyContent = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Content</h2>
          <Link
            href="/create"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create New
          </Link>
        </div>

        {mockMyContent.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockMyContent.map(content => (
              <div key={content.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 h-40 md:h-auto relative">
                    <img
                      src={content.previewUrl}
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                      {getContentTypeIcon(content.contentType)} {content.contentType.charAt(0).toUpperCase() + content.contentType.slice(1)}
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1">
                    <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{content.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-4">
                      <div>
                        <div className="text-gray-500">Price</div>
                        <div className="font-medium">{content.price} ETH</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Sales</div>
                        <div className="font-medium">{content.sales}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Earnings</div>
                        <div className="font-medium">{content.earnings} ETH</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Created</div>
                        <div className="font-medium">{formatDate(content.createdAt)}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        href={`/content/${content.id}`}
                        className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                      >
                        View Content
                      </Link>
                      <Link
                        href={`/token/${content.id}`}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Manage Token
                      </Link>
                      <Link
                        href={`/content/${content.id}/edit`}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/content/${content.id}/analytics`}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Analytics
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">You haven't created any content yet.</p>
            <Link
              href="/create"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create Your First Content
            </Link>
          </div>
        )}
      </div>
    );
  };

  // Render earnings tab
  const renderEarnings = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Earnings</h2>
          <div className="text-xl font-bold text-indigo-600">
            {getTotalEarnings().toFixed(4)} ETH
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-4 bg-indigo-50">
            <h3 className="font-medium">Transaction History</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockEarnings.map(earning => (
                  <tr key={earning.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-2">{getTransactionIcon(earning.type)}</span>
                        <span className="capitalize">{earning.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/content/${earning.contentId}`} className="text-indigo-600 hover:text-indigo-800">
                        {earning.contentTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {earning.buyer}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-green-600">
                      +{earning.amount} ETH
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {earning.platformFee} ETH
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {formatDate(earning.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {mockEarnings.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No earnings recorded yet.
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render purchases tab
  const renderPurchases = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-6">My Purchases</h2>

        {mockPurchases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPurchases.map(purchase => (
              <div key={purchase.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-40 relative">
                  <img
                    src={purchase.previewUrl}
                    alt={purchase.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    {getContentTypeIcon(purchase.contentType)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{purchase.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">By {purchase.creatorName}</p>
                  
                  <div className="flex justify-between text-sm mb-3">
                    <div className="text-gray-500">Purchased: {formatDate(purchase.purchaseDate)}</div>
                    <div className="font-medium">{purchase.price} ETH</div>
                  </div>
                  
                  <Link
                    href={`/content/${purchase.id}`}
                    className="w-full block text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    View Content
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">You haven't purchased any content yet.</p>
            <Link
              href="/explore"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Explore Content
            </Link>
          </div>
        )}
      </div>
    );
  };

  // Render subscriptions tab
  const renderSubscriptions = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-6">My Subscriptions</h2>

        {mockSubscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockSubscriptions.map(subscription => (
              <div 
                key={subscription.id} 
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  subscription.active 
                    ? 'border-green-500' 
                    : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{subscription.planName}</h3>
                    <p className="text-gray-600">Creator: {subscription.creatorName}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    subscription.active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {subscription.active ? 'Active' : 'Expired'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>
                    <div className="text-gray-500">Price</div>
                    <div className="font-medium">{subscription.price} ETH / month</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Start Date</div>
                    <div className="font-medium">{formatDate(subscription.startDate)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">End Date</div>
                    <div className="font-medium">{formatDate(subscription.endDate)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Auto Renew</div>
                    <div className="font-medium">{subscription.autoRenew ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    View Content
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                    {subscription.autoRenew ? 'Cancel Auto Renew' : 'Enable Auto Renew'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">You don't have any active subscriptions.</p>
            <Link
              href="/explore"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Explore Creators
            </Link>
          </div>
        )}
      </div>
    );
  };

  // Render licenses tab
  const renderLicenses = () => {
    // In a real app, would use userLicenses from the hook
    // For now, we use the mock data
    const licenses = mockLicenses;
    
    if (licenses.length === 0) {
      return (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
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
            You haven't purchased any licenses yet.
          </p>
          <div className="mt-6">
            <Link
              href="/marketplace/licenses"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Browse License Marketplace
            </Link>
          </div>
        </div>
      );
    }
    
    return (
      <div>
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Your Licenses</h3>
          <Link
            href="/marketplace/licenses"
            className="inline-flex items-center px-3 py-1.5 border border-indigo-500 text-indigo-600 text-sm rounded hover:bg-indigo-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Get More Licenses
          </Link>
        </div>
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
              {licenses.map((license) => (
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
      </div>
    );
  };

  // Render settings tab
  const renderSettings = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Profile Information</h3>
          
          <div className="grid grid-cols-1 gap-4 max-w-2xl">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="input-field"
                placeholder="Enter your username"
                value={userProfile.username}
                onChange={(e) => setUserProfile({...userProfile, username: e.target.value})}
              />
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                className="input-field min-h-[100px]"
                placeholder="Tell others about yourself"
                value={userProfile.bio}
                onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
              />
            </div>
            
            <div>
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                Avatar URL
              </label>
              <input
                type="text"
                id="avatar"
                className="input-field"
                placeholder="Enter avatar URL"
                value={userProfile.avatar}
                onChange={(e) => setUserProfile({...userProfile, avatar: e.target.value})}
              />
            </div>
            
            <div className="mt-2">
              <button className="btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Wallet Information</h3>
          
          <div>
            <div className="text-sm text-gray-600 mb-2">Connected Wallet</div>
            <div className="p-3 bg-gray-50 rounded-md font-mono">
              {account || 'Not connected'}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h3>
          
          <button className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200">
            Delete Account
          </button>
        </div>
      </div>
    );
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Please Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">
            You need to connect your wallet to view your dashboard.
          </p>
          <button
            onClick={connectWallet}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {renderProfile()}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('my-content')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'my-content'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Content
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'purchases'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Purchases
            </button>
            <button
              onClick={() => setActiveTab('licenses')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'licenses'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Licenses
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'subscriptions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Subscriptions
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'earnings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Earnings
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'my-content' && renderMyContent()}
          {activeTab === 'purchases' && renderPurchases()}
          {activeTab === 'subscriptions' && renderSubscriptions()}
          {activeTab === 'earnings' && renderEarnings()}
          {activeTab === 'licenses' && renderLicenses()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
} 