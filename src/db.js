const mongoose = require('mongoose');

async function connectDB() {
  // Use env var in all environments; fall back to local only for development
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tghe';
  console.log('connectDB called, URI prefix:', uri.slice(0, 40));

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

module.exports = { connectDB };
