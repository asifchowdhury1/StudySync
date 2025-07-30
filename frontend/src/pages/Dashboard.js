import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from '@mui/material';
import { Schedule, TrendingUp, Subject, Analytics } from '@mui/icons-material';
import D3TimeSeriesChart from '../components/D3TimeSeriesChart';
import D3PieChart from '../components/D3PieChart';

const Dashboard = () => {
  // Mock data for demonstration
  const dashboardData = {
    overall: {
      totalStudyTime: 1200,
      totalSessions: 25,
      averageFocusRating: 8.3,
      averageDifficultyRating: 6.8
    },
    periods: {
      today: { studyTime: 120, sessions: 3, goalProgress: 50 },
      thisWeek: { studyTime: 480, sessions: 12, goalProgress: 68.5 },
      thisMonth: { studyTime: 1200, sessions: 25 },
      thisYear: { studyTime: 1200, sessions: 25 }
    },
    goals: { dailyStudyTime: 240, weeklyStudyTime: 700 }
  };

  const subjectsData = {
    subjects: [
      { subject: { name: 'Computer Science', color: '#1976d2' }, totalTime: 480 },
      { subject: { name: 'Mathematics', color: '#2e7d32' }, totalTime: 360 },
      { subject: { name: 'Physics', color: '#d32f2f' }, totalTime: 240 },
      { subject: { name: 'Literature', color: '#9c27b0' }, totalTime: 120 }
    ]
  };

  const timeSeriesData = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return {
      date: date.toISOString().split('T')[0],
      totalTime: Math.floor(Math.random() * 180) + 60,
      sessionCount: Math.floor(Math.random() * 4) + 1
    };
  });

  const todaySummary = {
    sessions: [
      { subject: 'Computer Science', duration: 45, formattedDuration: '45m', startTime: new Date(Date.now() - 3 * 60 * 60 * 1000), endTime: new Date(Date.now() - 2.25 * 60 * 60 * 1000) },
      { subject: 'Mathematics', duration: 60, formattedDuration: '1h', startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), endTime: new Date(Date.now() - 1 * 60 * 60 * 1000) },
      { subject: 'Physics', duration: 30, formattedDuration: '30m', startTime: new Date(Date.now() - 30 * 60 * 1000), endTime: new Date() }
    ]
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const StatCard = ({ title, value, icon, color, subtitle, progress }) => (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
        {progress !== undefined && (
          <Box mt={1}>
            <LinearProgress
              variant="determinate"
              value={Math.min(progress, 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                },
              }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
              {progress.toFixed(1)}% of goal
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );


  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Study Time"
            value={formatTime(dashboardData?.periods?.today?.studyTime || 0)}
            icon={<Schedule sx={{ fontSize: 40 }} />}
            color="#1976d2"
            subtitle={`${dashboardData?.periods?.today?.sessions || 0} sessions`}
            progress={dashboardData?.periods?.today?.goalProgress || 0}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Week"
            value={formatTime(dashboardData?.periods?.thisWeek?.studyTime || 0)}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="#2e7d32"
            subtitle={`${dashboardData?.periods?.thisWeek?.sessions || 0} sessions`}
            progress={dashboardData?.periods?.thisWeek?.goalProgress || 0}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Month"
            value={formatTime(dashboardData?.periods?.thisMonth?.studyTime || 0)}
            icon={<Analytics sx={{ fontSize: 40 }} />}
            color="#ed6c02"
            subtitle={`${dashboardData?.periods?.thisMonth?.sessions || 0} sessions`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Time"
            value={formatTime(dashboardData?.overall?.totalStudyTime || 0)}
            icon={<Subject sx={{ fontSize: 40 }} />}
            color="#9c27b0"
            subtitle={`${dashboardData?.overall?.totalSessions || 0} total sessions`}
          />
        </Grid>

        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, height: 500 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Study Time Trend (Last 14 Days)
            </Typography>
            {timeSeriesData.length > 0 ? (
              <D3TimeSeriesChart
                data={timeSeriesData}
                width={750}
                height={400}
              />
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height={400}>
                <Typography color="textSecondary">No study data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, height: 500 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Subject Distribution (Last 30 Days)
            </Typography>
            {subjectsData?.subjects && subjectsData.subjects.length > 0 ? (
              <D3PieChart
                data={subjectsData.subjects}
                width={350}
                height={400}
              />
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height={400}>
                <Typography color="textSecondary">No subject data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {todaySummary && todaySummary.sessions.length > 0 && (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Today's Sessions
              </Typography>
              <Grid container spacing={2}>
                {todaySummary.sessions.map((session, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent sx={{ pb: '16px !important' }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {session.subject}
                          </Typography>
                          <Chip
                            label={session.formattedDuration}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(session.startTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {new Date(session.endTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Stats
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {dashboardData?.overall?.averageFocusRating?.toFixed(1) || 0}/10
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average Focus
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {dashboardData?.overall?.averageDifficultyRating?.toFixed(1) || 0}/10
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average Difficulty
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {subjectsData?.summary?.subjectCount || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Subjects
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {dashboardData?.goals?.dailyStudyTime ? 
                      formatTime(dashboardData.goals.dailyStudyTime) : 'Not Set'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Daily Goal
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;