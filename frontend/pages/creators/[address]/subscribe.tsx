import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ethers } from 'ethers';
import { useWeb3 } from '@/context/Web3Context';

// Subscription plan type
interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  duration: number; // in days
  description: string;
  benefits: string[];
}

// Creator type
interface Creator {
  address: string;
  username: string;
  bio: string;
  avatar: string;
  verified: boolean;
}

export default function Subscribe() {
  const router = useRouter();
  const { address, plan: planId } = router.query;
  const { isConnected, account, connectWallet, contracts } = useWeb3();
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  
  // Fetch creator and subscription plans
  useEffect(() => {
    const fetchCreatorAndPlans = async () => {
      if (!address) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, we'd fetch from the API
        // const creatorRes = await fetch(`/api/users/${address}`);
        // const creatorData = await creatorRes.json();
        
        // const plansRes = await fetch(`/api/users/${address}/subscription-plans`);
        // const plansData = await plansRes.json();
        
        // Mock creator data
        const mockCreator: Creator = {
          address: address as string,
          username: 'BlockchainExpert',
          bio: 'Educator and developer in the blockchain space',
          avatar: `https://avatars.dicebear.com/api/identicon/${address}.svg`,
          verified: true
        };
        
        // Mock subscription plans
        const mockPlans: SubscriptionPlan[] = [
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
          {
            id: '3',
            name: 'Annual Pro',
            price: '0.5',
            duration: 365,
            description: 'Full access to all content for a full year at a discount',
            benefits: [
              'All Pro benefits',
              'Save 16% compared to monthly',
              'Exclusive yearly content bundle',
              'Priority support'
            ]
          }
        ];
        
        setCreator(mockCreator);
        setAvailablePlans(mockPlans);
        
        // Set selected plan from URL parameter or default to first plan
        if (planId && mockPlans.some(p => p.id === planId)) {
          setSelectedPlanId(planId as string);
        } else {
          setSelectedPlanId(mockPlans[0].id);
        }
        
      } catch (error) {
        console.error('Error fetching creator data:', error);
        setError('Failed to load creator or subscription plans. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCreatorAndPlans();
  }, [address, planId]);
  
  // Get the selected plan object
  const selectedPlan = availablePlans.find(plan => plan.id === selectedPlanId) || null;
  
  // Handle plan selection
  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
  };
  
  // Handle subscription purchase
  const handleSubscribe = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }
    
    if (!selectedPlan || !creator) return;
    
    try {
      setProcessingPayment(true);
      setError(null);
      
      // In a real app, we'd use the subscription contract
      // const price = ethers.utils.parseEther(selectedPlan.price);
      // const tx = await contracts.cryptoRightsSubscription.subscribe(
      //   creator.address,
      //   selectedPlan.id,
      //   selectedPlan.duration,
      //   { value: price }
      // );
      // await tx.wait();
      
      // Mock subscription process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success!
      setTransactionSuccess(true);
      
    } catch (error) {
      console.error('Error subscribing:', error);
      setError('Failed to process subscription. Please check your wallet and try again.');
    } finally {
      setProcessingPayment(false);
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
  
  if (error || !creator || !selectedPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Failed to load subscription details'}
        </div>
        <div className="mt-4">
          <Link href={`/creators/${address}`} className="text-indigo-600 hover:text-indigo-800">
            ← Back to Creator Profile
          </Link>
        </div>
      </div>
    );
  }
  
  if (transactionSuccess) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">Subscription Successful!</h1>
          <p className="text-gray-700 mb-6">
            You have successfully subscribed to {creator.username}'s {selectedPlan.name} plan.
            Your subscription is active and will expire in {selectedPlan.duration} days.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="font-medium mb-2">Subscription Details</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Plan:</div>
              <div>{selectedPlan.name}</div>
              
              <div className="text-gray-600">Price:</div>
              <div>{selectedPlan.price} ETH</div>
              
              <div className="text-gray-600">Duration:</div>
              <div>{selectedPlan.duration} days</div>
              
              <div className="text-gray-600">Creator:</div>
              <div>{creator.username}</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/creators/${address}`}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Back to Creator Profile
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href={`/creators/${address}`} className="text-indigo-600 hover:text-indigo-800 inline-flex items-center">
          ← Back to Creator Profile
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Subscribe to {creator.username}</h1>
        <p className="text-gray-600 mb-8">
          Choose a subscription plan to get access to exclusive content
        </p>
        
        {/* Creator info */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8 flex items-center">
          <img
            src={creator.avatar}
            alt={creator.username}
            className="w-12 h-12 rounded-full mr-4"
          />
          <div>
            <div className="flex items-center">
              <h2 className="font-medium">{creator.username}</h2>
              {creator.verified && (
                <span className="ml-1 text-blue-500 text-sm">✓</span>
              )}
            </div>
            <p className="text-sm text-gray-600">{formatAddress(creator.address)}</p>
          </div>
        </div>
        
        {/* Plan selection */}
        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">Select a Subscription Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availablePlans.map(plan => (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPlanId === plan.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'
                }`}
              >
                <div className={`text-lg font-bold mb-1 ${
                  selectedPlanId === plan.id ? 'text-purple-700' : 'text-gray-800'
                }`}>
                  {plan.name}
                </div>
                <div className="flex items-baseline mb-2">
                  <span className="text-xl font-bold">{plan.price} ETH</span>
                  <span className="text-gray-600 ml-1 text-sm">
                    / {plan.duration === 30 ? 'month' : plan.duration === 365 ? 'year' : `${plan.duration} days`}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                
                {selectedPlanId === plan.id && (
                  <div className="mt-2 bg-purple-100 rounded-md p-2 text-center text-purple-700 text-sm">
                    Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Selected plan details */}
        {selectedPlan && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-medium mb-4">Subscription Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">{selectedPlan.name} Plan Includes:</h3>
                <ul className="space-y-2">
                  {selectedPlan.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Payment Summary</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan price</span>
                    <span>{selectedPlan.price} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span>{selectedPlan.duration} days</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{selectedPlan.price} ETH</span>
                    </div>
                  </div>
                </div>
                
                {!isConnected ? (
                  <button
                    onClick={connectWallet}
                    className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Connect Wallet to Subscribe
                  </button>
                ) : (
                  <button
                    onClick={handleSubscribe}
                    disabled={processingPayment}
                    className={`w-full py-3 rounded-md text-white font-medium ${
                      processingPayment
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {processingPayment ? 'Processing...' : `Subscribe for ${selectedPlan.price} ETH`}
                  </button>
                )}
                
                <p className="mt-3 text-xs text-gray-500 text-center">
                  Subscription will auto-expire after {selectedPlan.duration} days.
                  You can cancel anytime from your dashboard.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* FAQ section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-medium mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">What happens when I subscribe?</h3>
              <p className="text-gray-700 text-sm">
                When you subscribe, you'll gain access to exclusive content from this creator
                for the duration of your subscription. Your subscription is stored on the blockchain,
                and the payment goes directly to the creator.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">How do I access subscribed content?</h3>
              <p className="text-gray-700 text-sm">
                After subscribing, you'll have immediate access to all content included in your
                subscription plan. You can access this content from the creator's profile or
                your dashboard under "My Subscriptions".
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Can I cancel my subscription?</h3>
              <p className="text-gray-700 text-sm">
                Yes, you can cancel your subscription at any time from your dashboard.
                Your access will remain active until the end of your current subscription period.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Do subscriptions auto-renew?</h3>
              <p className="text-gray-700 text-sm">
                By default, subscriptions do not auto-renew. You can enable auto-renewal from
                your dashboard if you wish to continue your subscription automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 