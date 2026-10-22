const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const { connectDB } = require('./config/db');
const { seedIfEmpty } = require('./services/seedService');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const productRoutes = require('./routes/productRoutes');
const metaRoutes = require('./routes/metaRoutes');
const couponRoutes = require('./routes/couponRoutes');
const orderRoutes = require('./routes/orderRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');

const app = express();

// Render and Netlify sit in front of the API: trust the first proxy for the client IP
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Middleware
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    methods: ['GET', 'POST'],
  }),
);
app.use(express.json({ limit: '50kb' }));

// Test Route
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'StepUp BD API is running' });
});

app.get('/api/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'ok' : 'degraded', db: dbUp });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Errors
app.use('/api', notFound);
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;

// Start Server (after the database is ready and seeded)
const start = async () => {
  await connectDB();
  await seedIfEmpty();
  app.listen(PORT, () => {
    console.log(`🚀 StepUp BD API running on http://localhost:${PORT}`);
  });
};

start();
