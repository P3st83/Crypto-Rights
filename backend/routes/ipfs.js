const express = require('express');
const router = express.Router();
const multer = require('multer');
const { create } = require('ipfs-http-client');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Initialize IPFS client (commented out until we have proper credentials)
// const projectId = process.env.IPFS_PROJECT_ID;
// const projectSecret = process.env.IPFS_PROJECT_SECRET;
// const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
// 
// const ipfs = create({
//   host: 'ipfs.infura.io',
//   port: 5001,
//   protocol: 'https',
//   headers: {
//     authorization: auth,
//   },
// });

// Mock IPFS upload function (for development)
const mockIpfsUpload = async (fileBuffer) => {
  // Generate a mock CID (content identifier)
  const mockCid = 'Qm' + Date.now().toString(16) + Math.random().toString(16).substring(2);
  
  // Mock IPFS gateway URL
  const gateway = process.env.IPFS_DEDICATED_GATEWAY || 'https://ipfs.io/ipfs/';
  
  return {
    cid: mockCid,
    url: `${gateway}${mockCid}`,
    size: fileBuffer.length,
  };
};

// POST /api/ipfs/upload - Upload file to IPFS
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded',
      });
    }
    
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    
    // Upload to IPFS (using mock function for now)
    // In production, we would use: const result = await ipfs.add(fileBuffer);
    const ipfsResult = await mockIpfsUpload(fileBuffer);
    
    res.json({
      status: 'success',
      message: 'File uploaded to IPFS successfully',
      data: {
        fileName,
        fileType,
        size: fileBuffer.length,
        cid: ipfsResult.cid,
        url: ipfsResult.url,
      },
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error uploading to IPFS',
    });
  }
});

// POST /api/ipfs/metadata - Upload metadata to IPFS
router.post('/metadata', async (req, res) => {
  try {
    const { title, description, contentType, creator, previewCid, contentCid, price, attributes } = req.body;
    
    // Validate required fields
    if (!title || !contentType || !contentCid) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required metadata fields',
      });
    }
    
    // Create metadata object following NFT standards
    const metadata = {
      name: title,
      description,
      image: previewCid ? `ipfs://${previewCid}` : null,
      content: `ipfs://${contentCid}`,
      content_type: contentType,
      creator,
      attributes: attributes || [],
      price,
      created_at: new Date().toISOString(),
    };
    
    // Convert metadata to JSON buffer
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));
    
    // Upload metadata to IPFS (using mock function for now)
    // In production, we would use: const result = await ipfs.add(metadataBuffer);
    const ipfsResult = await mockIpfsUpload(metadataBuffer);
    
    res.json({
      status: 'success',
      message: 'Metadata uploaded to IPFS successfully',
      data: {
        metadata,
        cid: ipfsResult.cid,
        url: ipfsResult.url,
      },
    });
  } catch (error) {
    console.error('IPFS metadata upload error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error uploading metadata to IPFS',
    });
  }
});

// GET /api/ipfs/:cid - Get IPFS content by CID
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    
    // In a real implementation, we would fetch content from IPFS
    // For now, return mock data
    
    const gateway = process.env.IPFS_DEDICATED_GATEWAY || 'https://ipfs.io/ipfs/';
    const url = `${gateway}${cid}`;
    
    res.json({
      status: 'success',
      data: {
        cid,
        url,
      },
    });
  } catch (error) {
    console.error('IPFS fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error fetching from IPFS',
    });
  }
});

module.exports = router; 