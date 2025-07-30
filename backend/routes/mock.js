/**
 * Mock API Routes - No Database Required
 * Returns sample data for demonstration purposes
 */

const express = require('express');
const router = express.Router();

// Mock data
let users = [];
let sessions = [];
let subjects = [
  { _id: '1', name: 'Computer Science', color: '#1976d2', weeklyGoal: 300, totalStudyTime: 450, totalSessions: 8, currentWeekTime: 180, progressPercentage: 60, createdAt: new Date(), updatedAt: new Date() },
  { _id: '2', name: 'Mathematics', color: '#2e7d32', weeklyGoal: 240, totalStudyTime: 320, totalSessions: 6, currentWeekTime: 120, progressPercentage: 50, createdAt: new Date(), updatedAt: new Date() },
  { _id: '3', name: 'Physics', color: '#d32f2f', weeklyGoal: 180, totalStudyTime: 200, totalSessions: 4, currentWeekTime: 90, progressPercentage: 50, createdAt: new Date(), updatedAt: new Date() }
];

let currentUser = null;

// Generate sample sessions
const generateSampleSessions = () => {
  const sampleSessions = [];
  const now = new Date();
  
  for (let i = 0; i < 10; i++) {
    const startTime = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000) - (Math.random() * 4 * 60 * 60 * 1000));
    const duration = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    
    sampleSessions.push({
      _id: `session_${i}`,
      userId: 'user_1',
      subjectId: subjects[i % subjects.length],
      startTime,
      endTime,
      duration,
      studyMethod: ['reading', 'practice_problems', 'notes', 'video'][Math.floor(Math.random() * 4)],
      location: ['library', 'home', 'cafe'][Math.floor(Math.random() * 3)],
      focusRating: Math.floor(Math.random() * 4) + 7, // 7-10
      difficultyRating: Math.floor(Math.random() * 6) + 5, // 5-10
      notes: i % 3 === 0 ? 'Great session, made good progress!' : '',
      formattedDuration: duration >= 60 ? `${Math.floor(duration/60)}h ${duration%60}m` : `${duration}m`
    });
  }
  
  return sampleSessions;
};

// Auth routes
router.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  const user = {
    _id: 'user_1',
    name,
    email,
    goals: { dailyStudyTime: 240, weeklyStudyTime: 1680 },
    preferences: { defaultBreakLength: 15, notifications: true, timezone: 'America/New_York' },
    createdAt: new Date(),
    lastLogin: new Date()
  };
  
  users.push(user);
  currentUser = user;
  sessions = generateSampleSessions();
  
  res.status(201).json({
    message: 'User registered successfully',
    token: 'mock_jwt_token_123',
    user
  });
});

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = {
    _id: 'user_1',
    name: 'Demo User',
    email,
    goals: { dailyStudyTime: 240, weeklyStudyTime: 1680 },
    preferences: { defaultBreakLength: 15, notifications: true, timezone: 'America/New_York' },
    createdAt: new Date(),
    lastLogin: new Date()
  };
  
  currentUser = user;
  sessions = generateSampleSessions();
  
  res.json({
    message: 'Login successful',
    token: 'mock_jwt_token_123',
    user
  });
});

router.get('/auth/me', (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json(currentUser);
});

router.put('/auth/goals', (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  currentUser.goals = { ...currentUser.goals, ...req.body };
  res.json({ message: 'Goals updated successfully', goals: currentUser.goals });
});

// Subjects routes
router.get('/subjects', (req, res) => {
  res.json(subjects);
});

router.post('/subjects', (req, res) => {
  const newSubject = {
    _id: `subject_${Date.now()}`,
    ...req.body,
    totalStudyTime: 0,
    totalSessions: 0,
    currentWeekTime: 0,
    progressPercentage: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  subjects.push(newSubject);
  res.status(201).json({ message: 'Subject created successfully', subject: newSubject });
});

router.put('/subjects/:id', (req, res) => {
  const subjectIndex = subjects.findIndex(s => s._id === req.params.id);
  if (subjectIndex === -1) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  
  subjects[subjectIndex] = { ...subjects[subjectIndex], ...req.body, updatedAt: new Date() };
  res.json({ message: 'Subject updated successfully', subject: subjects[subjectIndex] });
});

router.delete('/subjects/:id', (req, res) => {
  const subjectIndex = subjects.findIndex(s => s._id === req.params.id);
  if (subjectIndex === -1) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  
  subjects.splice(subjectIndex, 1);
  res.json({ message: 'Subject deleted successfully' });
});

// Sessions routes
router.get('/sessions', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  
  const paginatedSessions = sessions.slice(skip, skip + limit);
  
  res.json({
    sessions: paginatedSessions,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(sessions.length / limit),
      totalSessions: sessions.length,
      hasNext: skip + paginatedSessions.length < sessions.length,
      hasPrev: page > 1
    }
  });
});

router.post('/sessions', (req, res) => {
  const { subjectId, startTime, endTime, ...sessionData } = req.body;
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const duration = Math.round((end - start) / (1000 * 60));
  
  const newSession = {
    _id: `session_${Date.now()}`,
    userId: 'user_1',
    subjectId: subjects.find(s => s._id === subjectId) || subjects[0],
    startTime: start,
    endTime: end,
    duration,
    ...sessionData,
    formattedDuration: duration >= 60 ? `${Math.floor(duration/60)}h ${duration%60}m` : `${duration}m`
  };
  
  sessions.unshift(newSession);
  
  res.status(201).json({
    message: 'Session created successfully',
    session: newSession
  });
});

router.get('/sessions/summary/today', (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.startTime);
    return sessionDate >= today && sessionDate < tomorrow;
  }).slice(0, 5);
  
  const totalTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  
  res.json({
    date: today.toISOString().split('T')[0],
    totalTime,
    totalSessions: todaySessions.length,
    sessions: todaySessions.map(s => ({
      id: s._id,
      subject: s.subjectId.name,
      duration: s.duration,
      formattedDuration: s.formattedDuration,
      startTime: s.startTime,
      endTime: s.endTime
    }))
  });
});

// Analytics routes
router.get('/analytics/dashboard', (req, res) => {
  const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  const avgFocus = sessions.reduce((sum, s) => sum + s.focusRating, 0) / sessions.length || 0;
  const avgDifficulty = sessions.reduce((sum, s) => sum + s.difficultyRating, 0) / sessions.length || 0;
  
  // Today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySessions = sessions.filter(s => new Date(s.startTime) >= today);
  const todayTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  
  // Week stats
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekSessions = sessions.filter(s => new Date(s.startTime) >= weekStart);
  const weekTime = weekSessions.reduce((sum, s) => sum + s.duration, 0);
  
  res.json({
    overall: {
      totalStudyTime: totalTime,
      totalSessions: sessions.length,
      averageFocusRating: avgFocus,
      averageDifficultyRating: avgDifficulty
    },
    periods: {
      today: {
        studyTime: todayTime,
        sessions: todaySessions.length,
        goalProgress: currentUser ? (todayTime / currentUser.goals.dailyStudyTime) * 100 : 0
      },
      thisWeek: {
        studyTime: weekTime,
        sessions: weekSessions.length,
        goalProgress: currentUser ? (weekTime / currentUser.goals.weeklyStudyTime) * 100 : 0
      },
      thisMonth: {
        studyTime: totalTime,
        sessions: sessions.length
      },
      thisYear: {
        studyTime: totalTime,
        sessions: sessions.length
      }
    },
    goals: currentUser?.goals || { dailyStudyTime: 240, weeklyStudyTime: 1680 }
  });
});

router.get('/analytics/time-series', (req, res) => {
  const days = parseInt(req.query.days) || 14;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dailySessions = sessions.filter(s => {
      const sessionDate = new Date(s.startTime).toISOString().split('T')[0];
      return sessionDate === dateStr;
    });
    
    const totalTime = dailySessions.reduce((sum, s) => sum + s.duration, 0);
    const avgFocus = dailySessions.length > 0 ? 
      dailySessions.reduce((sum, s) => sum + s.focusRating, 0) / dailySessions.length : 0;
    
    data.push({
      date: dateStr,
      totalTime,
      sessionCount: dailySessions.length,
      avgFocus: Math.round(avgFocus * 100) / 100,
      avgDifficulty: Math.round(avgFocus * 100) / 100
    });
  }
  
  res.json({
    period: req.query.period || 'daily',
    dateRange: {
      start: data[0]?.date,
      end: data[data.length - 1]?.date
    },
    data
  });
});

router.get('/analytics/subjects', (req, res) => {
  const subjectStats = subjects.map(subject => ({
    subject: {
      id: subject._id,
      name: subject.name,
      color: subject.color,
      weeklyGoal: subject.weeklyGoal
    },
    totalTime: subject.totalStudyTime,
    sessionCount: subject.totalSessions,
    avgFocus: 8.5,
    avgDifficulty: 6.5,
    timePercentage: (subject.totalStudyTime / subjects.reduce((sum, s) => sum + s.totalStudyTime, 0)) * 100 || 0,
    sessionPercentage: (subject.totalSessions / subjects.reduce((sum, s) => sum + s.totalSessions, 0)) * 100 || 0
  }));
  
  res.json({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    summary: {
      totalStudyTime: subjects.reduce((sum, s) => sum + s.totalStudyTime, 0),
      totalSessions: subjects.reduce((sum, s) => sum + s.totalSessions, 0),
      subjectCount: subjects.length
    },
    subjects: subjectStats
  });
});

router.get('/analytics/patterns', (req, res) => {
  res.json({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    patterns: {
      studyMethodEffectiveness: [
        { method: 'practice_problems', sessionCount: 15, totalTime: 450, avgFocus: 9.2, avgDifficulty: 7.8 },
        { method: 'reading', sessionCount: 12, totalTime: 380, avgFocus: 8.5, avgDifficulty: 6.2 },
        { method: 'notes', sessionCount: 8, totalTime: 240, avgFocus: 8.0, avgDifficulty: 5.5 },
        { method: 'video', sessionCount: 5, totalTime: 150, avgFocus: 7.5, avgDifficulty: 4.8 }
      ],
      locationEffectiveness: [
        { location: 'library', sessionCount: 20, totalTime: 600, avgFocus: 9.0, avgDifficulty: 7.0 },
        { location: 'home', sessionCount: 15, totalTime: 450, avgFocus: 8.0, avgDifficulty: 6.0 },
        { location: 'cafe', sessionCount: 5, totalTime: 150, avgFocus: 7.0, avgDifficulty: 5.5 }
      ]
    }
  });
});

module.exports = router;