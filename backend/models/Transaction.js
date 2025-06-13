const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  // Transaction type
  type: {
    type: String,
    enum: ['mint', 'purchase', 'premium', 'auction', 'subscription', 'royalty', 'tip'],
    required: [true, 'Transaction type is required'],
  },
  // User addresses
  from: {
    type: String, // Buyer wallet address
    required: [true, 'From address is required'],
    lowercase: true,
  },
  to: {
    type: String, // Creator/seller wallet address
    required: [true, 'To address is required'],
    lowercase: true,
  },
  // Content & blockchain info
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
  },
  tokenId: {
    type: String,
  },
  transactionHash: {
    type: String,
    required: [true, 'Transaction hash is required'],
  },
  blockNumber: {
    type: Number,
  },
  // Financial details
  amount: {
    type: String, // in wei
    required: [true, 'Amount is required'],
  },
  platformFee: {
    type: String, // in wei
    default: '0',
  },
  royaltyAmount: {
    type: String, // in wei
    default: '0',
  },
  currency: {
    type: String,
    default: 'ETH',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  // For subscription or premium content
  expiresAt: {
    type: Date,
  },
  // For auction transactions
  auctionId: {
    type: String,
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster queries
TransactionSchema.index({ from: 1, to: 1, type: 1, createdAt: -1 });

// Virtual for formatted amount in ETH
TransactionSchema.virtual('formattedAmount').get(function() {
  // Convert wei to ETH (division by 10^18)
  const amountInEth = parseFloat(this.amount) / 1e18;
  return amountInEth.toFixed(6) + ' ETH';
});

// Static method to get user's purchase history
TransactionSchema.statics.getUserPurchases = function(address) {
  return this.find({ 
    from: address.toLowerCase(),
    type: { $in: ['purchase', 'premium', 'subscription'] },
    status: 'completed'
  })
  .sort({ createdAt: -1 })
  .populate('contentId');
};

// Static method to get creator's earnings
TransactionSchema.statics.getCreatorEarnings = function(address) {
  return this.find({ 
    to: address.toLowerCase(),
    status: 'completed'
  })
  .sort({ createdAt: -1 });
};

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema); 