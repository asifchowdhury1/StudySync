import React, { useState, useEffect, useReducer } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Rating,
  Alert,
  Pagination,
} from '@mui/material';
import { Add, Edit, Delete, Schedule, PlayArrow, Stop } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useApi, useApiMutation } from '../hooks/useApi';
import { sessionAPI, subjectAPI } from '../services/api';

const sessionsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    case 'ADD_SESSION':
      return { ...state, sessions: [action.payload, ...state.sessions] };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(s => 
          s._id === action.payload._id ? action.payload : s
        )
      };
    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(s => s._id !== action.payload)
      };
    case 'SET_PAGINATION':
      return { ...state, pagination: action.payload };
    default:
      return state;
  }
};

const Sessions = () => {
  const [state, dispatch] = useReducer(sessionsReducer, {
    sessions: [],
    pagination: null
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSession, setActiveSession] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const { data: sessionsData, loading, error, refetch } = useApi(
    () => sessionAPI.getAll({ page: currentPage, limit: 10 }),
    [currentPage]
  );

  const { data: subjects } = useApi(() => subjectAPI.getAll());
  const { mutate: createSession } = useApiMutation(sessionAPI.create);
  const { mutate: updateSession } = useApiMutation(sessionAPI.update);
  const { mutate: deleteSession } = useApiMutation(sessionAPI.delete);

  const { control, handleSubmit, reset, formState: { errors }, setValue } = useForm({
    defaultValues: {
      subjectId: '',
      startTime: '',
      endTime: '',
      studyMethod: 'other',
      location: 'other',
      focusRating: 5,
      difficultyRating: 5,
      notes: '',
      totalBreakTime: 0,
      breakCount: 0,
    }
  });

  useEffect(() => {
    if (sessionsData) {
      dispatch({ type: 'SET_SESSIONS', payload: sessionsData.sessions });
      dispatch({ type: 'SET_PAGINATION', payload: sessionsData.pagination });
    }
  }, [sessionsData]);

  const handleOpenDialog = (session = null) => {
    setEditingSession(session);
    if (session) {
      const startTime = new Date(session.startTime);
      const endTime = new Date(session.endTime);
      
      setValue('subjectId', session.subjectId._id);
      setValue('startTime', startTime.toISOString().slice(0, 16));
      setValue('endTime', endTime.toISOString().slice(0, 16));
      setValue('studyMethod', session.studyMethod);
      setValue('location', session.location);
      setValue('focusRating', session.focusRating);
      setValue('difficultyRating', session.difficultyRating);
      setValue('notes', session.notes || '');
      setValue('totalBreakTime', session.totalBreakTime || 0);
      setValue('breakCount', session.breakCount || 0);
    } else {
      reset();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSession(null);
    reset();
  };

  const onSubmit = async (data) => {
    const sessionData = {
      ...data,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
    };

    let result;
    if (editingSession) {
      result = await updateSession(editingSession._id, sessionData);
      if (result.success) {
        dispatch({ type: 'UPDATE_SESSION', payload: result.data.session });
      }
    } else {
      result = await createSession(sessionData);
      if (result.success) {
        dispatch({ type: 'ADD_SESSION', payload: result.data.session });
      }
    }

    if (result.success) {
      handleCloseDialog();
      refetch();
    }
  };

  const handleDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      const result = await deleteSession(sessionId);
      if (result.success) {
        dispatch({ type: 'DELETE_SESSION', payload: sessionId });
      }
    }
  };

  const startStudySession = (subjectId) => {
    const now = new Date();
    setActiveSession({ subjectId, subject: subjects?.find(s => s._id === subjectId) });
    setStartTime(now);
  };

  const stopStudySession = () => {
    if (activeSession && startTime) {
      const now = new Date();
      setValue('subjectId', activeSession.subjectId);
      setValue('startTime', startTime.toISOString().slice(0, 16));
      setValue('endTime', now.toISOString().slice(0, 16));
      setActiveSession(null);
      setStartTime(null);
      handleOpenDialog();
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const studyMethods = [
    'reading', 'practice_problems', 'notes', 'video', 'discussion', 'research', 'review', 'other'
  ];

  const locations = [
    'library', 'home', 'cafe', 'classroom', 'outdoor', 'other'
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Study Sessions
        </Typography>
        <Box gap={2} display="flex">
          {activeSession ? (
            <Button
              variant="contained"
              color="error"
              startIcon={<Stop />}
              onClick={stopStudySession}
            >
              Stop Session ({activeSession.subject?.name})
            </Button>
          ) : (
            subjects && subjects.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Start Session</InputLabel>
                <Select
                  label="Start Session"
                  onChange={(e) => startStudySession(e.target.value)}
                  value=""
                  startAdornment={<PlayArrow />}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject._id} value={subject._id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )
          )}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Session
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {activeSession && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Active session: {activeSession.subject?.name} - Started at {startTime?.toLocaleTimeString()}
        </Alert>
      )}

      <Grid container spacing={3}>
        {state.sessions.map((session) => (
          <Grid item xs={12} md={6} lg={4} key={session._id}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        color: session.subjectId?.color || 'primary.main'
                      }}
                    >
                      {session.subjectId?.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(session.startTime).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(session)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(session._id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2">
                    {new Date(session.startTime).toLocaleTimeString([], { 
                      hour: '2-digit', minute: '2-digit' 
                    })} - {new Date(session.endTime).toLocaleTimeString([], { 
                      hour: '2-digit', minute: '2-digit' 
                    })}
                  </Typography>
                </Box>

                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip
                    label={formatTime(session.duration)}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={session.studyMethod.replace('_', ' ')}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={session.location}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Focus: {session.focusRating}/10
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Difficulty: {session.difficultyRating}/10
                    </Typography>
                  </Box>
                </Box>

                {session.notes && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    "{session.notes}"
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {state.pagination && state.pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={state.pagination.totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSession ? 'Edit Session' : 'Add New Session'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="subjectId"
                  control={control}
                  rules={{ required: 'Subject is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.subjectId}>
                      <InputLabel>Subject</InputLabel>
                      <Select {...field} label="Subject">
                        {subjects?.map((subject) => (
                          <MenuItem key={subject._id} value={subject._id}>
                            {subject.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="startTime"
                  control={control}
                  rules={{ required: 'Start time is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Start Time"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.startTime}
                      helperText={errors.startTime?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="endTime"
                  control={control}
                  rules={{ required: 'End time is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="End Time"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.endTime}
                      helperText={errors.endTime?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="studyMethod"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Study Method</InputLabel>
                      <Select {...field} label="Study Method">
                        {studyMethods.map((method) => (
                          <MenuItem key={method} value={method}>
                            {method.replace('_', ' ').toUpperCase()}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Location</InputLabel>
                      <Select {...field} label="Location">
                        {locations.map((location) => (
                          <MenuItem key={location} value={location}>
                            {location.toUpperCase()}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography component="legend">Focus Rating</Typography>
                <Controller
                  name="focusRating"
                  control={control}
                  render={({ field }) => (
                    <Rating
                      {...field}
                      max={10}
                      precision={1}
                      onChange={(_, value) => field.onChange(value || 5)}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography component="legend">Difficulty Rating</Typography>
                <Controller
                  name="difficultyRating"
                  control={control}
                  render={({ field }) => (
                    <Rating
                      {...field}
                      max={10}
                      precision={1}
                      onChange={(_, value) => field.onChange(value || 5)}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Notes (Optional)"
                      multiline
                      rows={3}
                      placeholder="Add any notes about this study session..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingSession ? 'Update' : 'Create'} Session
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Sessions;