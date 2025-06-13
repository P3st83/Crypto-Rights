const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  // Content being commented on
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: [true, 'Content ID is required'],
  },
  // User who made the comment
  user: {
    type: String, // User wallet address
    required: [true, 'User address is required'],
    lowercase: true,
  },
  // Comment content
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
  },
  // Parent comment (for replies)
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  // Reactions
  likes: {
    type: Number,
    default: 0,
  },
  // Users who liked this comment
  likedBy: [{
    type: String, // User wallet addresses
  }],
  // Moderation
  isHidden: {
    type: Boolean,
    default: false,
  },
  hiddenReason: {
    type: String,
  },
  // Flag for edited comments
  isEdited: {
    type: Boolean,
    default: false,
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
}, {
  timestamps: true,
});

// Index for faster queries
CommentSchema.index({ contentId: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1 });

// Virtual to check if comment is a reply
CommentSchema.virtual('isReply').get(function() {
  return this.parentId !== null;
});

// Static method to get comments for a content
CommentSchema.statics.getContentComments = function(contentId) {
  return this.find({ 
    contentId,
    parentId: null,
    isHidden: false
  })
  .sort({ createdAt: -1 });
};

// Static method to get replies for a comment
CommentSchema.statics.getCommentReplies = function(commentId) {
  return this.find({ 
    parentId: commentId,
    isHidden: false
  })
  .sort({ createdAt: 1 });
};

// Method to like a comment
CommentSchema.methods.like = function(userAddress) {
  const address = userAddress.toLowerCase();
  if (!this.likedBy.includes(address)) {
    this.likedBy.push(address);
    this.likes = this.likedBy.length;
  }
  return this.save();
};

// Method to unlike a comment
CommentSchema.methods.unlike = function(userAddress) {
  const address = userAddress.toLowerCase();
  this.likedBy = this.likedBy.filter(addr => addr !== address);
  this.likes = this.likedBy.length;
  return this.save();
};

// Method to edit a comment
CommentSchema.methods.edit = function(newText) {
  this.text = newText;
  this.isEdited = true;
  return this.save();
};

// Method to hide/moderate a comment
CommentSchema.methods.hide = function(reason) {
  this.isHidden = true;
  this.hiddenReason = reason;
  return this.save();
};

module.exports = mongoose.models.Comment || mongoose.model('Comment', CommentSchema); 