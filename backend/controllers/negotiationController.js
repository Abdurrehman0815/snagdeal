const asyncHandler = require('express-async-handler');
const Negotiation = require('../models/Negotiation');
const Product = require('../models/Product');
const User = require('../models/User'); // For user details in notifications
const { getIo } = require('../utils/socket'); // Socket.IO instance

const MAX_NEGOTIATION_ATTEMPTS = 3; // Define the maximum attempts allowed for the user per product

// @desc    Request a price negotiation for a product (User)
// @route   POST /api/negotiations/request
// @access  Private (User)
const requestNegotiation = asyncHandler(async (req, res) => {
  const { productId, proposedPrice } = req.body;
  const userId = req.user._id; // User is available from protectUser middleware

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if a negotiation for this product by this user is already pending
  // (This prevents multiple simultaneous attempts which should be handled by UI,
  // but good to have server-side check too)
  let existingPendingNegotiation = await Negotiation.findOne({
    product: productId,
    user: userId,
    status: 'pending'
  });

  if (existingPendingNegotiation) {
    res.status(400);
    throw new Error('You already have a pending negotiation for this product. Please wait for the outcome.');
  }

  // Count past accepted/rejected negotiations for this user and product
  const pastNegotiationsCount = await Negotiation.countDocuments({
    product: productId,
    user: userId,
    status: { $in: ['accepted', 'rejected'] }
  });

  if (pastNegotiationsCount >= MAX_NEGOTIATION_ATTEMPTS) {
    res.status(400);
    throw new Error(`You have exhausted your ${MAX_NEGOTIATION_ATTEMPTS} negotiation attempts for this product.`);
  }

  // --- AUTOMATED NEGOTIATION LOGIC ---
  let negotiationStatus;
  let responseMessage;
  let currentAttemptsLeft;

  if (parseFloat(proposedPrice) >= product.minNegotiablePrice) {
    negotiationStatus = 'accepted';
    responseMessage = `Your negotiation for ${product.name} at $${proposedPrice} was ACCEPTED!`;
    currentAttemptsLeft = MAX_NEGOTIATION_ATTEMPTS - pastNegotiationsCount; // Attempts don't decrement on acceptance
  } else {
    negotiationStatus = 'rejected';
    currentAttemptsLeft = MAX_NEGOTIATION_ATTEMPTS - (pastNegotiationsCount + 1); // Decrement on rejection
    responseMessage = `Your negotiation for ${product.name} at $${proposedPrice} was REJECTED. Proposed price is too low. You have ${Math.max(0, currentAttemptsLeft)} attempts left.`;
  }

  // Create new negotiation record with immediate status
  const negotiation = await Negotiation.create({
    product: productId,
    user: userId,
    shopOwner: product.shop, // Link to the Shop's ObjectId
    proposedPrice: parseFloat(proposedPrice),
    status: negotiationStatus, // Set status immediately
    attemptsLeft: currentAttemptsLeft, // Set remaining attempts
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
  });

  // Populate user and product info for notifications
  const populatedNegotiation = await Negotiation.findById(negotiation._id)
    .populate('user', 'name')
    .populate('product', 'name');

  const io = getIo(); // Get the initialized Socket.IO instance

  // Emit real-time notification to the USER
  io.to(userId.toString()).emit('negotiationOutcome', { // Renamed event to 'negotiationOutcome'
    negotiationId: populatedNegotiation._id,
    productId: populatedNegotiation.product._id,
    status: negotiationStatus,
    acceptedPrice: negotiationStatus === 'accepted' ? populatedNegotiation.proposedPrice : null,
    message: responseMessage,
    attemptsLeft: currentAttemptsLeft,
  });

  // Emit real-time notification to the SHOP OWNER (for their info, no action needed)
  io.to(product.shop.toString()).emit('negotiationInfo', { // Renamed event to 'negotiationInfo'
    negotiationId: populatedNegotiation._id,
    productId: populatedNegotiation.product._id,
    productName: populatedNegotiation.product.name,
    proposedPrice: populatedNegotiation.proposedPrice,
    userName: populatedNegotiation.user.name,
    userId: populatedNegotiation.user._id,
    status: negotiationStatus,
    message: `User ${populatedNegotiation.user.name} proposed $${populatedNegotiation.proposedPrice} for ${populatedNegotiation.product.name}. Status: ${negotiationStatus}.`
  });

  res.status(201).json({
    message: responseMessage, // Send the outcome message to the user's frontend
    negotiation: populatedNegotiation,
    attemptsLeft: currentAttemptsLeft,
  });
});

// @desc    Get user's negotiation history for a specific product
// @route   GET /api/negotiations/product/:productId/user
// @access  Private (User)
const getUserNegotiationsForProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  const negotiations = await Negotiation.find({
    product: productId,
    user: userId,
  }).sort({ createdAt: -1 }); // Get latest first

  res.status(200).json(negotiations);
});

// @desc    Get shop owner's negotiation history (all requests, not just pending)
// @route   GET /api/negotiations/shop/history
// @access  Private (Shop Owner)
const getShopNegotiationHistory = asyncHandler(async (req, res) => {
  const shopOwnerShopId = req.shop._id;

  const negotiations = await Negotiation.find({
    shopOwner: shopOwnerShopId,
  }).populate('product', 'name sellingPrice minNegotiablePrice')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json(negotiations);
});


module.exports = {
  requestNegotiation,
  getUserNegotiationsForProduct,
  getShopNegotiationHistory,
  MAX_NEGOTIATION_ATTEMPTS,
};