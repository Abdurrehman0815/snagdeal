const mongoose = require('mongoose');

const negotiationSchema = mongoose.Schema(
  {
    product: { // The product being negotiated
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    user: { // The user (consumer) making the negotiation request
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    shopOwner: { // The shop owner who owns the product (denormalized for convenience)
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Shop', // Refers to the Shop model, not User model (though linked via User)
    },
    proposedPrice: { // The price proposed by the user
      type: Number,
      required: true,
      min: 0,
    },
    status: { // Current status of the negotiation
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'], // Possible states
      default: 'pending',
    },
    // NEW: This field will track attempts left for the user *for this specific product*
    // It should be decremented on each *rejected* negotiation attempt.
    // On the frontend, we'll maintain a client-side counter for active attempts (max 3).
    attemptsLeft: {
      type: Number,
      required: true,
      default: 3, // Initial number of attempts allowed for a user per product
      min: 0,
    },
    // Optional: expiry for pending negotiations (e.g., if shop owner doesn't respond)
    expiresAt: {
      type: Date,
      // index: { expires: '1d' } // Mongoose TTL index to automatically delete documents after a period
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index to ensure unique pending negotiation per product-user combination
// This prevents a user from having multiple *active* (pending) negotiations for the same product.
negotiationSchema.index(
    { product: 1, user: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } }
);

const Negotiation = mongoose.model('Negotiation', negotiationSchema);

module.exports = Negotiation;