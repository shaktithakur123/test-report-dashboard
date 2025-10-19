const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const apiRoutes = require('./routes/api');
const FileSystemService = require('./services/fileSystem');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize fabricated file system
const fileSystemService = new FileSystemService();

// Make fileSystemService available to routes
app.locals.fileSystemService = fileSystemService;

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'test-report-dashboard-backend'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Test Report Dashboard Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      list: '/api/list?path={directory_path}',
      file: '/api/file?path={file_path}',
      download: '/api/download?path={item_path}'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Initialize server
async function startServer() {
  try {
    console.log('Initializing Test Report Dashboard Backend...');
    
    // Initialize fabricated file system
    await fileSystemService.initialize();
    console.log('File system initialized successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API endpoints: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;