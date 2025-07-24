const express = require('express');
const {
  requestNegotiation,
  getUserNegotiationsForProduct,
  getShopNegotiationHistory, // New endpoint for history
} = require('../controllers/negotiationController');
const { protectUser, protectShop } = require('../middlewares/authMiddleware');

const router = express.Router();

// User (consumer) routes
router.post('/request', protectUser, requestNegotiation);
router.get('/product/:productId/user', protectUser, getUserNegotiationsForProduct); // User's history for a product

// Shop Owner routes
router.get('/shop/history', protectShop, getShopNegotiationHistory); // Shop owner's full history

module.exports = router;