import { NextApiRequest, NextApiResponse } from 'next';

// Mock token data to simulate blockchain responses
const mockTokens = {
  '1': {
    id: 1,
    tokenURI: 'ipfs://QmXyZ123...',
    creator: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    creationDate: '2023-04-10T00:00:00.000Z',
    isListed: true,
    price: '0.75',
    history: [
      { 
        event: 'minted', 
        from: '0x0000000000000000000000000000000000000000', 
        to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
        price: null,
        timestamp: '2023-04-10T00:00:00.000Z'
      },
      { 
        event: 'listed', 
        from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
        to: null, 
        price: '0.75',
        timestamp: '2023-04-15T00:00:00.000Z'
      }
    ]
  },
  '2': {
    id: 2,
    tokenURI: 'ipfs://QmABC456...',
    creator: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    owner: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    creationDate: '2023-05-20T00:00:00.000Z',
    isListed: false,
    price: null,
    history: [
      { 
        event: 'minted', 
        from: '0x0000000000000000000000000000000000000000', 
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 
        price: null,
        timestamp: '2023-05-20T00:00:00.000Z'
      }
    ]
  },
  '3': {
    id: 3,
    tokenURI: 'ipfs://QmDEF789...',
    creator: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    creationDate: '2023-06-05T00:00:00.000Z',
    isListed: true,
    price: '1.2',
    history: [
      { 
        event: 'minted', 
        from: '0x0000000000000000000000000000000000000000', 
        to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 
        price: null,
        timestamp: '2023-06-05T00:00:00.000Z'
      },
      { 
        event: 'transferred', 
        from: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 
        to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
        price: null,
        timestamp: '2023-06-15T00:00:00.000Z'
      },
      { 
        event: 'listed', 
        from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 
        to: null, 
        price: '1.2',
        timestamp: '2023-06-20T00:00:00.000Z'
      }
    ]
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  // Simulate a delay to mimic blockchain query
  setTimeout(() => {
    const tokenId = Array.isArray(id) ? id[0] : id;
    
    // Check if token exists in our mock data
    if (mockTokens[tokenId as keyof typeof mockTokens]) {
      res.status(200).json(mockTokens[tokenId as keyof typeof mockTokens]);
    } else {
      res.status(404).json({ error: 'Token not found' });
    }
  }, 500);
} 