import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  Card,
  CardContent,
  Alert,
  Divider,
} from '@mui/material';
import { Person, Save, Schedule, TrendingUp } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateGoals } = useAuth();
  const [updateMessage, setUpdateMessage] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      dailyStudyTime: user?.goals?.dailyStudyTime || 240,
      weeklyStudyTime: user?.goals?.weeklyStudyTime || 1680,
    }
  });

  const onSubmit = async (data) => {
    const result = await updateGoals(data);
    if (result.success) {
      setUpdateMessage('Goals updated successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } else {
      setUpdateMessage(`Error: ${result.error}`);
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 'bold',
                mx: 'auto',
                mb: 2
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {user?.email}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Member since {new Date(user?.createdAt).toLocaleDateString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Study Goals
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Set your daily and weekly study time goals to track your progress
            </Typography>

            {updateMessage && (
              <Alert 
                severity={updateMessage.includes('Error') ? 'error' : 'success'} 
                sx={{ mb: 2 }}
              >
                {updateMessage}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="dailyStudyTime"
                    control={control}
                    rules={{ 
                      required: 'Daily goal is required',
                      min: { value: 0, message: 'Goal must be positive' },
                      max: { value: 1440, message: 'Cannot exceed 24 hours (1440 minutes)' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Daily Study Goal (minutes)"
                        type="number"
                        error={!!errors.dailyStudyTime}
                        helperText={errors.dailyStudyTime?.message || `Currently: ${formatTime(field.value)}`}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        InputProps={{
                          startAdornment: <Schedule sx={{ mr: 1, color: 'action.active' }} />
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="weeklyStudyTime"
                    control={control}
                    rules={{ 
                      required: 'Weekly goal is required',
                      min: { value: 0, message: 'Goal must be positive' },
                      max: { value: 10080, message: 'Cannot exceed 168 hours (10080 minutes)' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Weekly Study Goal (minutes)"
                        type="number"
                        error={!!errors.weeklyStudyTime}
                        helperText={errors.weeklyStudyTime?.message || `Currently: ${formatTime(field.value)}`}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        InputProps={{
                          startAdornment: <TrendingUp sx={{ mr: 1, color: 'action.active' }} />
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    sx={{ mt: 1 }}
                  >
                    Update Goals
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Account Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Full Name
                    </Typography>
                    <Typography variant="body1">{user?.name}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Email Address
                    </Typography>
                    <Typography variant="body1">{user?.email}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Account Created
                    </Typography>
                    <Typography variant="body1">
                      {new Date(user?.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Last Login
                    </Typography>
                    <Typography variant="body1">
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Current Goals
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Schedule color="primary" />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Daily Goal: {formatTime(user?.goals?.dailyStudyTime || 240)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Study time target per day
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <TrendingUp color="primary" />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Weekly Goal: {formatTime(user?.goals?.weeklyStudyTime || 1680)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Study time target per week
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="textSecondary">
              <strong>Tips:</strong> Set realistic goals that challenge you but are achievable. 
              You can always adjust these goals as your study habits develop. The default suggestion 
              is 4 hours per day (240 minutes) and 28 hours per week (1680 minutes).
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;