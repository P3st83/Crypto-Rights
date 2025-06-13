const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  // Creator details
  creator: {
    type: String, // Creator wallet address
    required: [true, 'Creator address is required'],
    lowercase: true,
  },
  // Subscriber details
  subscriber: {
    type: String, // Subscriber wallet address
    required: [true, 'Subscriber address is required'],
    lowercase: true,
  },
  // Subscription details
  planId: {
    type: String,
    required: [true, 'Plan ID is required'],
  },
  planName: {
    type: String,
    required: [true, 'Plan name is required'],
  },
  price: {
    type: String, // in wei
    required: [true, 'Price is required'],
  },
  duration: {
    type: Number, // in days
    required: [true, 'Duration is required'],
    min: 1,
  },
  // Status and dates
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  autoRenew: {
    type: Boolean,
    default: false,
  },
  // Transaction details
  transactionHash: {
    type: String,
    required: [true, 'Transaction hash is required'],
  },
  renewalTransactionHash: {
    type: String,
  },
  // Benefits included
  benefits: [{
    type: String,
  }],
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index for uniqueness
SubscriptionSchema.index({ creator: 1, subscriber: 1, planId: 1 }, { unique: true });

// Virtual to check if subscription is expired
SubscriptionSchema.virtual('isExpired').get(function() {
  return new Date() > this.endDate;
});

// Virtual for remaining days
SubscriptionSchema.virtual('remainingDays').get(function() {
  if (this.isExpired) return 0;
  const diff = this.endDate.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Method to renew subscription
SubscriptionSchema.methods.renew = function(transactionHash) {
  this.startDate = this.endDate; // Start from the previous end date
  this.endDate = new Date(this.endDate.getTime() + (this.duration * 24 * 60 * 60 * 1000));
  this.renewalTransactionHash = transactionHash;
  this.isActive = true;
  return this.save();
};

// Method to cancel subscription
SubscriptionSchema.methods.cancel = function() {
  this.autoRenew = false;
  return this.save();
};

// Static method to find active subscriptions for a user
SubscriptionSchema.statics.findActiveSubscriptions = function(subscriberAddress) {
  return this.find({
    subscriber: subscriberAddress.toLowerCase(),
    endDate: { $gt: new Date() },
    isActive: true
  }).sort({ endDate: 1 });
};

// Static method to find subscribers for a creator
SubscriptionSchema.statics.findSubscribers = function(creatorAddress) {
  return this.find({
    creator: creatorAddress.toLowerCase(),
    endDate: { $gt: new Date() },
    isActive: true
  });
};

module.exports = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema); 