require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Database initialization
require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limit for order creation (prevent spam orders)
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 order requests per minute per IP
  message: {
    success: false,
    message: 'Order rate limit reached. Please wait a moment before trying again.'
  }
});

app.use('/api/', apiLimiter);
app.use('/api/orders', orderLimiter);

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/settings', require('./routes/settings'));

// Friendly HTML Routes
const serveIndex = (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
};

const serveAdmin = (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
};

app.get(['/menu', '/cart', '/checkout', '/track-order', '/offers', '/about', '/contact', '/privacy', '/terms'], serveIndex);
app.get(['/admin', '/admin/login'], serveAdmin);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🍕 Pizza Hub Server running successfully!`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
  console.log(`⚙️ Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===================================================`);
});

module.exports = app;
