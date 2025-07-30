/**
 * Session Routes
 * Handles CRUD operations for study sessions
 * Core functionality for time tracking and analytics
 */

const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Session = require('../models/Session');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/sessions
// @desc    Create a new study session
// @access  Private
router.post('/', auth, [
  body('subjectId').isMongoId().withMessage('Invalid subject ID'),
  body('startTime').isISO8601().withMessage('Invalid start time format'),
  body('endTime').isISO8601().withMessage('Invalid end time format'),
  body('studyMethod').optional().isIn(['reading', 'practice_problems', 'notes', 'video', 'discussion', 'research', 'review', 'other']),
  body('location').optional().isIn(['library', 'home', 'cafe', 'classroom', 'outdoor', 'other']),
  body('focusRating').optional().isInt({ min: 1, max: 10 }),
  body('difficultyRating').optional().isInt({ min: 1, max: 10 }),
  body('notes').optional().isLength({ max: 1000 }),
  body('totalBreakTime').optional().isInt({ min: 0 }),
  body('breakCount').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subjectId, startTime, endTime, ...sessionData } = req.body;

    // Verify subject exists and belongs to user
    const subject = await Subject.findOne({ _id: subjectId, userId: req.userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Validate time range
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Create session
    const session = new Session({
      userId: req.userId,
      subjectId,
      startTime: start,
      endTime: end,
      ...sessionData
    });

    await session.save();

    // Update subject statistics
    subject.totalStudyTime += session.duration;
    subject.totalSessions += 1;
    await subject.save();

    await session.populate('subjectId', 'name color');

    res.status(201).json({
      message: 'Session created successfully',
      session
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Server error creating session' });
  }
});

// @route   GET /api/sessions
// @desc    Get user's study sessions with filtering and pagination
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('subjectId').optional().isMongoId(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('studyMethod').optional().isIn(['reading', 'practice_problems', 'notes', 'video', 'discussion', 'research', 'review', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { userId: req.userId };
    
    if (req.query.subjectId) {
      filter.subjectId = req.query.subjectId;
    }
    
    if (req.query.startDate || req.query.endDate) {
      filter.startTime = {};
      if (req.query.startDate) {
        filter.startTime.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.startTime.$lte = new Date(req.query.endDate);
      }
    }
    
    if (req.query.studyMethod) {
      filter.studyMethod = req.query.studyMethod;
    }

    // Get sessions with pagination
    const sessions = await Session.find(filter)
      .populate('subjectId', 'name color')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Session.countDocuments(filter);

    res.json({
      sessions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSessions: total,
        hasNext: skip + sessions.length < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error retrieving sessions' });
  }
});

// @route   GET /api/sessions/:id
// @desc    Get a specific session
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    }).populate('subjectId', 'name color description');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Server error retrieving session' });
  }
});

// @route   PUT /api/sessions/:id
// @desc    Update a study session
// @access  Private
router.put('/:id', auth, [
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('studyMethod').optional().isIn(['reading', 'practice_problems', 'notes', 'video', 'discussion', 'research', 'review', 'other']),
  body('location').optional().isIn(['library', 'home', 'cafe', 'classroom', 'outdoor', 'other']),
  body('focusRating').optional().isInt({ min: 1, max: 10 }),
  body('difficultyRating').optional().isInt({ min: 1, max: 10 }),
  body('notes').optional().isLength({ max: 1000 }),
  body('totalBreakTime').optional().isInt({ min: 0 }),
  body('breakCount').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const session = await Session.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Store old duration for subject stats update
    const oldDuration = session.duration;

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        session[key] = req.body[key];
      }
    });

    // Validate time range if times were updated
    if (session.startTime && session.endTime && session.endTime <= session.startTime) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    await session.save();

    // Update subject statistics if duration changed
    if (session.duration !== oldDuration) {
      const subject = await Subject.findById(session.subjectId);
      if (subject) {
        subject.totalStudyTime = subject.totalStudyTime - oldDuration + session.duration;
        await subject.save();
      }
    }

    await session.populate('subjectId', 'name color');

    res.json({
      message: 'Session updated successfully',
      session
    });

  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: 'Server error updating session' });
  }
});

// @route   DELETE /api/sessions/:id
// @desc    Delete a study session
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Update subject statistics
    const subject = await Subject.findById(session.subjectId);
    if (subject) {
      subject.totalStudyTime = Math.max(0, subject.totalStudyTime - session.duration);
      subject.totalSessions = Math.max(0, subject.totalSessions - 1);
      await subject.save();
    }

    await Session.findByIdAndDelete(req.params.id);

    res.json({ message: 'Session deleted successfully' });

  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ message: 'Server error deleting session' });
  }
});

// @route   GET /api/sessions/summary/today
// @desc    Get today's study summary
// @access  Private
router.get('/summary/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await Session.find({
      userId: req.userId,
      startTime: { $gte: today, $lt: tomorrow }
    }).populate('subjectId', 'name color');

    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalSessions = sessions.length;
    
    const subjectBreakdown = sessions.reduce((acc, session) => {
      const subjectName = session.subjectId.name;
      if (!acc[subjectName]) {
        acc[subjectName] = {
          time: 0,
          sessions: 0,
          color: session.subjectId.color
        };
      }
      acc[subjectName].time += session.duration;
      acc[subjectName].sessions += 1;
      return acc;
    }, {});

    res.json({
      date: today.toISOString().split('T')[0],
      totalTime,
      totalSessions,
      subjectBreakdown,
      sessions: sessions.map(s => ({
        id: s._id,
        subject: s.subjectId.name,
        duration: s.duration,
        formattedDuration: s.formattedDuration,
        startTime: s.startTime,
        endTime: s.endTime
      }))
    });

  } catch (error) {
    console.error('Get today summary error:', error);
    res.status(500).json({ message: 'Server error retrieving today\'s summary' });
  }
});

module.exports = router;