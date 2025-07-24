const mongoose = require('mongoose');

// NEW: Schema for individual product reviews
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true }, // Reviewer's name
    rating: { type: Number, required: true }, // Rating out of 5
    comment: { type: String, required: true }, // Review comment
    user: { // User who submitted the review
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt for the review itself
  }
);

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Electronics',
        'Home & Kitchen',
        'Dresses',
        'Books',
        'Other',
      ],
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function(v) {
          return v <= this.mrp;
        },
        message: (props) => `${props.value} must be less than or equal to MRP!`,
      },
    },
    minNegotiablePrice: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function(v) {
          return v <= this.sellingPrice;
        },
        message: (props) => `${props.value} must be less than or equal to the selling price!`,
      },
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Shop',
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    // NEW: Fields for product reviews and overall rating
    reviews: [reviewSchema], // Array of review documents
    rating: { // Average rating of the product
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: { // Total number of reviews
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;