const mongoose = require('mongoose');

const shopSchema = mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      unique: true,
    },
    shopOwner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Link to the User who owns this shop
    },
  },
  {
    timestamps: true,
  }
);

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;