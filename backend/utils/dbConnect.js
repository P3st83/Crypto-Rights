const mongoose = require('mongoose');

// Cache the database connection
let cachedConnection = null;

/**
 * Connect to MongoDB
 */
async function dbConnect() {
  // If already connected, return the existing connection
  if (cachedConnection) {
    return cachedConnection;
  }

  // Check if MONGODB_URI is defined
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
  }

  // Set mongoose options
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    // Connect to MongoDB
    const connection = await mongoose.connect(process.env.MONGODB_URI, options);
    
    // Cache the connection
    cachedConnection = connection;
    
    console.log('MongoDB connected successfully');
    
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Handle connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Log when disconnected
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  cachedConnection = null;
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB disconnected due to app termination');
  process.exit(0);
});

module.exports = dbConnect; 