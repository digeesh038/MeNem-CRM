import mongoose from 'mongoose';

// Connect to MongoDB Atlas using the URI from .env
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // give up after 5s if cluster doesn't respond
    });
    console.log(` MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // If DB fails, the app can't work — kill the server
    console.error(` MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
