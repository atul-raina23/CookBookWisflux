const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'atul@123');
    
    // Get user from database
    const userQuery = 'SELECT id, name, email FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [decoded.userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token - user not found'
      });
    }

    // Add user to request object
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

module.exports = { authenticateToken }; 