/**
 * User Model - Mongoose Schema
 * Represents users in the StudyTracker application
 * Includes authentication fields and user preferences
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Authentication fields
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Profile information
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Study goals and preferences
  goals: {
    dailyStudyTime: {
      type: Number,
      default: 240 // 4 hours in minutes
    },
    weeklyStudyTime: {
      type: Number,
      default: 1680 // 28 hours in minutes
    }
  },
  
  // User preferences
  preferences: {
    defaultBreakLength: {
      type: Number,
      default: 15 // minutes
    },
    notifications: {
      type: Boolean,
      default: true
    },
    timezone: {
      type: String,
      default: 'America/New_York'
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', UserSchema);