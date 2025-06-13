import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { useWeb3 } from '../src/context/Web3Context';
import { useCryptoRightsToken } from '../src/hooks/useCryptoRightsToken';
import { uploadFileToIPFS, uploadMetadataToIPFS, TokenMetadata } from '../src/utils/ipfs';

// Available rights types
const RIGHTS_TYPES = [
  { id: 'music', label: 'Music', description: 'Rights for musical compositions and recordings' },
  { id: 'image', label: 'Image', description: 'Rights for photographs, illustrations, and visual art' },
  { id: 'video', label: 'Video', description: 'Rights for video content and motion pictures' },
  { id: 'text', label: 'Text', description: 'Rights for written works, articles, and publications' },
];

// Form data type
interface FormData {
  title: string;
  description: string;
  rightsType: string;
  contentFile: File | null;
  previewImage: File | null;
  royaltyPercent: number;
}

export default function Create() {
  const router = useRouter();
  const { account, isConnected, connectWallet } = useWeb3();
  const { createRight } = useCryptoRightsToken();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    rightsType: 'music',
    contentFile: null,
    previewImage: null,
    royaltyPercent: 10
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contentFilePreview, setContentFilePreview] = useState<string>('');
  const [previewImagePreview, setPreviewImagePreview] = useState<string>('');
  
  // Redirect if not connected
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isConnected && router.isReady) {
      toast.info('Please connect your wallet to create content');
      timer = setTimeout(() => {
        router.push('/');
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isConnected, router]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setFormData(prev => ({ ...prev, [name]: file }));
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (name === 'contentFile') {
        setContentFilePreview(reader.result as string);
      } else if (name === 'previewImage') {
        setPreviewImagePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.info('Please connect your wallet first');
      connectWallet();
      return;
    }
    
    if (!formData.contentFile) {
      toast.error('Please upload a content file');
      return;
    }
    
    // Validate form
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      toast.info('Uploading content to IPFS...');
      setUploadProgress(10);
      
      // Upload content file to IPFS
      const contentUri = await uploadFileToIPFS(formData.contentFile);
      setUploadProgress(40);
      
      // Upload preview image if provided, otherwise use default
      let imageUri;
      if (formData.previewImage) {
        imageUri = await uploadFileToIPFS(formData.previewImage);
      } else {
        // Use default image based on content type
        imageUri = `/images/placeholders/${formData.rightsType}.jpg`;
      }
      setUploadProgress(60);
      
      // Prepare metadata
      const metadata: TokenMetadata = {
        name: formData.title,
        description: formData.description,
        image: imageUri,
        animation_url: formData.rightsType === 'video' || formData.rightsType === 'music' ? contentUri : undefined,
        attributes: [
          {
            trait_type: 'Rights Type',
            value: formData.rightsType
          },
          {
            trait_type: 'Royalty Percentage',
            value: formData.royaltyPercent
          }
        ],
        rights_type: formData.rightsType,
        creator: account || '',
        created_at: new Date().toISOString(),
        external_url: `${window.location.origin}/content/[id]` // Will be replaced with actual ID
      };
      
      // Upload metadata to IPFS
      toast.info('Uploading metadata to IPFS...');
      const metadataUri = await uploadMetadataToIPFS(metadata);
      setUploadProgress(80);
      
      // Create token on the blockchain
      toast.info('Creating token on the blockchain...');
      const tokenId = await createRight(
        metadataUri, 
        formData.rightsType,
        formData.royaltyPercent * 100 // Convert to basis points (10% = 1000)
      );
      
      setUploadProgress(100);
      toast.success('Content successfully created!');
      
      // Redirect to token page
      router.push(`/token/${tokenId}`);
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Failed to create content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render progress bar
  const renderProgressBar = () => {
    if (!isSubmitting) return null;
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${uploadProgress}%` }}
        ></div>
      </div>
    );
  };
  
  return (
    <>
      <Head>
        <title>Create New Content | CryptoRights</title>
        <meta name="description" content="Create and mint new digital rights content on the CryptoRights platform" />
      </Head>
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Create New Content</h1>
        
        {renderProgressBar()}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter content title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your content and usage rights"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={isSubmitting}
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="rightsType" className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type *
                </label>
                <select
                  id="rightsType"
                  name="rightsType"
                  value={formData.rightsType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isSubmitting}
                >
                  {RIGHTS_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="royaltyPercent" className="block text-sm font-medium text-gray-700 mb-1">
                  Royalty Percentage (%)
                </label>
                <input
                  type="number"
                  id="royaltyPercent"
                  name="royaltyPercent"
                  value={formData.royaltyPercent}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Percentage of secondary sales you'll receive (0-50%)
                </p>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label htmlFor="contentFile" className="block text-sm font-medium text-gray-700 mb-1">
                  Content File *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {contentFilePreview ? (
                      <div className="mb-3">
                        <img 
                          src={contentFilePreview} 
                          alt="Content preview" 
                          className="mx-auto h-32 w-auto object-cover"
                        />
                      </div>
                    ) : (
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="contentFile"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="contentFile"
                          name="contentFile"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      MP3, MP4, PDF, PNG, JPG up to 50MB
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="previewImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Preview Image (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {previewImagePreview ? (
                      <div className="mb-3">
                        <img 
                          src={previewImagePreview} 
                          alt="Preview image" 
                          className="mx-auto h-32 w-auto object-cover"
                        />
                      </div>
                    ) : (
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="previewImage"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="previewImage"
                          name="previewImage"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isSubmitting || !isConnected}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Content NFT'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
} 