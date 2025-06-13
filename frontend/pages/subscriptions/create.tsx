import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ethers } from 'ethers';
import { useWeb3 } from '@/context/Web3Context';

// Subscription plan form data type
interface PlanFormData {
  name: string;
  price: string;
  duration: number;
  description: string;
  benefits: string[];
}

export default function CreateSubscriptionPlan() {
  const router = useRouter();
  const { isConnected, account, connectWallet, contracts } = useWeb3();
  
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    price: '0.01',
    duration: 30,
    description: '',
    benefits: ['']
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const benefitInputRef = useRef<HTMLInputElement>(null);
  
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle benefit update
  const handleBenefitChange = (index: number, value: string) => {
    const updatedBenefits = [...formData.benefits];
    updatedBenefits[index] = value;
    setFormData(prev => ({ ...prev, benefits: updatedBenefits }));
  };
  
  // Add a new empty benefit
  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };
  
  // Remove a benefit
  const removeBenefit = (index: number) => {
    if (formData.benefits.length === 1) return; // Keep at least one benefit field
    
    const updatedBenefits = [...formData.benefits];
    updatedBenefits.splice(index, 1);
    setFormData(prev => ({ ...prev, benefits: updatedBenefits }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      connectWallet();
      return;
    }
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Plan name is required');
      return;
    }
    
    if (parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }
    
    if (formData.duration <= 0) {
      setError('Duration must be greater than 0');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    // Filter out empty benefits
    const filteredBenefits = formData.benefits.filter(benefit => benefit.trim() !== '');
    if (filteredBenefits.length === 0) {
      setError('At least one benefit is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, we'd interact with the smart contract
      // const priceInWei = ethers.utils.parseEther(formData.price);
      // const tx = await contracts.cryptoRightsSubscription.createPlan(
      //   formData.name,
      //   formData.description,
      //   priceInWei,
      //   formData.duration,
      //   filteredBenefits
      // );
      // await tx.wait();
      
      // Mock subscription plan creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success!
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard?tab=subscriptions');
      }, 3000);
      
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      setError('Failed to create subscription plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Predefined duration options
  const durationOptions = [
    { value: 7, label: '7 days (1 week)' },
    { value: 30, label: '30 days (1 month)' },
    { value: 90, label: '90 days (3 months)' },
    { value: 180, label: '180 days (6 months)' },
    { value: 365, label: '365 days (1 year)' },
  ];
  
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">
            You need to connect your wallet to create subscription plans for your content.
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
  
  if (success) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">Subscription Plan Created!</h1>
          <p className="text-gray-700 mb-6">
            Your subscription plan has been successfully created. You can now manage 
            it from your dashboard and your followers can subscribe to it.
          </p>
          <Link
            href="/dashboard?tab=subscriptions"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-block"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 inline-flex items-center">
          ← Back to Dashboard
        </Link>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Create Subscription Plan</h1>
        <p className="text-gray-600 mb-8">
          Create a subscription plan to offer exclusive content to your followers
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Basic Plan Information */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">Plan Information</h2>
            
            <div className="mb-4">
              <label htmlFor="name" className="block font-medium text-gray-700 mb-1">
                Plan Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Basic, Pro, Premium"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="price" className="block font-medium text-gray-700 mb-1">
                  Price (ETH) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.001"
                  min="0.001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block font-medium text-gray-700 mb-1">
                  Duration *
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what subscribers will get"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                required
              />
            </div>
          </div>
          
          {/* Benefits Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Benefits</h2>
              <button
                type="button"
                onClick={addBenefit}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm"
              >
                Add Benefit
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleBenefitChange(index, e.target.value)}
                    placeholder={`Benefit ${index + 1}`}
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    ref={index === formData.benefits.length - 1 ? benefitInputRef : null}
                  />
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    disabled={formData.benefits.length === 1}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              List the benefits and perks subscribers will receive
            </p>
          </div>
          
          {/* Preview Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Plan Preview</h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="bg-purple-50 p-4 border border-purple-200 rounded-lg">
                <h3 className="text-xl font-bold text-purple-700">{formData.name || 'Plan Name'}</h3>
                <div className="mt-1 flex items-baseline">
                  <span className="text-2xl font-bold">{formData.price} ETH</span>
                  <span className="ml-1 text-gray-600">/ {formData.duration === 30 ? 'month' : formData.duration === 365 ? 'year' : `${formData.duration} days`}</span>
                </div>
                
                <p className="mt-3 text-gray-700">{formData.description || 'Plan description will appear here'}</p>
                
                <h4 className="font-medium mt-4 mb-2">Benefits:</h4>
                <ul className="space-y-2">
                  {formData.benefits.filter(b => b.trim()).map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                  {formData.benefits.filter(b => b.trim()).length === 0 && (
                    <li className="text-gray-500">Add benefits to see them here</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg text-white font-medium ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Creating Plan...' : 'Create Subscription Plan'}
            </button>
          </div>
        </form>
        
        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-blue-800 mb-3">Tips for Creating Effective Subscription Plans</h2>
          
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Offer clear value that justifies the subscription price</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Create multiple tiers with different price points to appeal to a wider audience</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Be specific about what subscribers will receive</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Consider offering an annual plan at a discount to encourage longer commitments</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Regularly create exclusive content for subscribers to maintain their interest</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 