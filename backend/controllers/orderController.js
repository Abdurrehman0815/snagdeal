const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay'); // Import Razorpay SDK
const Order = require('../models/Order');
const Product = require('../models/Product');

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// @desc    Create new order
// @route   POST /api/orders
// @access  Private (User)
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map((x) => x.product) },
    });

    const validOrderItems = orderItems.map((itemFromFrontend) => {
      const matchingItemFromDB = itemsFromDB.find(
        (p) => p._id.toString() === itemFromFrontend.product.toString()
      );

      if (!matchingItemFromDB) {
        res.status(404);
        throw new Error(`Product not found: ${itemFromFrontend.name}`);
      }
      const itemPrice = matchingItemFromDB.sellingPrice;

      if (matchingItemFromDB.countInStock < itemFromFrontend.qty) {
        res.status(400);
        throw new Error(`Not enough stock for ${matchingItemFromDB.name}`);
      }

      return {
        name: matchingItemFromDB.name,
        qty: itemFromFrontend.qty,
        image: matchingItemFromDB.image,
        price: itemPrice,
        product: matchingItemFromDB._id,
        shop: matchingItemFromDB.shop,
      };
    });

    const order = new Order({
      user: req.user._id,
      orderItems: validOrderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: false,
      paidAt: null,
    });

    const createdOrder = await order.save();

    for (const item of validOrderItems) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { countInStock: -item.qty }
        });
    }

    res.status(201).json(createdOrder);
  }
});

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private (User)
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
                            .populate('user', 'name email')
                            .populate('orderItems.product', 'name image')
                            .sort({ createdAt: -1 });

  res.json(orders);
});

// @desc    Get all orders for a specific shop owner's products
// @route   GET /api/orders/shop/:shopId
// @access  Private (Shop Owner)
const getShopOrders = asyncHandler(async (req, res) => {
    const shopId = req.shop._id;

    const orders = await Order.aggregate([
        {
            $match: {
                "orderItems.shop": shopId
            }
        },
        {
            $unwind: "$orderItems"
        },
        {
            $match: {
                "orderItems.shop": shopId
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "orderItems.product",
                foreignField: "_id",
                as: "orderItems.productDetails"
            }
        },
        {
            $unwind: "$orderItems.productDetails"
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        {
            $unwind: "$userDetails"
        },
        {
            $group: {
                _id: "$_id",
                user: { $first: "$userDetails" },
                shippingAddress: { $first: "$shippingAddress" },
                paymentMethod: { $first: "$paymentMethod" },
                taxPrice: { $first: "$taxPrice" },
                shippingPrice: { $first: "$shippingPrice" },
                totalPrice: { $first: "$totalPrice" },
                isPaid: { $first: "$isPaid" },
                paidAt: { $first: "$paidAt" },
                isDelivered: { $first: "$isDelivered" },
                deliveredAt: { $first: "$deliveredAt" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                shopOrderItems: {
                    $push: {
                        _id: "$orderItems._id",
                        name: "$orderItems.name",
                        qty: "$orderItems.qty",
                        image: "$orderItems.image",
                        price: "$orderItems.price",
                        product: "$orderItems.product",
                        shop: "$orderItems.shop",
                        productDetails: "$orderItems.productDetails"
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                user: { _id: "$user._id", name: "$user.name", email: "$user.email" },
                shippingAddress: 1,
                paymentMethod: 1,
                taxPrice: 1,
                shippingPrice: 1,
                totalPrice: 1,
                isPaid: 1,
                paidAt: 1,
                isDelivered: 1,
                deliveredAt: 1,
                createdAt: 1,
                updatedAt: 1,
                orderItems: "$shopOrderItems"
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    res.json(orders);
});

// @desc    Update order to delivered (for a specific item within an order if partial delivery, or entire order)
// @route   PUT /api/orders/:id/deliver
// @access  Private (Shop Owner)
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    const shopId = req.shop._id;

    if (order) {
        const hasShopItems = order.orderItems.some(item => item.shop.toString() === shopId.toString());

        if (!hasShopItems) {
            res.status(401);
            throw new Error('Not authorized to update this order (does not contain your products).');
        }

        if (order.isDelivered) {
            res.status(400);
            throw new Error('Order is already delivered.');
        }

        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Create a new Razorpay order ID for payment
// @route   POST /api/orders/:id/razorpay
// @access  Private (User) - :id here is the order ID created by our system
const createRazorpayOrder = asyncHandler(async (req, res) => {
    const orderId = req.params.id; // Our system's order ID
    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Only allow user to create Razorpay order for their own order and if not already paid
    if (order.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to create payment for this order.');
    }

    if (order.isPaid) {
        res.status(400);
        throw new Error('Order is already paid.');
    }

    const options = {
        amount: Math.round(order.totalPrice * 100), // Amount in smallest currency unit (paise for INR)
        currency: "INR", // Or "USD" etc.
        receipt: order._id.toString(), // Our internal order ID as receipt
        payment_capture: 1 // Auto capture payment
    };

    try {
        const razorpayOrder = await razorpayInstance.orders.create(options);
        res.json({
            orderId: razorpayOrder.id, // Razorpay's order ID
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
            // Add any other details needed by frontend for checkout
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500);
        throw new Error('Failed to create Razorpay order.');
    }
});

// @desc    Verify Razorpay payment status (After successful payment callback from Razorpay on frontend)
// @route   POST /api/orders/:id/verify-payment
// @access  Private (User) - :id here is our system's order ID
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const orderId = req.params.id; // Our system's order ID

    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to verify payment for this order.');
    }

    if (order.isPaid) {
        res.status(400);
        throw new Error('Order is already paid.');
    }

    const crypto = require('crypto'); // Node.js built-in crypto module
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: razorpay_payment_id,
            status: 'succeeded', // Or whatever status Razorpay provides
            update_time: new Date().toISOString(),
            email_address: req.user.email, // Use user's email
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(400);
        throw new Error('Payment verification failed (Invalid signature).');
    }
});


module.exports = {
  addOrderItems,
  getMyOrders,
  getShopOrders,
  updateOrderToDelivered,
  createRazorpayOrder, // Export new Razorpay functions
  verifyRazorpayPayment, // Export new Razorpay functions
};