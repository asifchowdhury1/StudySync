import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { TrendingUp, Schedule, Place, Psychology } from '@mui/icons-material';
import { useApi } from '../hooks/useApi';
import { analyticsAPI } from '../services/api';
import D3TimeSeriesChart from '../components/D3TimeSeriesChart';
import D3PieChart from '../components/D3PieChart';

const Analytics = () => {
  const [timePeriod, setTimePeriod] = useState('daily');
  const [dayRange, setDayRange] = useState(30);

  const { data: timeSeriesData, loading: timeSeriesLoading } = useApi(
    () => analyticsAPI.getTimeSeries({ period: timePeriod, days: dayRange }),
    [timePeriod, dayRange]
  );

  const { data: subjectsData, loading: subjectsLoading } = useApi(
    () => analyticsAPI.getSubjects({ days: dayRange }),
    [dayRange]
  );

  const { data: patternsData, loading: patternsLoading } = useApi(
    () => analyticsAPI.getPatterns({ days: dayRange }),
    [dayRange]
  );

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color }}>
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
      </CardContent>
    </Card>
  );

  if (timeSeriesLoading || subjectsLoading || patternsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Analytics
      </Typography>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={timePeriod}
            label="Time Period"
            onChange={(e) => setTimePeriod(e.target.value)}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Date Range</InputLabel>
          <Select
            value={dayRange}
            label="Date Range"
            onChange={(e) => setDayRange(e.target.value)}
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={14}>Last 2 weeks</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 3 months</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {subjectsData?.summary && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Study Time"
              value={formatTime(subjectsData.summary.totalStudyTime)}
              icon={<Schedule sx={{ fontSize: 40 }} />}
              color="#1976d2"
              subtitle={`${subjectsData.summary.totalSessions} sessions`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Subjects"
              value={subjectsData.summary.subjectCount}
              icon={<TrendingUp sx={{ fontSize: 40 }} />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Session Length"
              value={formatTime(
                subjectsData.summary.totalSessions > 0
                  ? Math.round(subjectsData.summary.totalStudyTime / subjectsData.summary.totalSessions)
                  : 0
              )}
              icon={<Psychology sx={{ fontSize: 40 }} />}
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Most Productive"
              value={patternsData?.patterns?.locationEffectiveness?.[0]?.location || 'N/A'}
              icon={<Place sx={{ fontSize: 40 }} />}
              color="#9c27b0"
              subtitle="location"
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, height: 500 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Study Time Trends
            </Typography>
            {timeSeriesData?.data && timeSeriesData.data.length > 0 ? (
              <D3TimeSeriesChart
                data={timeSeriesData.data}
                width={750}
                height={400}
              />
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height={400}>
                <Typography color="textSecondary">No data available for selected period</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, height: 500 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Subject Distribution
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

        {patternsData?.patterns?.studyMethodEffectiveness && (
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Study Method Effectiveness
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {patternsData.patterns.studyMethodEffectiveness.slice(0, 5).map((method, index) => (
                  <Box key={method.method} display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip
                        label={`#${index + 1}`}
                        size="small"
                        color={index === 0 ? 'success' : 'default'}
                      />
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {method.method.replace('_', ' ')}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Focus: {method.avgFocus.toFixed(1)}/10
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatTime(method.totalTime)} • {method.sessionCount} sessions
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}

        {patternsData?.patterns?.locationEffectiveness && (
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Location Effectiveness
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {patternsData.patterns.locationEffectiveness.slice(0, 5).map((location, index) => (
                  <Box key={location.location} display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip
                        label={`#${index + 1}`}
                        size="small"
                        color={index === 0 ? 'success' : 'default'}
                      />
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {location.location}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Focus: {location.avgFocus.toFixed(1)}/10
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatTime(location.totalTime)} • {location.sessionCount} sessions
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}

        {subjectsData?.subjects && (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Subject Performance
              </Typography>
              <Grid container spacing={2}>
                {subjectsData.subjects.map((subject) => (
                  <Grid item xs={12} sm={6} md={4} key={subject.subject.id}>
                    <Card variant="outlined">
                      <CardContent sx={{ pb: '16px !important' }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              backgroundColor: subject.subject.color,
                              borderRadius: '50%'
                            }}
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {subject.subject.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {formatTime(subject.totalTime)} • {subject.sessionCount} sessions
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption">
                            Focus: {subject.avgFocus.toFixed(1)}/10
                          </Typography>
                          <Typography variant="caption">
                            {subject.timePercentage.toFixed(1)}% of total
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>

      {(!timeSeriesData?.data || timeSeriesData.data.length === 0) && 
       (!subjectsData?.subjects || subjectsData.subjects.length === 0) && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No analytics data available. Start tracking your study sessions to see insights here!
        </Alert>
      )}
    </Box>
  );
};

export default Analytics;