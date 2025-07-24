const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Shop = require('../models/Shop'); // We will use this to verify shop owner access

// Protects routes for authenticated users (consumers or shop owners)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for 'Bearer' token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by ID from the token payload and attach to request object
      req.user = await User.findById(decoded.id).select('-password'); // Exclude password
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Specific middleware to protect user (consumer) routes
const protectUser = asyncHandler(async (req, res, next) => {
  await protect(req, res, async () => { // First, ensure general protection
    if (req.user && req.user.role === 'user') {
      next();
    } else {
      res.status(403); // Forbidden
      throw new Error('Not authorized as a user');
    }
  });
});

// Specific middleware to protect shop owner routes
const protectShop = asyncHandler(async (req, res, next) => {
  await protect(req, res, async () => { // First, ensure general protection
    if (req.user && req.user.role === 'shopOwner') {
      // Additionally, ensure this shop owner is linked to a shop for shop-specific actions
      const shop = await Shop.findOne({ shopOwner: req.user._id });
      if (!shop) {
          res.status(403);
          throw new Error('Not authorized, no associated shop found for this owner.');
      }
      req.shop = shop; // Attach the shop document to the request
      next();
    } else {
      res.status(403); // Forbidden
      throw new Error('Not authorized as a shop owner');
    }
  });
});

module.exports = { protect, protectUser, protectShop };