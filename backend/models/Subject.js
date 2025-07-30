/**
 * Subject Model - Mongoose Schema
 * Represents academic subjects that users can track study time for
 * Includes subject metadata and goals
 */

const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  // Basic subject information
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Visual identification
  color: {
    type: String,
    default: '#3B82F6', // Default blue color
    match: /^#[0-9A-F]{6}$/i // Hex color validation
  },
  
  // User association
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Study goals for this subject
  weeklyGoal: {
    type: Number,
    default: 300, // 5 hours in minutes
    min: 0
  },
  
  // Statistics (computed from sessions)
  totalStudyTime: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalSessions: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Optional description
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
SubjectSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Index for efficient queries
SubjectSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Subject', SubjectSchema);