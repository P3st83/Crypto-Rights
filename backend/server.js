const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dbConnect = require('./utils/dbConnect');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB - commented out until we have a real URI
// if (process.env.MONGODB_URI) {
//   dbConnect()
//     .then(() => console.log('MongoDB connected'))
//     .catch(err => console.error('MongoDB connection error:', err));
// } else {
//   console.log('MongoDB URI not provided, running with mock data');
// }

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'CryptoRights API is running',
    database: process.env.MONGODB_URI ? 'connected' : 'mock-mode'
  });
});

// Import route files
const contentRoutes = require('./routes/content');
const userRoutes = require('./routes/users');
const ipfsRoutes = require('./routes/ipfs');

// Use routes
app.use('/api/content', contentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ipfs', ipfsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Something went wrong on the server',
  });
});

// Not found middleware
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 