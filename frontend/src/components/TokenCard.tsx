import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface TokenCardProps {
  id: number;
  uri: string;
  rightsType: string;
  creationDate: Date;
  creator: string;
  isOwned?: boolean;
}

const TokenCard: React.FC<TokenCardProps> = ({
  id,
  uri,
  rightsType,
  creationDate,
  creator,
  isOwned = false
}) => {
  // Format addresses for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get image placeholder for rights type
  const getImageForRightsType = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'music':
        return '/images/placeholders/music.jpg';
      case 'image':
        return '/images/placeholders/image.jpg';
      case 'video':
        return '/images/placeholders/video.jpg';
      case 'text':
        return '/images/placeholders/text.jpg';
      default:
        return '/images/placeholders/default.jpg';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      <div className="relative h-48 bg-gray-200">
        {/* Replace with actual image from IPFS if available */}
        <Image
          src={getImageForRightsType(rightsType)}
          alt={`Token #${id}`}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-1 rounded-full text-xs">
          {rightsType}
        </div>
        {isOwned && (
          <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs">
            Owned
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Token #{id}</h3>
        
        <div className="mb-3 text-sm text-gray-600">
          <p>
            <span className="font-medium">Creator:</span> {formatAddress(creator)}
          </p>
          <p>
            <span className="font-medium">Created:</span> {creationDate.toLocaleDateString()}
          </p>
        </div>
        
        <Link 
          href={`/content/${id}`}
          className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TokenCard; 