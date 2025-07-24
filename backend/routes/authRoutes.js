const express = require('express');
const {
  registerUser,
  registerShopOwner,
  loginUser,
  getUserProfile,
  updateUserProfile // Import new controller
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register/user', registerUser);
router.post('/register/shop-owner', registerShopOwner);
router.post('/login', loginUser);

// Private routes (requires token)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile); // NEW: Update user profile

module.exports = router;