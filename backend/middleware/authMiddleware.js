import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Check if JWT_SECRET is set
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in .env file');
        return res.status(500).json({ message: 'Server configuration error' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      // Handle different JWT errors
      if (error.name === 'JsonWebTokenError') {
        // Invalid token signature or malformed token
        return res.status(401).json({ 
          message: 'Invalid token. Please login again.',
          error: 'INVALID_TOKEN'
        });
      } else if (error.name === 'TokenExpiredError') {
        // Token expired
        return res.status(401).json({ 
          message: 'Token expired. Please login again.',
          error: 'TOKEN_EXPIRED'
        });
      } else {
        // Other errors
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({ 
          message: 'Not authorized, token failed',
          error: 'AUTH_FAILED'
        });
      }
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin only
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

