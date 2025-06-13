const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  creator: {
    type: String, // Wallet address
    required: [true, 'Creator address is required'],
    lowercase: true,
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'audio', 'video'],
    required: [true, 'Content type is required'],
  },
  // Metadata stored on IPFS
  metadataURI: {
    type: String,
    required: [true, 'Metadata URI is required'],
  },
  // Preview content (publicly visible)
  previewURI: {
    type: String,
  },
  // Full content (accessible only to owners/premium users)
  contentURI: {
    type: String,
    required: [true, 'Content URI is required'],
  },
  // Blockchain details
  tokenId: {
    type: String,
    required: [true, 'Token ID is required'],
  },
  contractAddress: {
    type: String,
    required: [true, 'Contract address is required'],
    lowercase: true,
  },
  // Pricing and access control
  price: {
    type: String, // in wei
    default: '0',
  },
  royaltyPercentage: {
    type: Number,
    default: 10, // 10%
    min: 0,
    max: 30,
  },
  hasPremiumVersion: {
    type: Boolean,
    default: false,
  },
  premiumPrice: {
    type: String, // in wei
    default: '0',
  },
  // Auction details, if applicable
  isAuctioned: {
    type: Boolean,
    default: false,
  },
  auctionId: {
    type: String,
    default: '',
  },
  // Content metadata
  tags: [{
    type: String,
    trim: true,
  }],
  // Community engagement metrics
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for search functionality
ContentSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual to generate full preview URL
ContentSchema.virtual('previewUrl').get(function() {
  if (!this.previewURI) return '';
  if (this.previewURI.startsWith('http')) return this.previewURI;
  return `https://ipfs.io/ipfs/${this.previewURI.replace('ipfs://', '')}`;
});

// Virtual to generate full content URL
ContentSchema.virtual('contentUrl').get(function() {
  if (!this.contentURI) return '';
  if (this.contentURI.startsWith('http')) return this.contentURI;
  return `https://ipfs.io/ipfs/${this.contentURI.replace('ipfs://', '')}`;
});

// Method to increment view count
ContentSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle like
ContentSchema.methods.toggleLike = function() {
  this.likes += 1;
  return this.save();
};

module.exports = mongoose.models.Content || mongoose.model('Content', ContentSchema); 