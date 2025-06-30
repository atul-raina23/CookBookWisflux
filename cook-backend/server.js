const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipe');
const favoriteRoutes = require('./routes/favorite');
const forkifyRoutes = require('./routes/forkify');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/recipe', recipeRoutes);
app.use('/api/favorite', favoriteRoutes);
app.use('/api/forkify', forkifyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'CookBook API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`CookBook API is running on: http://localhost:${PORT}`);
  console.log(` API Documentation: http://localhost:${PORT}/api`);
});

module.exports = app; 