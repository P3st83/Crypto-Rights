const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  social: {
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  followers: [
    {
      type: String, // wallet addresses
    },
  ],
  following: [
    {
      type: String, // wallet addresses
    },
  ],
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

// Virtual for placeholder username if none is set
UserSchema.virtual('displayName').get(function() {
  if (this.username) return this.username;
  return this.address.substring(0, 6) + '...' + this.address.substring(this.address.length - 4);
});

// Method to check if a user follows another user
UserSchema.methods.isFollowing = function(address) {
  return this.following.includes(address);
};

// Method to follow a user
UserSchema.methods.follow = function(address) {
  if (!this.following.includes(address)) {
    this.following.push(address);
  }
  return this.save();
};

// Method to unfollow a user
UserSchema.methods.unfollow = function(address) {
  this.following = this.following.filter(addr => addr !== address);
  return this.save();
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema); 