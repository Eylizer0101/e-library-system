import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Book as BookIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Cancel,
  Visibility,
  Inventory as ReturnIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- Color Palette ---
const colors = {
  primary: "#2e66a6",
  secondary: '#000000',
  background: "#FFFFFF",
  cardBg: '#FFFFFF',
  text: '#000000',
  statusPending: "#2e66a6", // Orange
  statusApproved: "#2e66a6", // Green
  statusRejected: "#2e66a6", // Red
  statusReturned: "#2e66a6", // Blue
  statusReturnRequested: "#2e66a6" // Orange for return requested
};

// --- Main Component ---
const MyBorrowedBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [cancellingBooks, setCancellingBooks] = useState(new Set());
  const navigate = useNavigate();

  // Effect to fetch data on component mount
  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  // API Call: Fetch borrowed books
  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/borrow/my-books`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Real borrowed books data:', response.data);
      setBorrowedBooks(response.data);
      
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError('Failed to load borrowed books. Please try again.');
      }
      setBorrowedBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // API Call: Handle Cancel Request (for 'pending' status)
  const handleCancelRequest = async (borrowId) => {
    try {
      setCancellingBooks(prev => new Set(prev).add(borrowId));
      
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

      fetchBorrowedBooks(); // Refresh list
      
    } catch (error) {
      console.error('Error cancelling borrow request:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to cancel request. Please try again.',
        severity: 'error'
      });
    } finally {
      setCancellingBooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(borrowId);
        return newSet;
      });
    }
  };

  // API Call: Handle Return Book Request (for 'approved' status)
  const handleReturnRequest = async (borrowId) => {
    try {
      setCancellingBooks(prev => new Set(prev).add(borrowId));
      
      const token = localStorage.getItem('token');
      
      await axios.put(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/borrow/${borrowId}/request-return`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSnackbar({
        open: true,
        message: 'Return request submitted successfully! Waiting for admin approval.',
        severity: 'success'
      });

      fetchBorrowedBooks(); // Refresh list
      
    } catch (error) {
      console.error('Error requesting return:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit return request. Please try again.',
        severity: 'error'
      });
    } finally {
      setCancellingBooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(borrowId);
        return newSet;
      });
    }
  };

  // Handle View Details - Navigate to details page
  const handleViewDetails = (borrowId) => {
    navigate(`/borrowed-book-details/${borrowId}`);
  };

  // Helper: Status Chip generator
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
      },
      return_requested: {
        label: 'Return Requested',
        color: colors.statusReturnRequested,
        icon: <ReturnIcon />
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
          fontSize: '0.75rem', 
          height: '28px', 
          '& .MuiChip-icon': {
            color: '#2e66a6'
          }
        }}
      />
    );
  };

  // Helper: Date formatter (DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helper: Calculate days remaining until due date
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
  
  // Custom component for a clean detail label/value pair
  const DetailItem = ({ label, value, color = colors.text, fontWeight = 'normal' }) => (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" fontWeight="bold" color={colors.secondary} sx={{ opacity: 0.7 }}>
        {label}:
      </Typography>
      <Typography variant="body2" color={color} fontWeight={fontWeight}>
        {value}
      </Typography>
    </Box>
  );

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = `https://via.placeholder.com/200x300/F8D6D0/000000?text=No+Image`;
  };

  // --- Loading State Render ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: colors.background }}>
        <CircularProgress sx={{ color: colors.secondary }} />
      </Box>
    );
  }

  // --- Main Render ---
  return (
    <Box sx={{
      background: colors.background,
      minHeight: '100vh',
      py: 12
    }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Stack alignItems="center" spacing={2} mb={4}>
          <Typography
            variant="h3"
            fontWeight="900"
            color={colors.secondary}
            textAlign="center"
            gutterBottom
            sx={{ letterSpacing: 2 }}
          >
            My Borrowed Books
          </Typography>
          <Typography
            variant="h6"
            color={colors.text}
            textAlign="center"
            sx={{ opacity: 0.9, mb: 2 }}
          >
            Track your book borrow requests and current loans
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', maxWidth: 600, color: colors.secondary, backgroundColor: colors.primary }}>
              {error}
            </Alert>
          )}

          {/* Summary Stats */}
          <Box sx={{ p: 2, backgroundColor: colors.primary, borderRadius: '8px', border: `2px solid ${colors.secondary}` }}>
            <Stack direction="row" spacing={4} justifyContent="center">
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold" color={colors.secondary}>
                  {borrowedBooks.length}
                </Typography>
                <Typography variant="body2" color={colors.secondary}>
                  Total Requests
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold" color={colors.statusApproved}>
                  {borrowedBooks.filter(book => book.status === 'approved').length}
                </Typography>
                <Typography variant="body2" color={colors.secondary}>
                  Approved
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold" color={colors.statusPending}>
                  {borrowedBooks.filter(book => book.status === 'pending').length}
                </Typography>
                <Typography variant="body2" color={colors.secondary}>
                  Pending
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold" color={colors.statusReturned}>
                  {borrowedBooks.filter(book => book.status === 'returned').length}
                </Typography>
                <Typography variant="body2" color={colors.secondary}>
                  Returned
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold" color={colors.statusReturnRequested}>
                  {borrowedBooks.filter(book => book.status === 'return_requested').length}
                </Typography>
                <Typography variant="body2" color={colors.secondary}>
                  Return Requested
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ width: "90%", mb: 4, borderColor: colors.primary, mx: 'auto', borderBottomWidth: 2 }} />

        {/* Borrowed Books Grid */}
        {borrowedBooks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <BookIcon sx={{ fontSize: 64, color: colors.primary, mb: 2, border: `2px solid ${colors.secondary}`, borderRadius: '50%', p: 2 }} />
            <Typography variant="h6" color={colors.text} gutterBottom>
              No Borrowed Books Yet
            </Typography>
            <Typography variant="body2" color={colors.text} sx={{ opacity: 0.7, mb: 3 }}>
              You haven't borrowed any books yet. Start by browsing our catalog!
            </Typography>
            <Button
              component={RouterLink}
              to="/book-catalog"
              variant="contained"
              sx={{
                backgroundColor: colors.secondary,
                color: '#2e66a6',
                borderRadius: '8px',
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: '700',
                '&:hover': {
                  backgroundColor: colors.primary,
                  color: colors.secondary,
                }
              }}
            >
              Browse Books
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {borrowedBooks.map((borrowedBook) => {
              const daysRemaining = borrowedBook.dueDate ? calculateDaysRemaining(borrowedBook.dueDate) : null;
              const isOverdue = daysRemaining !== null && daysRemaining < 0 && borrowedBook.status === 'approved';
              const imageSrc = borrowedBook.book?.image || `https://via.placeholder.com/200x300/F8D6D0/000000?text=No+Image`; 

              return (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  lg={3}
                  key={borrowedBook._id}
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Card
                    sx={{
                      height: 600,
                      width: 320,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px', 
                      backgroundColor: colors.cardBg,
                      boxShadow: isOverdue 
                        ? `0 0 15px ${colors.statusRejected}` 
                        : `0 6px 15px rgba(0,0,0,0.1)`, 
                      border: isOverdue ? `3px solid ${colors.statusRejected}` : `2px solid ${colors.secondary}`, 
                      transition: 'transform 0.3s, box-shadow 0.3s, border 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 10px 25px rgba(0,0,0,0.2)`,
                      },
                    }}
                  >
                    {/* Book Image - FIXED: Hindi mapuputol ang image */}
                    <Box 
                      sx={{
                        width: '100%',
                        height: 220,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderBottom: `2px solid ${colors.secondary}`,
                        backgroundColor: colors.primary,
                        borderTopLeftRadius: '14px',
                        borderTopRightRadius: '14px',
                      }}
                    >
                      <CardMedia
                        component="img"
                        sx={{
                          objectFit: 'contain', // CHANGED: from 'cover' to 'contain' para hindi maputol
                          width: '100%',
                          height: '100%',
                          backgroundColor: colors.primary,
                        }}
                        image={imageSrc}
                        alt={borrowedBook.book?.title}
                        onError={handleImageError}
                      />
                    </Box>

                    <CardContent sx={{ 
                      flex: 1, 
                      p: 2.5, 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                        
                      {/* Status Chip */}
                      <Box sx={{ alignSelf: 'flex-end', mb: 1 }}>
                          {getStatusChip(borrowedBook.status)}
                      </Box>

                      {/* Title and Author */}
                      <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="h6" 
                            fontWeight="900"
                            color={colors.secondary}
                            sx={{ 
                              mb: 0.5, 
                              lineHeight: 1.2,
                              fontSize: '1rem',
                              minHeight: '2.8em',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                        >
                            <span style={{fontWeight: 'normal', fontSize: '0.9rem'}}>Title:</span>  {borrowedBook.book?.title || 'Unknown Book'}
                        </Typography>
                        <Typography
                            variant="body2" 
                            color={colors.text}
                            sx={{ 
                              opacity: 0.8, 
                              mb: 1, 
                              fontStyle: 'italic', 
                              fontWeight: '500',
                              height: '1.3em',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                        >
                            <span style={{fontWeight: 'bold', fontStyle: 'normal'}}>Author:</span>  {borrowedBook.book?.author || 'Unknown Author'}
                        </Typography>
                        <Chip
                            label={borrowedBook.book?.category || 'Uncategorized'}
                            size="small"
                            sx={{
                                backgroundColor: colors.primary,
                                color: colors.secondary,
                                fontWeight: '600',
                                fontSize: '0.7rem',
                                border: `1px solid ${colors.secondary}`,
                                width: 'fit-content',
                                mb: 1
                            }}
                        />
                      </Box>

                      <Divider sx={{ my: 1, borderColor: colors.primary }} />

                      {/* Borrowing Details */}
                      <Box sx={{ my: 1, flexGrow: 1 }}>
                          <DetailItem 
                              label="Request Date" 
                              value={formatDate(borrowedBook.requestDate)} 
                          />
                          {borrowedBook.status === 'approved' && (
                              <DetailItem 
                                  label="Approved Date" 
                                  value={formatDate(borrowedBook.approvedDate)} 
                              />
                          )}
                          
                          {/* Due Date with Warning */}
                          {borrowedBook.dueDate && (borrowedBook.status === 'approved' || borrowedBook.status === 'return_requested') && (
                              <Box sx={{ mb: 1 }}>
                                  <Typography variant="caption" fontWeight="bold" color={colors.secondary} sx={{ opacity: 0.7 }}>
                                      Due Date:
                                  </Typography>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                      <Typography 
                                          variant="body2" 
                                          color={isOverdue ? colors.statusRejected : colors.secondary}
                                          fontWeight="bold"
                                      >
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
                                                  fontSize: '0.65rem',
                                                  height: '20px'
                                              }}
                                          />
                                      )}
                                  </Stack>
                              </Box>
                          )}
                          {borrowedBook.status === 'returned' && (
                              <DetailItem 
                                  label="Return Date" 
                                  value={formatDate(borrowedBook.returnDate)} 
                              />
                          )}
                          {borrowedBook.status === 'return_requested' && (
                              <DetailItem 
                                  label="Return Request Date" 
                                  value={formatDate(borrowedBook.returnRequestDate)} 
                              />
                          )}
                      </Box>
                      
                      {/* Action Buttons */}
                      <Stack 
                          direction="row" 
                          spacing={1} 
                          mt='auto' 
                          pt={2}
                      >
                          
                          {/* Cancel Button (Pending Status) */}
                          {borrowedBook.status === 'pending' && (
                              <Button
                                  variant="outlined"
                                  size="small"
                                  disabled={cancellingBooks.has(borrowedBook._id)}
                                  onClick={() => handleCancelRequest(borrowedBook._id)}
                                  startIcon={cancellingBooks.has(borrowedBook._id) ? <CircularProgress size={16} /> : <Cancel />}
                                  sx={{
                                      borderColor: colors.secondary,
                                      color: colors.secondary,
                                      borderRadius: '8px',
                                      textTransform: 'uppercase',
                                      fontWeight: '700',
                                      py: 0.8,
                                      flex: 1,
                                      '&:hover': {
                                          backgroundColor: colors.primary,
                                          borderColor: colors.secondary,
                                      }
                                  }}
                              >
                                  {cancellingBooks.has(borrowedBook._id) ? 'Cancelling...' : 'Cancel'}
                              </Button>
                          )}

                          {/* Return Request Button (Approved Status) */}
                          {borrowedBook.status === 'approved' && (
                              <Button
                                  variant="contained"
                                  size="small"
                                  disabled={cancellingBooks.has(borrowedBook._id)}
                                  onClick={() => handleReturnRequest(borrowedBook._id)}
                                  startIcon={cancellingBooks.has(borrowedBook._id) ? <CircularProgress size={16} /> : <ReturnIcon />}
                                  sx={{
                                      backgroundColor: colors.secondary,
                                      color: '#2e66a6',
                                      borderRadius: '8px',
                                      textTransform: 'uppercase',
                                      fontWeight: '700',
                                      py: 0.8,
                                      flex: 1,
                                      '&:hover': {
                                          backgroundColor: colors.primary,
                                          color: colors.secondary,
                                          borderColor: colors.secondary
                                      }
                                  }}
                              >
                                  {cancellingBooks.has(borrowedBook._id) ? 'Requesting...' : 'Request Return'}
                              </Button>
                          )}

                          {/* Return Requested Message (Return Requested Status) */}
                          {borrowedBook.status === 'return_requested' && (
                              <Button
                                  variant="outlined"
                                  size="small"
                                  disabled
                                  startIcon={<ReturnIcon />}
                                  sx={{
                                      borderColor: colors.statusReturnRequested,
                                      color: colors.statusReturnRequested,
                                      borderRadius: '8px',
                                      textTransform: 'uppercase',
                                      fontWeight: '700',
                                      py: 0.8,
                                      flex: 1,
                                  }}
                              >
                                  Return Requested
                              </Button>
                          )}

                          {/* View Details Button */}
                          <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewDetails(borrowedBook._id)}
                              sx={{
                                  borderColor: colors.secondary,
                                  color: colors.secondary,
                                  borderRadius: '8px',
                                  textTransform: 'none',
                                  fontWeight: '700',
                                  py: 0.8,
                                  flex: 1,
                                  '&:hover': {
                                      backgroundColor: colors.primary,
                                      borderColor: colors.secondary,
                                  }
                              }}
                          >
                              Details
                          </Button>

                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Navigation Button */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            component={RouterLink}
            to="/book-catalog"
            variant="contained"
            startIcon={<BookIcon />}
            sx={{
              backgroundColor: colors.secondary,
              color: '#2e66a6',
              borderRadius: '8px',
              px: 4,
              py: 1.5,
              textTransform: 'uppercase',
              fontWeight: '700',
              boxShadow: `0 4px 10px rgba(0,0,0,0.3)`,
              '&:hover': {
                backgroundColor: colors.primary,
                color: colors.secondary,
                borderColor: colors.secondary,
                boxShadow: `0 6px 15px rgba(0,0,0,0.4)`,
              }
            }}
          >
            Browse More Books
          </Button>
        </Box>
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

export default MyBorrowedBooks;