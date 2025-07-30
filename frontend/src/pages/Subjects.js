import React, { useState, useEffect, useReducer } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
  Chip,
  Avatar,
} from '@mui/material';
import { Add, Edit, Delete, Schedule, TrendingUp } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useApi, useApiMutation } from '../hooks/useApi';
import { subjectAPI } from '../services/api';

const subjectsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SUBJECTS':
      return { ...state, subjects: action.payload };
    case 'ADD_SUBJECT':
      return { ...state, subjects: [...state.subjects, action.payload] };
    case 'UPDATE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.map(s => 
          s._id === action.payload._id ? action.payload : s
        )
      };
    case 'DELETE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.filter(s => s._id !== action.payload)
      };
    default:
      return state;
  }
};

const Subjects = () => {
  const [state, dispatch] = useReducer(subjectsReducer, { subjects: [] });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const { data: subjects, loading, error, refetch } = useApi(() => subjectAPI.getAll());
  const { mutate: createSubject } = useApiMutation(subjectAPI.create);
  const { mutate: updateSubject } = useApiMutation(subjectAPI.update);
  const { mutate: deleteSubject } = useApiMutation(subjectAPI.delete);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      color: '#1976d2',
      weeklyGoal: 300,
      description: '',
    }
  });

  useEffect(() => {
    if (subjects) {
      dispatch({ type: 'SET_SUBJECTS', payload: subjects });
    }
  }, [subjects]);

  const handleOpenDialog = (subject = null) => {
    setEditingSubject(subject);
    if (subject) {
      reset({
        name: subject.name,
        color: subject.color,
        weeklyGoal: subject.weeklyGoal,
        description: subject.description || '',
      });
    } else {
      reset();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSubject(null);
    reset();
  };

  const onSubmit = async (data) => {
    let result;
    if (editingSubject) {
      result = await updateSubject(editingSubject._id, data);
      if (result.success) {
        dispatch({ type: 'UPDATE_SUBJECT', payload: result.data.subject });
      }
    } else {
      result = await createSubject(data);
      if (result.success) {
        dispatch({ type: 'ADD_SUBJECT', payload: result.data.subject });
      }
    }

    if (result.success) {
      handleCloseDialog();
      refetch();
    }
  };


  const handleDelete = async (subjectId) => {
    const subject = state.subjects.find(s => s._id === subjectId);
    let confirmMessage = 'Are you sure you want to delete this subject?';
    
    if (subject.totalSessions > 0) {
      confirmMessage = `This subject has ${subject.totalSessions} study sessions. Deleting it will also delete all associated sessions. Are you sure?`;
    }

    if (window.confirm(confirmMessage)) {
      const result = await deleteSubject(subjectId, subject.totalSessions > 0);
      if (result.success) {
        dispatch({ type: 'DELETE_SUBJECT', payload: subjectId });
      }
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const predefinedColors = [
    '#1976d2', '#d32f2f', '#388e3c', '#f57c00', 
    '#7b1fa2', '#5d4037', '#616161', '#c2185b'
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Subjects
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Subject
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {state.subjects.map((subject) => (
          <Grid item xs={12} sm={6} md={4} key={subject._id}>
            <Card 
              elevation={2}
              sx={{ 
                position: 'relative',
                '&:hover': { 
                  elevation: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <Box
                sx={{
                  height: 4,
                  backgroundColor: subject.color,
                  borderRadius: '4px 4px 0 0'
                }}
              />
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      sx={{
                        bgcolor: subject.color,
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {subject.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {subject.name}
                      </Typography>
                      {subject.description && (
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {subject.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(subject)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(subject._id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Weekly Progress
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {subject.progressPercentage?.toFixed(0) || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(subject.progressPercentage || 0, 100)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: subject.color,
                      },
                    }}
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                    {formatTime(subject.currentWeekTime || 0)} / {formatTime(subject.weeklyGoal)}
                  </Typography>
                </Box>

                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip
                    icon={<Schedule />}
                    label={formatTime(subject.totalStudyTime)}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<TrendingUp />}
                    label={`${subject.totalSessions} sessions`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="textSecondary">
                    Created: {new Date(subject.createdAt).toLocaleDateString()}
                  </Typography>
                  {subject.updatedAt !== subject.createdAt && (
                    <Typography variant="caption" color="textSecondary">
                      Updated: {new Date(subject.updatedAt).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {state.subjects.length === 0 && !loading && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="400px"
          textAlign="center"
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No subjects yet
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Create your first subject to start tracking your study sessions
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Subject
          </Button>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSubject ? 'Edit Subject' : 'Add New Subject'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ 
                    required: 'Subject name is required',
                    minLength: { value: 1, message: 'Name must be at least 1 character' },
                    maxLength: { value: 100, message: 'Name must be less than 100 characters' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Subject Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      placeholder="e.g., Computer Science, Mathematics, Physics"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Subject Color
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                        {predefinedColors.map((color) => (
                          <Box
                            key={color}
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: color,
                              border: field.value === color ? '3px solid #333' : '1px solid #ddd',
                              borderRadius: 1,
                              cursor: 'pointer',
                              '&:hover': { transform: 'scale(1.1)' }
                            }}
                            onClick={() => field.onChange(color)}
                          />
                        ))}
                      </Box>
                      <TextField
                        {...field}
                        size="small"
                        label="Custom Color"
                        type="color"
                        sx={{ width: 80 }}
                      />
                    </Box>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="weeklyGoal"
                  control={control}
                  rules={{ 
                    required: 'Weekly goal is required',
                    min: { value: 0, message: 'Goal must be positive' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Weekly Goal (minutes)"
                      type="number"
                      error={!!errors.weeklyGoal}
                      helperText={errors.weeklyGoal?.message || 'Default: 300 minutes (5 hours)'}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  rules={{
                    maxLength: { value: 500, message: 'Description must be less than 500 characters' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Description (Optional)"
                      multiline
                      rows={3}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      placeholder="Add a brief description of this subject..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingSubject ? 'Update' : 'Create'} Subject
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Subjects;