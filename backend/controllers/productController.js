const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

// @desc    Get all products with search, filter, sort, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const category = req.query.category && req.query.category !== 'All'
    ? { category: req.query.category }
    : {};

  const query = { ...keyword, ...category };

  const count = await Product.countDocuments(query);

  let sortOptions = {};
  if (req.query.sortBy) {
    switch (req.query.sortBy) {
      case 'price_asc':
        sortOptions = { sellingPrice: 1 };
        break;
      case 'price_desc':
        sortOptions = { sellingPrice: -1 };
        break;
      case 'name_asc':
        sortOptions = { name: 1 };
        break;
      case 'name_desc':
        sortOptions = { name: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }
  } else {
    sortOptions = { createdAt: -1 };
  }

  const products = await Product.find(query)
    .populate('shop', 'shopName')
    .sort(sortOptions)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    totalProducts: count,
  });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
                                .populate('shop', 'shopName');
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get products by a specific shop owner
// @route   GET /api/products/shop/:shopId
// @access  Public (or Private depending on design)
const getProductsByShop = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const products = await Product.find({ shop: shopId }).populate('shop', 'shopName');
  res.json(products);
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Shop Owner)
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, image, category, mrp, sellingPrice, minNegotiablePrice, countInStock } = req.body;

  const shopId = req.shop._id;

  if (!name || !description || !image || !category || mrp === undefined || sellingPrice === undefined || minNegotiablePrice === undefined || countInStock === undefined) {
    res.status(400);
    throw new Error('Please fill all required product fields');
  }

  const product = new Product({
    name,
    description,
    image,
    category,
    mrp,
    sellingPrice,
    minNegotiablePrice,
    countInStock,
    shop: shopId,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private (Shop Owner)
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, image, category, mrp, sellingPrice, minNegotiablePrice, countInStock } = req.body;
  const productId = req.params.id;
  const shopId = req.shop._id;

  const product = await Product.findById(productId);

  if (product) {
    if (product.shop.toString() !== shopId.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this product');
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.image = image || product.image;
    product.category = category || product.category;
    product.mrp = mrp !== undefined ? mrp : product.mrp;
    product.sellingPrice = sellingPrice !== undefined ? sellingPrice : product.sellingPrice;
    product.minNegotiablePrice = minNegotiablePrice !== undefined ? minNegotiablePrice : product.minNegotiablePrice;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Shop Owner)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  const shopId = req.shop._id;

  if (product) {
    if (product.shop.toString() !== shopId.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this product');
    }

    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review for a product
// @route   POST /api/products/:id/reviews
// @access  Private (User)
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    // Check if the user has already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed by this user.');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review); // Add new review to array
    product.numReviews = product.reviews.length; // Update total review count

    // Calculate new average rating
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added successfully!' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

module.exports = {
  getProducts,
  getProductById,
  getProductsByShop,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview, // Export the new function
};