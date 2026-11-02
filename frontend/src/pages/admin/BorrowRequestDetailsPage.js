// src/pages/admin/BorrowRequestDetailsPage.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Divider,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Book as BookIcon,
  CalendarToday as CalendarIcon,
  Check as CheckIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import axios from 'axios';

const colors = {
  primary: "#2e66a6",
  secondary: "#000000",
  accent: "#2e66a6",
  background: "#FFFFFF"
};

const BorrowRequestDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [request, setRequest] = useState(null);
  const [status, setStatus] = useState('pending');
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '' });
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (location.state?.request) {
      setRequest(location.state.request);
      setStatus(location.state.request.status);
    } else {
      navigate('/admin/borrow-requests');
    }
  }, [location, navigate]);

  const handleStatusUpdate = async () => {
    if (!request) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let data = {};
      
      switch (status) {
        case 'approved':
          endpoint = 'approve';
          data = { adminNotes };
          break;
        case 'rejected':
          endpoint = 'reject';
          data = { adminNotes };
          break;
        case 'returned':
          endpoint = 'return';
          break;
        default:
          return;
      }

      await axios.put(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/borrow/${request._id}/${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSnackbar({
        open: true,
        message: `Borrow request ${status} successfully! Student will be notified.`,
        severity: 'success'
      });
      
      // Update local request status
      setRequest(prev => ({ ...prev, status, adminNotes: adminNotes || prev.adminNotes }));
      setActionDialog({ open: false, type: '' });
      setAdminNotes('');
      
    } catch (error) {
      console.error('Error updating request:', error);
      const errorMessage = error.response?.data?.message || 'Error updating request';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus !== request.status) {
      setActionDialog({ open: true, type: newStatus });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'returned': return 'info';
      case 'return_requested': return 'secondary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBack = () => {
    navigate('/admin/borrow-requests');
  };

  if (!request) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar />
        <Box sx={{ flex: 1, ml: { xs: 0, md: '280px' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />

      <Box sx={{ 
        flex: 1, 
        ml: { xs: 0, md: '280px' }, 
        background: colors.background,
        minHeight: '100vh',
        py: 4
      }}>
        <Container maxWidth="lg">
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={handleBack}
              sx={{ mb: 2, color: colors.secondary }}
            >
              Back to Borrow Requests
            </Button>
            <Typography variant="h4" fontWeight="800" color={colors.secondary}>
              Borrow Request Details
            </Typography>
            <Typography variant="h6" color={colors.secondary} sx={{ opacity: 0.8 }}>
              View and manage this borrow request
            </Typography>
          </Box>

          <Divider sx={{ mb: 4, borderColor: colors.primary }} />

          {/* Book Information */}
          <Card sx={{ mb: 3, borderRadius: '12px', border: `1px solid ${colors.primary}` }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <BookIcon /> Book Information
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {request.book?.image ? (
                      <img
                        src={request.book.image}
                        alt={request.book.title}
                        style={{
                          width: 200,
                          height: 240,
                          objectFit: 'cover',
                          borderRadius: '12px',
                          border: `3px solid ${colors.primary}`
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 200,
                          height: 240,
                          backgroundColor: colors.primary,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `3px solid ${colors.primary}`
                        }}
                      >
                        <BookIcon sx={{ fontSize: 64, color: colors.secondary }} />
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Title
                      </Typography>
                      <Typography variant="h5" fontWeight="600">
                        {request.book?.title}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Author
                      </Typography>
                      <Typography variant="h6">
                        {request.book?.author}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        ISBN
                      </Typography>
                      <Typography variant="body1">
                        {request.book?.isbn}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Category
                      </Typography>
                      <Chip 
                        label={request.book?.category} 
                        sx={{ 
                          backgroundColor: colors.primary,
                          fontSize: '1rem',
                          padding: '8px 16px'
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Available Copies
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {request.book?.availableCopies || 0} / {request.book?.totalCopies || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Student Information */}
          <Card sx={{ mb: 3, borderRadius: '12px', border: `1px solid ${colors.primary}` }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PersonIcon /> Student Information
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Full Name
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {request.user?.fullName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Student ID
                      </Typography>
                      <Typography variant="body1">
                        {request.user?.studentId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {request.user?.email}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Course & Year Level
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {request.user?.course} • {request.user?.yearLevel}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Contact Number
                      </Typography>
                      <Typography variant="body1">
                        {request.user?.contact || 'Not provided'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {request.user?.address || 'Not provided'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Request Timeline */}
          <Card sx={{ mb: 3, borderRadius: '12px', border: `1px solid ${colors.primary}` }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <CalendarIcon /> Request Timeline
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Request Date
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {formatDate(request.requestDate)}
                      </Typography>
                    </Box>
                    {request.approvedDate && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Approved Date
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {formatDate(request.approvedDate)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Due Date
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {formatDate(request.dueDate) || 'Not set'}
                      </Typography>
                    </Box>
                    {request.returnDate && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Return Date
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {formatDate(request.returnDate)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>

              {/* Admin Notes Display */}
              {request.adminNotes && (
                <Alert 
                  severity={request.status === 'rejected' ? 'error' : 'info'} 
                  sx={{ mt: 3, borderRadius: 2 }}
                >
                  <Typography variant="body1" fontWeight="bold" gutterBottom>
                    Admin Notes / Reason for Status:
                  </Typography>
                  <Typography variant="body1">
                    {request.adminNotes}
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Status Update Section */}
          <Card sx={{ borderRadius: '12px', border: `1px solid ${colors.primary}` }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Update Request Status
              </Typography>
              
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="large">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="returned">Returned</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Chip 
                    label={status.charAt(0).toUpperCase() + status.slice(1)}
                    color={getStatusColor(status)}
                    sx={{ 
                      fontSize: '1.1rem', 
                      padding: '12px 24px',
                      fontWeight: '600'
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => handleStatusChange(status)}
                    disabled={status === request.status}
                    startIcon={<CheckIcon />}
                    sx={{
                      backgroundColor: status === 'approved' ? '#2e66a6' : 
                                     status === 'rejected' ? '#2e66a6' : 
                                     status === 'returned' ? '#2e66a6' : '#2e66a6',
                      '&:hover': {
                        backgroundColor: status === 'approved' ? '#2e66a6' : 
                                       status === 'rejected' ? '#2e66a6' : 
                                       status === 'returned' ? '#2e66a6' : '#2e66a6'
                      },
                      padding: '12px 24px',
                      fontSize: '1.1rem'
                    }}
                  >
                    Update Status
                  </Button>
                </Grid>
              </Grid>

              {/* Status Update Information */}
              {status !== request.status && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  {status === 'approved' && 'This will decrease the available copies of the book by 1.'}
                  {status === 'returned' && 'This will increase the available copies of the book by 1.'}
                  {status === 'rejected' && 'This will reject the borrow request without affecting book copies.'}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Status Update Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, type: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm {actionDialog.type?.charAt(0).toUpperCase() + actionDialog.type?.slice(1)} Request
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to <strong>{actionDialog.type}</strong> this borrow request?
          </Typography>
          
          {(actionDialog.type === 'approved' || actionDialog.type === 'rejected') && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Admin Notes (Optional)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="Add any notes or instructions for the student..."
            />
          )}
          
          {/* Email notification info */}
          <Alert severity="info" sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <EmailIcon sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body2" fontWeight="bold">
                Student Notification
              </Typography>
              <Typography variant="body2">
                The student will see your notes in their book details page:
                <br />
                <strong>{request.user?.email}</strong>
              </Typography>
            </Box>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setActionDialog({ open: false, type: '' })}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={updating}
            sx={{
              backgroundColor: actionDialog.type === 'approved' ? '#2e66a6' : 
                             actionDialog.type === 'rejected' ? '#2e66a6' : 
                             actionDialog.type === 'returned' ? '#2e66a6' : '#2e66a6',
            }}
          >
            {updating ? 'Processing...' : `Confirm ${actionDialog.type}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BorrowRequestDetailsPage;