const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true }, // The price at which the item was purchased (could be selling or negotiated)
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product', // Link to the Product model
    },
    shop: { // Denormalize the shop to quickly find items by shop
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Shop',
    }
});

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // Link to the User (consumer) who placed the order
        },
        orderItems: [orderItemSchema], // Array of items in this order
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: true,
            default: 'Stripe', // Or 'Google Pay', 'COD', etc.
        },
        paymentResult: { // Details from payment gateway (e.g., Stripe ID, status)
            id: { type: String },
            status: { type: String },
            update_time: { type: String },
            email_address: { type: String },
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;