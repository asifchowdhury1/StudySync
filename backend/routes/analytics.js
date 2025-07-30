/**
 * Analytics Routes
 * Provides data aggregation and statistics for visualization
 * Powers D3.js charts and dashboard analytics
 */

const express = require('express');
const { query, validationResult } = require('express-validator');
const Session = require('../models/Session');
const Subject = require('../models/Subject');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get comprehensive dashboard statistics
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    
    // Define time periods
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    // Get user goals
    const user = await User.findById(userId).select('goals');
    
    // Aggregate statistics
    const stats = await Session.aggregate([
      { $match: { userId: userId } },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalTime: { $sum: '$duration' },
                totalSessions: { $sum: 1 },
                avgFocus: { $avg: '$focusRating' },
                avgDifficulty: { $avg: '$difficultyRating' }
              }
            }
          ],
          today: [
            { $match: { startTime: { $gte: today } } },
            { $group: { _id: null, totalTime: { $sum: '$duration' }, sessions: { $sum: 1 } } }
          ],
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
          ]
        }
      }
    ]);

    const result = stats[0];
    const overall = result.overall[0] || { totalTime: 0, totalSessions: 0, avgFocus: 0, avgDifficulty: 0 };
    const todayStats = result.today[0] || { totalTime: 0, sessions: 0 };
    const weekStats = result.thisWeek[0] || { totalTime: 0, sessions: 0 };
    const monthStats = result.thisMonth[0] || { totalTime: 0, sessions: 0 };
    const yearStats = result.thisYear[0] || { totalTime: 0, sessions: 0 };

    // Calculate goal progress
    const dailyGoalProgress = user?.goals?.dailyStudyTime > 0 ? 
      (todayStats.totalTime / user.goals.dailyStudyTime) * 100 : 0;
    
    const weeklyGoalProgress = user?.goals?.weeklyStudyTime > 0 ? 
      (weekStats.totalTime / user.goals.weeklyStudyTime) * 100 : 0;

    res.json({
      overall: {
        totalStudyTime: overall.totalTime,
        totalSessions: overall.totalSessions,
        averageFocusRating: Math.round(overall.avgFocus * 100) / 100,
        averageDifficultyRating: Math.round(overall.avgDifficulty * 100) / 100
      },
      periods: {
        today: {
          studyTime: todayStats.totalTime,
          sessions: todayStats.sessions,
          goalProgress: Math.round(dailyGoalProgress * 100) / 100
        },
        thisWeek: {
          studyTime: weekStats.totalTime,
          sessions: weekStats.sessions,
          goalProgress: Math.round(weeklyGoalProgress * 100) / 100
        },
        thisMonth: {
          studyTime: monthStats.totalTime,
          sessions: monthStats.sessions
        },
        thisYear: {
          studyTime: yearStats.totalTime,
          sessions: yearStats.sessions
        }
      },
      goals: user?.goals || { dailyStudyTime: 0, weeklyStudyTime: 0 }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error retrieving dashboard data' });
  }
});

// @route   GET /api/analytics/time-series
// @desc    Get time series data for charts (daily/weekly/monthly aggregations)
// @access  Private
router.get('/time-series', auth, [
  query('period').isIn(['daily', 'weekly', 'monthly']).withMessage('Period must be daily, weekly, or monthly'),
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
  query('subjectId').optional().isMongoId().withMessage('Invalid subject ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period, days = 30, subjectId } = req.query;
    const userId = req.userId;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    // Build match criteria
    const matchCriteria = {
      userId: userId,
      startTime: { $gte: startDate, $lte: endDate }
    };

    if (subjectId) {
      matchCriteria.subjectId = mongoose.Types.ObjectId(subjectId);
    }

    // Define grouping based on period
    let groupBy;
    let dateFormat;
    
    switch (period) {
      case 'daily':
        groupBy = {
          year: { $year: '$startTime' },
          month: { $month: '$startTime' },
          day: { $dayOfMonth: '$startTime' }
        };
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$startTime' },
          week: { $week: '$startTime' }
        };
        dateFormat = '%Y-W%U';
        break;
      case 'monthly':
        groupBy = {
          year: { $year: '$startTime' },
          month: { $month: '$startTime' }
        };
        dateFormat = '%Y-%m';
        break;
    }

    const timeSeries = await Session.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: groupBy,
          totalTime: { $sum: '$duration' },
          sessionCount: { $sum: 1 },
          avgFocus: { $avg: '$focusRating' },
          avgDifficulty: { $avg: '$difficultyRating' },
          date: { $first: { $dateToString: { format: dateFormat, date: '$startTime' } } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    // Fill in missing dates with zero values
    const filledData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      let dateKey;
      let increment;
      
      switch (period) {
        case 'daily':
          dateKey = currentDate.toISOString().split('T')[0];
          increment = 1;
          break;
        case 'weekly':
          const year = currentDate.getFullYear();
          const week = Math.ceil(((currentDate - new Date(year, 0, 1)) / 86400000 + 1) / 7);
          dateKey = `${year}-W${week.toString().padStart(2, '0')}`;
          increment = 7;
          break;
        case 'monthly':
          dateKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
          increment = 32;
          currentDate.setDate(1); // Start of month
          break;
      }
      
      const existingData = timeSeries.find(item => item.date === dateKey);
      
      filledData.push({
        date: dateKey,
        totalTime: existingData?.totalTime || 0,
        sessionCount: existingData?.sessionCount || 0,
        avgFocus: existingData ? Math.round(existingData.avgFocus * 100) / 100 : 0,
        avgDifficulty: existingData ? Math.round(existingData.avgDifficulty * 100) / 100 : 0
      });
      
      if (period === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + increment);
      }
    }

    res.json({
      period,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      data: filledData
    });

  } catch (error) {
    console.error('Time series analytics error:', error);
    res.status(500).json({ message: 'Server error retrieving time series data' });
  }
});

// @route   GET /api/analytics/subjects
// @desc    Get subject-wise analytics and comparisons
// @access  Private
router.get('/subjects', auth, [
  query('days').optional().isInt({ min: 1, max: 365 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { days = 30 } = req.query;
    const userId = req.userId;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    // Get subject analytics
    const subjectStats = await Session.aggregate([
      {
        $match: {
          userId: userId,
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$subjectId',
          totalTime: { $sum: '$duration' },
          sessionCount: { $sum: 1 },
          avgFocus: { $avg: '$focusRating' },
          avgDifficulty: { $avg: '$difficultyRating' },
          studyMethods: { $push: '$studyMethod' },
          locations: { $push: '$location' }
        }
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject'
        }
      },
      {
        $unwind: '$subject'
      },
      {
        $sort: { totalTime: -1 }
      }
    ]);

    // Process study methods and locations for each subject
    const processedStats = subjectStats.map(stat => {
      // Count study methods
      const methodCounts = stat.studyMethods.reduce((acc, method) => {
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {});

      // Count locations
      const locationCounts = stat.locations.reduce((acc, location) => {
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {});

      return {
        subject: {
          id: stat.subject._id,
          name: stat.subject.name,
          color: stat.subject.color,
          weeklyGoal: stat.subject.weeklyGoal
        },
        totalTime: stat.totalTime,
        sessionCount: stat.sessionCount,
        avgFocus: Math.round(stat.avgFocus * 100) / 100,
        avgDifficulty: Math.round(stat.avgDifficulty * 100) / 100,
        preferredMethods: Object.entries(methodCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([method, count]) => ({ method, count })),
        preferredLocations: Object.entries(locationCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([location, count]) => ({ location, count }))
      };
    });

    // Calculate totals for percentages
    const totalStudyTime = processedStats.reduce((sum, stat) => sum + stat.totalTime, 0);
    const totalSessions = processedStats.reduce((sum, stat) => sum + stat.sessionCount, 0);

    // Add percentage calculations
    const finalStats = processedStats.map(stat => ({
      ...stat,
      timePercentage: totalStudyTime > 0 ? Math.round((stat.totalTime / totalStudyTime) * 10000) / 100 : 0,
      sessionPercentage: totalSessions > 0 ? Math.round((stat.sessionCount / totalSessions) * 10000) / 100 : 0
    }));

    res.json({
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      summary: {
        totalStudyTime,
        totalSessions,
        subjectCount: finalStats.length
      },
      subjects: finalStats
    });

  } catch (error) {
    console.error('Subject analytics error:', error);
    res.status(500).json({ message: 'Server error retrieving subject analytics' });
  }
});

// @route   GET /api/analytics/patterns
// @desc    Get study pattern analysis (focus vs difficulty, time distribution, etc.)
// @access  Private
router.get('/patterns', auth, [
  query('days').optional().isInt({ min: 1, max: 365 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { days = 30 } = req.query;
    const userId = req.userId;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    // Get pattern analysis
    const patterns = await Session.aggregate([
      {
        $match: {
          userId: userId,
          startTime: { $gte: startDate }
        }
      },
      {
        $facet: {
          hourDistribution: [
            {
              $group: {
                _id: { $hour: '$startTime' },
                sessionCount: { $sum: 1 },
                totalTime: { $sum: '$duration' },
                avgFocus: { $avg: '$focusRating' }
              }
            },
            { $sort: { '_id': 1 } }
          ],
          dayOfWeekDistribution: [
            {
              $group: {
                _id: { $dayOfWeek: '$startTime' },
                sessionCount: { $sum: 1 },
                totalTime: { $sum: '$duration' },
                avgFocus: { $avg: '$focusRating' }
              }
            },
            { $sort: { '_id': 1 } }
          ],
          focusVsDifficulty: [
            {
              $group: {
                _id: {
                  focus: { $round: '$focusRating' },
                  difficulty: { $round: '$difficultyRating' }
                },
                count: { $sum: 1 },
                avgDuration: { $avg: '$duration' }
              }
            }
          ],
          studyMethodEffectiveness: [
            {
              $group: {
                _id: '$studyMethod',
                sessionCount: { $sum: 1 },
                totalTime: { $sum: '$duration' },
                avgFocus: { $avg: '$focusRating' },
                avgDifficulty: { $avg: '$difficultyRating' }
              }
            },
            { $sort: { avgFocus: -1 } }
          ],
          locationEffectiveness: [
            {
              $group: {
                _id: '$location',
                sessionCount: { $sum: 1 },
                totalTime: { $sum: '$duration' },
                avgFocus: { $avg: '$focusRating' },
                avgDifficulty: { $avg: '$difficultyRating' }
              }
            },
            { $sort: { avgFocus: -1 } }
          ]
        }
      }
    ]);

    const result = patterns[0];

    // Process hour distribution (fill missing hours)
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const existing = result.hourDistribution.find(item => item._id === hour);
      return {
        hour,
        sessionCount: existing?.sessionCount || 0,
        totalTime: existing?.totalTime || 0,
        avgFocus: existing ? Math.round(existing.avgFocus * 100) / 100 : 0
      };
    });

    // Process day of week distribution
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyData = Array.from({ length: 7 }, (_, day) => {
      const existing = result.dayOfWeekDistribution.find(item => item._id === day + 1);
      return {
        day: day + 1,
        dayName: dayNames[day],
        sessionCount: existing?.sessionCount || 0,
        totalTime: existing?.totalTime || 0,
        avgFocus: existing ? Math.round(existing.avgFocus * 100) / 100 : 0
      };
    });

    res.json({
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      patterns: {
        hourlyDistribution: hourlyData,
        dailyDistribution: dailyData,
        focusVsDifficulty: result.focusVsDifficulty.map(item => ({
          focus: item._id.focus,
          difficulty: item._id.difficulty,
          sessionCount: item.count,
          avgDuration: Math.round(item.avgDuration * 100) / 100
        })),
        studyMethodEffectiveness: result.studyMethodEffectiveness.map(item => ({
          method: item._id,
          sessionCount: item.sessionCount,
          totalTime: item.totalTime,
          avgFocus: Math.round(item.avgFocus * 100) / 100,
          avgDifficulty: Math.round(item.avgDifficulty * 100) / 100
        })),
        locationEffectiveness: result.locationEffectiveness.map(item => ({
          location: item._id,
          sessionCount: item.sessionCount,
          totalTime: item.totalTime,
          avgFocus: Math.round(item.avgFocus * 100) / 100,
          avgDifficulty: Math.round(item.avgDifficulty * 100) / 100
        }))
      }
    });

  } catch (error) {
    console.error('Pattern analytics error:', error);
    res.status(500).json({ message: 'Server error retrieving pattern analysis' });
  }
});

module.exports = router;