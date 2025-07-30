/**
 * Subject Routes
 * Handles CRUD operations for academic subjects
 * Manages subject creation, goals, and statistics
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const Subject = require('../models/Subject');
const Session = require('../models/Session');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/subjects
// @desc    Create a new subject
// @access  Private
router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Subject name must be 1-100 characters'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color'),
  body('weeklyGoal').optional().isInt({ min: 0 }).withMessage('Weekly goal must be a positive number'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, color, weeklyGoal, description } = req.body;

    // Check if subject with same name already exists for this user
    const existingSubject = await Subject.findOne({ 
      userId: req.userId, 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingSubject) {
      return res.status(400).json({ message: 'Subject with this name already exists' });
    }

    // Create new subject
    const subject = new Subject({
      name,
      color: color || '#3B82F6',
      weeklyGoal: weeklyGoal || 300,
      description,
      userId: req.userId
    });

    await subject.save();

    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });

  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Server error creating subject' });
  }
});

// @route   GET /api/subjects
// @desc    Get all subjects for the user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.userId })
      .sort({ name: 1 });

    // Calculate current week progress for each subject
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const subjectsWithProgress = await Promise.all(subjects.map(async (subject) => {
      const weeklyStudyTime = await Session.aggregate([
        {
          $match: {
            userId: subject.userId,
            subjectId: subject._id,
            startTime: { $gte: startOfWeek, $lt: endOfWeek }
          }
        },
        {
          $group: {
            _id: null,
            totalTime: { $sum: '$duration' }
          }
        }
      ]);

      const currentWeekTime = weeklyStudyTime.length > 0 ? weeklyStudyTime[0].totalTime : 0;
      const progressPercentage = subject.weeklyGoal > 0 ? (currentWeekTime / subject.weeklyGoal) * 100 : 0;

      return {
        ...subject.toObject(),
        currentWeekTime,
        progressPercentage: Math.round(progressPercentage * 100) / 100
      };
    }));

    res.json(subjectsWithProgress);

  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error retrieving subjects' });
  }
});

// @route   GET /api/subjects/:id
// @desc    Get a specific subject with detailed statistics
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Get detailed statistics
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Aggregate statistics
    const stats = await Session.aggregate([
      {
        $match: {
          subjectId: subject._id,
          userId: req.userId
        }
      },
      {
        $facet: {
          thisWeek: [
            { $match: { startTime: { $gte: startOfWeek } } },
            { $group: { _id: null, totalTime: { $sum: '$duration' }, sessions: { $sum: 1 } } }
          ],
          thisMonth: [
            { $match: { startTime: { $gte: startOfMonth } } },
            { $group: { _id: null, totalTime: { $sum: '$duration' }, sessions: { $sum: 1 } } }
          ],
          thisYear: [
            { $match: { startTime: { $gte: startOfYear } } },
            { $group: { _id: null, totalTime: { $sum: '$duration' }, sessions: { $sum: 1 } } }
          ],
          averageSession: [
            { $group: { _id: null, avgDuration: { $avg: '$duration' }, avgFocus: { $avg: '$focusRating' } } }
          ],
          recentSessions: [
            { $sort: { startTime: -1 } },
            { $limit: 5 },
            { $project: { startTime: 1, duration: 1, studyMethod: 1, focusRating: 1 } }
          ]
        }
      }
    ]);

    const result = stats[0];
    const detailedSubject = {
      ...subject.toObject(),
      statistics: {
        thisWeek: result.thisWeek[0] || { totalTime: 0, sessions: 0 },
        thisMonth: result.thisMonth[0] || { totalTime: 0, sessions: 0 },
        thisYear: result.thisYear[0] || { totalTime: 0, sessions: 0 },
        averageSession: result.averageSession[0] || { avgDuration: 0, avgFocus: 0 },
        weeklyProgress: subject.weeklyGoal > 0 ? 
          ((result.thisWeek[0]?.totalTime || 0) / subject.weeklyGoal) * 100 : 0
      },
      recentSessions: result.recentSessions
    };

    res.json(detailedSubject);

  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ message: 'Server error retrieving subject' });
  }
});

// @route   PUT /api/subjects/:id
// @desc    Update a subject
// @access  Private
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('weeklyGoal').optional().isInt({ min: 0 }),
  body('description').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const subject = await Subject.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check for name conflicts if name is being changed
    if (req.body.name && req.body.name !== subject.name) {
      const existingSubject = await Subject.findOne({ 
        userId: req.userId, 
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        _id: { $ne: req.params.id }
      });

      if (existingSubject) {
        return res.status(400).json({ message: 'Subject with this name already exists' });
      }
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        subject[key] = req.body[key];
      }
    });

    await subject.save();

    res.json({
      message: 'Subject updated successfully',
      subject
    });

  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ message: 'Server error updating subject' });
  }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete a subject and all associated sessions
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if subject has sessions
    const sessionCount = await Session.countDocuments({ subjectId: req.params.id });
    
    if (sessionCount > 0 && !req.query.force) {
      return res.status(400).json({ 
        message: `Cannot delete subject with ${sessionCount} study sessions. Add ?force=true to delete anyway.`,
        sessionCount 
      });
    }

    // Delete all associated sessions if force delete
    if (req.query.force) {
      await Session.deleteMany({ subjectId: req.params.id });
    }

    // Delete the subject
    await Subject.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Subject deleted successfully',
      deletedSessions: sessionCount 
    });

  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Server error deleting subject' });
  }
});

// @route   GET /api/subjects/:id/sessions
// @desc    Get all sessions for a specific subject
// @access  Private
router.get('/:id/sessions', auth, async (req, res) => {
  try {
    const subject = await Subject.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const sessions = await Session.find({ subjectId: req.params.id })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Session.countDocuments({ subjectId: req.params.id });

    res.json({
      subject: {
        id: subject._id,
        name: subject.name,
        color: subject.color
      },
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
    console.error('Get subject sessions error:', error);
    res.status(500).json({ message: 'Server error retrieving subject sessions' });
  }
});

module.exports = router;