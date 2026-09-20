const mongoose = require('mongoose');
const dns = require('dns');

// Configure custom reliable DNS servers (Google / Cloudflare) to ensure MongoDB Atlas SRV resolution works on all networks/OS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS setting is restricted
}

const validateEnv = () => {
  const requiredEnvVars = ['PORT', 'MONGO_URI', 'JWT_SECRET', 'CLIENT_URL', 'NODE_ENV'];
  const missingVars = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not configured. Please check the server .env file.');
  }

  if (missingVars.length > 0) {
    console.error(`[Configuration Error] Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
};

const connectDB = async () => {
  validateEnv();

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    return conn;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
