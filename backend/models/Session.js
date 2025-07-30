/**
 * Session Model - Mongoose Schema
 * Represents individual study sessions with timing and metadata
 * Core data model for analytics and visualization
 */

const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  // User and subject associations
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  
  // Session timing
  startTime: {
    type: Date,
    required: true
  },
  
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(endTime) {
        return endTime > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  
  // Duration in minutes (computed field)
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Session metadata
  studyMethod: {
    type: String,
    enum: ['reading', 'practice_problems', 'notes', 'video', 'discussion', 'research', 'review', 'other'],
    default: 'other'
  },
  
  location: {
    type: String,
    enum: ['library', 'home', 'cafe', 'classroom', 'outdoor', 'other'],
    default: 'other'
  },
  
  // User feedback
  focusRating: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  difficultyRating: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Optional notes
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Break information
  totalBreakTime: {
    type: Number,
    default: 0,
    min: 0
  },
  
  breakCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compute duration before saving
SessionSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // Convert to minutes
  }
  next();
});

// Indexes for efficient analytics queries
SessionSchema.index({ userId: 1, startTime: -1 });
SessionSchema.index({ subjectId: 1, startTime: -1 });
SessionSchema.index({ userId: 1, subjectId: 1, startTime: -1 });

// Virtual for formatted duration
SessionSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Ensure virtual fields are included in JSON
SessionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Session', SessionSchema);