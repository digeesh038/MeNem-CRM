import mongoose from 'mongoose';

// On serverless (Vercel), each request may invoke a fresh function.
// We cache the connection globally so we don't reconnect on every request.
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Connect to MongoDB Atlas using the URI from .env.
// Returns the cached connection if one already exists.
const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // give up after 5s if cluster doesn't respond
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log(` MongoDB connected: ${cached.conn.connection.host}`);
  } catch (err) {
    cached.promise = null; // reset so the next request can retry
    console.error(` MongoDB connection failed: ${err.message}`);
    throw err;
  }

  return cached.conn;
};

export default connectDB;
