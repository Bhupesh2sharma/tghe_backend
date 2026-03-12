const mongoose = require('mongoose');

async function connectDB() {
  // Direct MongoDB Atlas URI (from .env). For production, prefer using environment variables.
  const uri = 'mongodb+srv://tghe_db_user:YOPbl9Gr4qoFKciu@waglogy.szgvjai.mongodb.net/wgl_tghe_db?appName=waglogy';

  try {
    console.log('Connecting to MongoDB with URI prefix:', uri.slice(0, 40));
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

module.exports = { connectDB };
