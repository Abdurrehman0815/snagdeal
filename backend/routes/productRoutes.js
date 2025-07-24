const express = require('express');
const {
  getProducts,
  getProductById,
  getProductsByShop,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview, // Import new controller
} = require('../controllers/productController');
const { protectUser, protectShop } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes (for all users/guests to browse)
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/shop/:shopId', getProductsByShop);

// Private routes (for shop owners)
router.post('/', protectShop, createProduct);
router.put('/:id', protectShop, updateProduct);
router.delete('/:id', protectShop, deleteProduct);

// NEW: Private route for users to create reviews
router.post('/:id/reviews', protectUser, createProductReview);

module.exports = router;