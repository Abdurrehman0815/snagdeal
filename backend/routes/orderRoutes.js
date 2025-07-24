const express = require('express');
const { addOrderItems, getMyOrders, getShopOrders, updateOrderToDelivered, createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/orderController'); // Import new functions
const { protectUser, protectShop } = require('../middlewares/authMiddleware');

const router = express.Router();

// User routes
router.post('/', protectUser, addOrderItems);
router.get('/myorders', protectUser, getMyOrders);
router.post('/:id/razorpay', protectUser, createRazorpayOrder); // NEW: Create Razorpay order
router.post('/:id/verify-payment', protectUser, verifyRazorpayPayment); // NEW: Verify Razorpay payment

// Shop Owner routes
router.get('/shop/:shopId', protectShop, getShopOrders);
router.put('/:id/deliver', protectShop, updateOrderToDelivered);

module.exports = router;