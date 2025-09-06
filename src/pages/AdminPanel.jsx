import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const AdminPanel = () => {
  const [questions, setQuestions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'multiple_choice',
    options: [],
    category: '',
    required: false
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/api/questions');
      setQuestions(response.data);
    } catch (error) {
      showNotification('Failed to fetch questions', 'error');
    }
  };

  const handleDialogOpen = (question = null) => {
    if (question) {
      setSelectedQuestion(question);
      setFormData({
        questionText: question.questionText,
        questionType: question.questionType,
        options: question.options,
        category: question.category,
        required: question.required
      });
    } else {
      setSelectedQuestion(null);
      setFormData({
        questionText: '',
        questionType: 'multiple_choice',
        options: [],
        category: '',
        required: false
      });
    }
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedQuestion(null);
    setFormData({
      questionText: '',
      questionType: 'multiple_choice',
      options: [],
      category: '',
      required: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedQuestion) {
        await axios.put(`/api/questions/${selectedQuestion._id}`, formData);
        showNotification('Question updated successfully');
      } else {
        await axios.post('/api/questions', formData);
        showNotification('Question created successfully');
      }
      fetchQuestions();
      handleDialogClose();
    } catch (error) {
      showNotification('Operation failed', 'error');
    }
  };

  const handleDelete = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await axios.delete(`/api/questions/${questionId}`);
        showNotification('Question deleted successfully');
        fetchQuestions();
      } catch (error) {
        showNotification('Failed to delete question', 'error');
      }
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Questionnaire Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleDialogOpen()}
              >
                Add New Question
              </Button>
            </div>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Question</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Required</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question._id}>
                      <TableCell>{question.questionText}</TableCell>
                      <TableCell>{question.questionType}</TableCell>
                      <TableCell>{question.category}</TableCell>
                      <TableCell>{question.required ? 'Yes' : 'No'}</TableCell>
                      <TableCell align="right">
                        <Button
                          startIcon={<EditIcon />}
                          onClick={() => handleDialogOpen(question)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          startIcon={<DeleteIcon />}
                          color="error"
                          onClick={() => handleDelete(question._id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedQuestion ? 'Edit Question' : 'Add New Question'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Question Text"
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Question Type"
                  select
                  value={formData.questionType}
                  onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedQuestion ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleNotificationClose} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPanel;