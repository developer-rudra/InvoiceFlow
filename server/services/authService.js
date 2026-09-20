const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * Register a new user
 */
const registerUser = async ({ name, email, password, companyName, companyAddress, companyPhone }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('User already exists with this email address');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    companyName: companyName || '',
    companyAddress: companyAddress || '',
    companyPhone: companyPhone || ''
  });

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      companyName: user.companyName,
      companyAddress: user.companyAddress,
      companyPhone: user.companyPhone,
      createdAt: user.createdAt
    }
  };
};

/**
 * Login existing user
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    const error = new Error('Invalid email or password credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      companyName: user.companyName,
      companyAddress: user.companyAddress,
      companyPhone: user.companyPhone,
      createdAt: user.createdAt
    }
  };
};

/**
 * Get current user profile
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    companyName: user.companyName,
    companyAddress: user.companyAddress,
    companyPhone: user.companyPhone,
    createdAt: user.createdAt
  };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
