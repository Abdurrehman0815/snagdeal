const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures email is unique
    },
    password: {
      type: String,
      required: true,
    },
    // Role differentiation: 'user' for consumers, 'shopOwner' for shop owners
    role: {
      type: String,
      enum: ['user', 'shopOwner'], // Restrict possible values
      default: 'user', // Default role for a new user
    },
    // Additional fields specific to users (consumers) can be added here
    // e.g., shippingAddress: { type: String }, phoneNumber: { type: String }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Pre-save hook to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next(); // Only hash if the password field is new or modified
  }

  const salt = await bcrypt.genSalt(10); // Generate a salt
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;