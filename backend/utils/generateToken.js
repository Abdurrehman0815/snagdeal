const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Sign the token with the user's ID and the JWT secret from environment variables
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

module.exports = generateToken;