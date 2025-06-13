import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// IPFS configuration - using Infura's IPFS gateway for this example
// In a production app, you might want to use your own IPFS node or a dedicated service
const projectId = process.env.NEXT_PUBLIC_IPFS_PROJECT_ID || '';
const projectSecret = process.env.NEXT_PUBLIC_IPFS_PROJECT_SECRET || '';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

// Create IPFS client
const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

// Interface for metadata
export interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  rights_type: string;
  creator: string;
  created_at: string;
  external_url?: string;
}

/**
 * Upload a file to IPFS
 * @param file The file to upload
 * @returns The IPFS URI of the uploaded file
 */
export const uploadFileToIPFS = async (file: File): Promise<string> => {
  try {
    // For development/mock purposes
    if (process.env.NODE_ENV === 'development' && !projectId) {
      console.log('Using mock IPFS upload in development mode');
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Return a fake IPFS hash
      return `ipfs://Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    }

    // Read the file
    const fileData = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileData);

    // Upload to IPFS
    const added = await client.add(fileBuffer, {
      progress: (prog) => console.log(`Upload progress: ${prog}`)
    });

    // Return the IPFS URI
    return `ipfs://${added.path}`;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

/**
 * Upload metadata to IPFS
 * @param metadata The metadata to upload
 * @returns The IPFS URI of the uploaded metadata
 */
export const uploadMetadataToIPFS = async (metadata: TokenMetadata): Promise<string> => {
  try {
    // For development/mock purposes
    if (process.env.NODE_ENV === 'development' && !projectId) {
      console.log('Using mock IPFS metadata upload in development mode');
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Return a fake IPFS hash
      return `ipfs://Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    }

    // Convert metadata to JSON and then to Buffer
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));

    // Upload to IPFS
    const added = await client.add(metadataBuffer);

    // Return the IPFS URI
    return `ipfs://${added.path}`;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
};

/**
 * Get the HTTP URL for an IPFS URI (for display purposes)
 * @param ipfsUri The IPFS URI (ipfs://...)
 * @returns The HTTP URL for the IPFS resource
 */
export const getIPFSHttpUrl = (ipfsUri: string): string => {
  if (!ipfsUri) return '';
  if (!ipfsUri.startsWith('ipfs://')) return ipfsUri;
  
  // Replace ipfs:// with the IPFS gateway URL
  // Using Infura's IPFS gateway, but you can use any public gateway
  const cid = ipfsUri.replace('ipfs://', '');
  return `https://infura-ipfs.io/ipfs/${cid}`;
};

/**
 * Fetch metadata from IPFS
 * @param ipfsUri The IPFS URI of the metadata
 * @returns The metadata object
 */
export const fetchMetadataFromIPFS = async (ipfsUri: string): Promise<TokenMetadata> => {
  try {
    // For development/mock purposes
    if (process.env.NODE_ENV === 'development' && !ipfsUri.includes('ipfs.io')) {
      console.log('Using mock IPFS metadata fetch in development mode');
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Return mock metadata
      return {
        name: 'Mock NFT',
        description: 'This is a mock NFT for development purposes',
        image: 'https://via.placeholder.com/350',
        attributes: [
          { trait_type: 'Mock Trait', value: 'Mock Value' }
        ],
        rights_type: 'image',
        creator: '0x0000000000000000000000000000000000000000',
        created_at: new Date().toISOString()
      };
    }

    // Get the HTTP URL for the IPFS URI
    const httpUrl = getIPFSHttpUrl(ipfsUri);
    
    // Fetch the metadata
    const response = await fetch(httpUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    // Parse and return the metadata
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw new Error('Failed to fetch metadata from IPFS');
  }
}; 