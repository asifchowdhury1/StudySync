/**
 * StudyTracker Backend Server
 * Main Express server implementing RESTful API for study session tracking
 * Includes user authentication, session management, and analytics endpoints
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import mock routes (no database)
const mockRoutes = require('./routes/mock');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('StudyTracker API Server - Mock Mode (No Database)');

// API Routes - Mock endpoints
app.use('/api', mockRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'StudyTracker API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`StudyTracker API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});