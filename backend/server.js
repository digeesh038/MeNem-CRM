import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import customerRoutes from './routes/customerRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Load variables from the .env file (MONGO_URI, PORT, etc.)
dotenv.config();

// Connect to MongoDB before handling any requests
connectDB();

const app = express();

// Allow the frontend (Vite dev server on 5173, CRA on 3000) to call this API
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse incoming JSON bodies (limit raised to 10mb in case of large payloads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n Server running on http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
