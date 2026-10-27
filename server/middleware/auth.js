const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      message: 'Access denied. No authorization token provided.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'flexi_movie_hub_super_secret_jwt_key_ca3_2024'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired authentication token. Please log in again.'
    });
  }
};

// Middleware to authorize admin role
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      message: 'Forbidden. Admin privileges are required to perform this action.'
    });
  }
};

module.exports = { protect, adminOnly };

