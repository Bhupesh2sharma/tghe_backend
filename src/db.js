const mongoose = require('mongoose');

// Reuse a cached connection in serverless environments (like Vercel)
let cached = global.__tghe_mongoose;
if (!cached) {
  cached = global.__tghe_mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tghe';
  console.log('connectDB called, URI prefix:', uri.slice(0, 40));

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri)
      .then((mongooseInstance) => {
        console.log('MongoDB connected');
        return mongooseInstance;
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };
