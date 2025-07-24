const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Shop = require('../models/Shop');
const generateToken = require('../utils/generateToken');

// Helper function to structure user response
const getUserResponse = (user) => {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture, // Still include profile picture URL
        token: generateToken(user._id),
        shopId: user.shop ? user.shop._id : null,
        razorpayContactId: user.shop ? user.shop.razorpayContactId : null,
        razorpayFundAccountId: user.shop ? user.shop.razorpayFundAccountId : null
    };
};

// @desc    Register a new user (consumer)
// @route   POST /api/auth/register/user
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please enter all fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'user',
  });

  if (user) {
    res.status(201).json(getUserResponse(user));
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Register a new shop owner
// @route   POST /api/auth/register/shop-owner
// @access  Public
const registerShopOwner = asyncHandler(async (req, res) => {
  const { name, email, password, shopName } = req.body;

  if (!name || !email || !password || !shopName) {
    res.status(400);
    throw new Error('Please enter all fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const shopExists = await Shop.findOne({ shopName });
  if (shopExists) {
    res.status(400);
    throw new Error('Shop name already taken');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'shopOwner',
  });

  let shop;
  if (user) {
    shop = await Shop.create({
      shopName,
      shopOwner: user._id,
    });

    if (!shop) {
        await User.findByIdAndDelete(user._id);
        res.status(500);
        throw new Error('Shop creation failed, please try again.');
    }

    user.shop = shop;
    res.status(201).json(getUserResponse(user));
  } else {
    res.status(400);
    throw new Error('Invalid shop owner user data');
  }
});


// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (user.role === 'shopOwner') {
        const shop = await Shop.findOne({ shopOwner: user._id });
        if (shop) {
            user.shop = shop;
        }
    }
    res.json(getUserResponse(user));
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile (for logged-in user)
// @route   GET /api/auth/profile
// @access  Private (protect middleware will handle authentication)
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        if (user.role === 'shopOwner') {
            const shop = await Shop.findOne({ shopOwner: user._id });
            if (shop) {
                user.shop = shop;
            }
        }
        res.json(getUserResponse(user));
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private (User/ShopOwner)
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.profilePicture = req.body.profilePicture || user.profilePicture; // Ensure this accepts a URL string

    if (req.body.email && req.body.email !== user.email) {
        const userWithNewEmail = await User.findOne({ email: req.body.email });
        if (userWithNewEmail && userWithNewEmail._id.toString() !== user._id.toString()) {
            res.status(400);
            throw new Error('Email already taken.');
        }
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    if (updatedUser.role === 'shopOwner') {
        const shop = await Shop.findOne({ shopOwner: updatedUser._id });
        if (shop) {
            updatedUser.shop = shop;
        }
    }

    res.json(getUserResponse(updatedUser));
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  registerUser,
  registerShopOwner,
  loginUser,
  getUserProfile,
  updateUserProfile,
};