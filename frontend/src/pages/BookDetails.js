import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Book as BookIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

// --- Color Palette ---
const colors = {
  primary: "#2e66a6",
  secondary: '#000000',
  background: "#FFFFFF",
  cardBg: '#FFFFFF',
  text: '#000000',
  statusPending: "#2e66a6",
  statusApproved: "#2e66a6",
  statusRejected: "#2e66a6",
  statusReturned: "#2e66a6"
};

const BookDetails = () => {
  const { borrowId } = useParams();
  const navigate = useNavigate();
  const [borrowedBook, setBorrowedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBorrowedBookDetails();
  }, [borrowId]);

  const fetchBorrowedBookDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await axios.get(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/borrow/${borrowId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setBorrowedBook(response.data);

    } catch (error) {
      console.error('Error fetching borrowed book details:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError('Failed to load book details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');

      await axios.delete(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/borrow/${borrowId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSnackbar({
        open: true,
        message: 'Borrow request cancelled successfully!',
        severity: 'success'
      });

      // Redirect back to borrowed books page after successful cancellation
      setTimeout(() => {
        navigate('/my-borrowed');
      }, 1500);

    } catch (error) {
      console.error('Error cancelling borrow request:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to cancel request. Please try again.',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReturnBook = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');

      await axios.put(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/borrow/${borrowId}/return`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSnackbar({
        open: true,
        message: 'Book returned successfully!',
        severity: 'success'
      });

      // Redirect back to borrowed books page after successful return
      setTimeout(() => {
        navigate('/my-borrowed');
      }, 1500);

    } catch (error) {
      console.error('Error returning book:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to return book. Please try again.',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: {
        label: 'Pending Approval',
        color: colors.statusPending,
        icon: <PendingIcon />
      },
      approved: {
        label: 'Approved',
        color: colors.statusApproved,
        icon: <CheckCircleIcon />
      },
      rejected: {
        label: 'Rejected',
        color: colors.statusRejected,
        icon: <CancelIcon />
      },
      returned: {
        label: 'Returned',
        color: colors.statusReturned,
        icon: <CheckCircleIcon />
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        sx={{
          backgroundColor: config.color,
          color: '#2e66a6',
          fontWeight: '700',
          fontSize: '0.9rem', // Smaller font size
          height: '35px', // Smaller height
          padding: '0 10px',
          '& .MuiChip-icon': {
            color: '#2e66a6',
            fontSize: '1.1rem'
          }
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: colors.background }}>
        <CircularProgress sx={{ color: colors.secondary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', background: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            component={RouterLink}
            to="/my-borrowed"
            startIcon={<ArrowBackIcon />}
            variant="contained"
          >
            Back to My Borrowed Books
          </Button>
        </Container>
      </Box>
    );
  }

  if (!borrowedBook) {
    return (
      <Box sx={{ minHeight: '100vh', background: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h5" textAlign="center" color={colors.text}>
            Book not found
          </Typography>
          <Button
            component={RouterLink}
            to="/my-borrowed"
            startIcon={<ArrowBackIcon />}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Back to My Borrowed Books
          </Button>
        </Container>
      </Box>
    );
  }

  const daysRemaining = borrowedBook.dueDate ? calculateDaysRemaining(borrowedBook.dueDate) : null;
  const isOverdue = daysRemaining !== null && daysRemaining < 0 && borrowedBook.status === 'approved';
  const imageSrc = borrowedBook.book?.image || `https://via.placeholder.com/250x350/F8D6D0/000000?text=No+Image`;

  return (
    <Box sx={{
      background: colors.background,
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="md">
        {/* Back Button */}
        <Button
          component={RouterLink}
          to="/my-borrowed"
          startIcon={<ArrowBackIcon />}
          sx={{
            color: colors.secondary,
            fontWeight: '700',
            mb: 3,
            '&:hover': {
              backgroundColor: colors.primary,
            }
          }}
        >
          Back to My Borrowed Books
        </Button>

        <Paper
          elevation={8}
          sx={{
            borderRadius: '12px',
            backgroundColor: colors.cardBg,
            border: `2px solid ${colors.secondary}`,
            overflow: 'hidden',
            mb: 4
          }}
        >
          <Grid container>
            {/* Book Image Section */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: colors.primary,
                  height: '100%',
                  borderRight: { md: `2px solid ${colors.secondary}` },
                  borderBottom: { xs: `2px solid ${colors.secondary}`, md: 'none' }
                }}
              >
                <Box
                  component="img"
                  src={imageSrc}
                  alt={borrowedBook.book?.title}
                  sx={{
                    width: '100%',
                    maxWidth: '220px',
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: `2px solid ${colors.secondary}`,
                    backgroundColor: '#FFFFFF'
                  }}
                />

                {/* Status Chip */}
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  {getStatusChip(borrowedBook.status)}
                </Box>

                {/* Due Date Warning */}
                {isOverdue && (
                  <Alert severity="error" sx={{ mt: 2, width: '100%', fontWeight: 'bold' }}>
                    OVERDUE! Return now.
                  </Alert>
                )}
              </Box>
            </Grid>

            {/* Book Details Section */}
            <Grid item xs={12} md={7}>
              <Box sx={{ p: 3 }}>
                {/* Book Title and Author */}
                <Typography variant="h4" fontWeight="900" color={colors.secondary} gutterBottom>
                  Title: {borrowedBook.book?.title || 'Unknown Book'}
                </Typography>
                <Typography variant="h6" color={colors.text} sx={{ fontStyle: 'italic', mb: 2 }}>
                  Author:  {borrowedBook.book?.author || 'Unknown Author'}
                </Typography>

                <Chip
                  label={borrowedBook.book?.category || 'Uncategorized'}
                  sx={{
                    backgroundColor: colors.primary,
                    color: colors.secondary,
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    border: `1px solid ${colors.secondary}`,
                    padding: '4px 12px',
                    mb: 3
                  }}
                />

                <Divider sx={{ borderColor: colors.primary, mb: 3 }} />

                {/* Admin Notes Section */}
                {borrowedBook.adminNotes && (
                  <Alert 
                    severity={borrowedBook.status === 'rejected' ? 'error' : 'info'} 
                    sx={{ borderRadius: 2, mb: 3, p: 2 }}
                  >
                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                      Admin Notes / Reason for Status:
                    </Typography>
                    <Typography variant="body1">
                      {borrowedBook.adminNotes}
                    </Typography>
                  </Alert>
                )}

                {/* Borrowing Timeline */}
                <Typography variant="h6" fontWeight="bold" color={colors.secondary} gutterBottom>
                  Borrowing Timeline
                </Typography>
                <Stack spacing={1.5} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight="bold" color={colors.secondary}>
                      Request Date:
                    </Typography>
                    <Typography variant="body1" color={colors.text}>
                      {formatDate(borrowedBook.requestDate)}
                    </Typography>
                  </Box>

                  {borrowedBook.approvedDate && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight="bold" color={colors.secondary}>
                        Approved Date:
                      </Typography>
                      <Typography variant="body1" color={colors.text}>
                        {formatDate(borrowedBook.approvedDate)}
                      </Typography>
                    </Box>
                  )}

                  {borrowedBook.dueDate && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight="bold" color={isOverdue ? colors.statusRejected : colors.secondary}>
                        Due Date:
                      </Typography>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body1" color={isOverdue ? colors.statusRejected : colors.text} fontWeight="bold">
                          {formatDate(borrowedBook.dueDate)}
                        </Typography>
                        {daysRemaining !== null && (
                          <Chip
                            label={isOverdue ? `OVERDUE ${Math.abs(daysRemaining)} days` : (daysRemaining === 0 ? 'DUE TODAY' : `${daysRemaining} days left`)}
                            size="small"
                            sx={{
                              backgroundColor: isOverdue ? colors.statusRejected : (daysRemaining <= 3 && daysRemaining > 0 ? colors.statusPending : colors.statusApproved),
                              color: '#2e66a6',
                              fontWeight: '700',
                              fontSize: '0.7rem',
                              height: '20px',
                              mt: 0.5
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {borrowedBook.returnDate && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight="bold" color={colors.secondary}>
                        Return Date:
                      </Typography>
                      <Typography variant="body1" color={colors.text}>
                        {formatDate(borrowedBook.returnDate)}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                {/* Additional Book Info */}
                <Divider sx={{ borderColor: colors.primary, mb: 3 }} />

                <Typography variant="h6" fontWeight="bold" color={colors.secondary} gutterBottom>
                  Book Information
                </Typography>
                <Stack spacing={1.5} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight="bold" color={colors.secondary}>
                      ISBN:
                    </Typography>
                    <Typography variant="body1" color={colors.text}>
                      {borrowedBook.book?.isbn || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight="bold" color={colors.secondary}>
                      Publisher:
                    </Typography>
                    <Typography variant="body1" color={colors.text}>
                      {borrowedBook.book?.publisher || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight="bold" color={colors.secondary}>
                      Published Year:
                    </Typography>
                    <Typography variant="body1" color={colors.text}>
                      {borrowedBook.book?.publishedYear || 'N/A'}
                    </Typography>
                  </Box>
                </Stack>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
                  {/* Cancel Button for Pending Status */}
                  {borrowedBook.status === 'pending' && (
                    <Button
                      variant="contained"
                      onClick={handleCancelRequest}
                      disabled={processing}
                      startIcon={processing ? <CircularProgress size={20} sx={{ color: '#2e66a6' }} /> : <CancelIcon />}
                      sx={{
                        backgroundColor: colors.statusRejected,
                        color: '#2e66a6',
                        borderRadius: '8px',
                        px: 3,
                        py: 1,
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        '&:hover': {
                          backgroundColor: colors.primary,
                          color: colors.statusRejected,
                        }
                      }}
                    >
                      {processing ? 'Cancelling...' : 'Cancel Request'}
                    </Button>
                  )}

                  {/* Return Button for Approved Status */}
                  {borrowedBook.status === 'approved' && (
                    <Button
                      variant="contained"
                      onClick={handleReturnBook}
                      disabled={processing}
                      startIcon={processing ? <CircularProgress size={20} sx={{ color: '#2e66a6' }} /> : <CheckCircleIcon />}
                      sx={{
                        backgroundColor: colors.statusApproved,
                        color: '#2e66a6',
                        borderRadius: '8px',
                        px: 3,
                        py: 1,
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        '&:hover': {
                          backgroundColor: colors.primary,
                          color: colors.statusApproved,
                        }
                      }}
                    >
                      {processing ? 'Returning...' : 'Mark as Returned'}
                    </Button>
                  )}

                  {/* Back Button */}
                  <Button
                    component={RouterLink}
                    to="/my-borrowed"
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      borderColor: colors.secondary,
                      color: colors.secondary,
                      borderRadius: '8px',
                      px: 3,
                      py: 1,
                      textTransform: 'uppercase',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      '&:hover': {
                        backgroundColor: colors.primary,
                        borderColor: colors.secondary,
                      }
                    }}
                  >
                    Back
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default BookDetails;