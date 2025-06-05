/**
 * @fileoverview Authentication middleware for protecting routes
 */

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppSettings = require("../models/appSettingsModel");
const tokenCrypto = require("../utils/tokenCrypto");
const userRepository = require("../repositories/userRepository");

/**
 * Middleware to protect routes - verifies the JWT token and adds the user to the request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.protect = async (req, res, next) => {
  
  try {
    let token;
    
    // Get token from Authorization cookie
    if (req.cookies && req.cookies.authorization) {
      try {
        // Decrypt the token
        token = tokenCrypto.decryptToken(req.cookies.authorization);
      } catch (error) {
        return res.redirect('/auth/login');
      }
    } else {
      return res.redirect('/auth/login');
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      return res.redirect('/auth/login');
    }

    // Check if user still exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return res.redirect('/auth/login');
    }

    // Check if user is blocked
    if (currentUser.isBlocked) {
      return res.status(401).json({success: false, message: "You account is blocked because of suspicious activity. Please contact support."});
    }

    // Check if user has verified email
    if (!currentUser.isEmailVerified) {
      return res.redirect('/auth/login');
    }

    // Grant access to protected route
    req.user = currentUser;
    
     // Make user available to all templates
     res.locals.user = currentUser;

     try {
         const settings = await AppSettings.find();        
         res.locals.appSettings = settings;
       } catch (err) {
         console.error('Failed to load app settings:', err);
         res.locals.appSettings = {}; // fallback
       }
    
    next();
  } catch (error) {
    res.locals.user = null;    
    return res.redirect('/auth/login');
  }
};


/**
 * Middleware to restrict access to certain roles
 * @param  {...string} roles - Roles that are allowed to access the route
 * @returns {Function} Express middleware
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.redirect('/auth/login');
    }
    next();
  };
};
