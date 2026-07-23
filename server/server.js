require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { startInventoryCheckJob } = require('./jobs/inventoryCheck');
const { initTransporter } = require('./utils/emailService');

// Route imports
const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/adminAuth');
const inventoryRoutes = require('./routes/inventory');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Middleware ---------------
const normalizeOrigin = (value) => (value || '').trim().replace(/\/+$/, '');

const frontendUrl = normalizeOrigin(process.env.FRONTEND_URL);
const allowedOrigins = new Set(
  [
    frontendUrl,
    'https://pizzabyte-pizza-delivery-platform.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean)
);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server calls)
    if (!origin) return callback(null, true);

    const cleanOrigin = normalizeOrigin(origin);

    if (
      allowedOrigins.has(cleanOrigin) ||
      cleanOrigin.startsWith('http://localhost') ||
      cleanOrigin.startsWith('http://127.0.0.1')
    ) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for zero cold-start warmup
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend service is active',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    message: '🍕 Pizza Delivery API is running!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      admin: '/api/admin',
      inventory: '/api/inventory',
      orders: '/api/orders',
      payment: '/api/payment',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// --------------- Error Handler ---------------
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// --------------- Start Server ---------------
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize email transporter
    await initTransporter();

    // Start cron jobs
    startInventoryCheckJob();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 API Docs: http://localhost:${PORT}/`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
