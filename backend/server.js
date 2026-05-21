import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import customerRoutes from './routes/customerRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Load variables from the .env file (MONGO_URI, PORT, etc.)
dotenv.config();

const app = express();

// Allow the frontend to call this API. '*' is fine while developing.
// Once deployed, you can lock this down to your specific frontend URL.
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse incoming JSON bodies (limit raised to 10mb in case of large payloads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB on each request (cached after the first one).
// Done as middleware instead of at startup so serverless functions don't crash on cold starts.
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Simple health check — frontend uses this to verify the API is up
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'CRM API is running', timestamp: new Date().toISOString() });
});

// All customer routes live under /api/customers
app.use('/api/customers', customerRoutes);

// Fallback for any URL that didn't match a route above
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler must be registered LAST so it catches everything
app.use(errorHandler);

// Only start a long-running listener when NOT on Vercel.
// On Vercel, the platform imports `app` as a serverless function instead.
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n Server running on http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

// Export for Vercel serverless deployment
export default app;
