const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const chatRoutes = require('./routes/chatRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

// Load environment variables
const envResult = dotenv.config();
if (envResult.error) {
  console.warn('Warning: .env file not found or could not be loaded:', envResult.error.message);
} else {
  console.log('Environment variables loaded from .env file');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint to check configuration
app.get('/api/debug/config', (req, res) => {
  res.json({
    hasN8nUrl: !!process.env.N8N_WEBHOOK_URL,
    n8nUrl: process.env.N8N_WEBHOOK_URL ? '***configured***' : 'NOT SET',
    hasDbHost: !!process.env.AIVEN_DB_HOST,
    hasDbUser: !!process.env.AIVEN_DB_USER,
    hasDbPassword: !!process.env.AIVEN_DB_PASSWORD,
    hasDbName: !!process.env.AIVEN_DB_NAME,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/chat', chatRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Log environment configuration status
    console.log('\n=== Environment Configuration ===');
    console.log(`N8N_WEBHOOK_URL: ${process.env.N8N_WEBHOOK_URL ? '✓ Set' : '✗ NOT SET'}`);
    console.log(`AIVEN_DB_HOST: ${process.env.AIVEN_DB_HOST ? '✓ Set' : '✗ NOT SET'}`);
    console.log('================================\n');

    // Connect to database (optional - server will work without it)
    try {
      await connectDB();
    } catch (error) {
      console.warn('⚠️  Continuing without database connection...');
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Debug config: http://localhost:${PORT}/api/debug/config`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

