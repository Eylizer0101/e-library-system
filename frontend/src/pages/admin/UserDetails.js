// src/pages/admin/UserDetails.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  Button,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Stack,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Book as BookIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';

// Updated Color Palette
const colors = {
  primary: "#2e66a6",  // Light pink
  secondary: "#000000", // Black
  accent: "#2e66a6",    // White
  background: "#FFFFFF",
  cardBg: "#FFFFFF",
  text: "#000000"
};

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch user details and borrow history
  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch user details with borrow history
      const userResponse = await axios.get(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Fetch user statistics
      const statsResponse = await axios.get(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/admin/users/${id}/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUser(userResponse.data.user);
      setBorrowHistory(userResponse.data.borrowHistory || []);
      setStats(statsResponse.data);

    } catch (error) {
      console.error('Error fetching user details:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching user details',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'returned': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar />
        <Box sx={{ flex: 1, ml: { xs: 0, md: '280px' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar />
        <Box sx={{ flex: 1, ml: { xs: 0, md: '280px' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h6">User not found</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        ml: { xs: 0, md: '280px' }, 
        background: colors.background,
        minHeight: '100vh',
        py: 4
      }}>
        <Container maxWidth="lg">
          {/* Header Section */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Button
                component={RouterLink}
                to="/admin/users"
                startIcon={<BackIcon />}
                sx={{
                  color: colors.secondary,
                  mb: 2,
                  textTransform: 'none'
                }}
              >
                Back to Manage Users
              </Button>
              <Typography variant="h4" fontWeight="800" color={colors.secondary}>
                User Details
              </Typography>
              <Typography variant="h6" color={colors.secondary} sx={{ opacity: 0.8 }}>
                Complete information about {user.fullName}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 4, borderColor: colors.primary }} />

          <Grid container spacing={4}>
            {/* User Information Section */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                {/* User Profile Card */}
                <Card sx={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${colors.primary}`, p: 3 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        backgroundColor: colors.primary,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        mb: 2
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 40, color: colors.secondary }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" color={colors.secondary}>
                      {user.fullName}
                    </Typography>
                    <Typography variant="body2" color={colors.secondary} sx={{ opacity: 0.8 }}>
                      {user.studentId}
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon sx={{ mr: 2, color: colors.secondary, opacity: 0.7 }} />
                      <Box>
                        <Typography variant="body2" color={colors.secondary} sx={{ opacity: 0.7 }}>
                          Email
                        </Typography>
                        <Typography variant="body1" color={colors.secondary}>
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SchoolIcon sx={{ mr: 2, color: colors.secondary, opacity: 0.7 }} />
                      <Box>
                        <Typography variant="body2" color={colors.secondary} sx={{ opacity: 0.7 }}>
                          Course & Year
                        </Typography>
                        <Typography variant="body1" color={colors.secondary}>
                          {user.course} - {user.yearLevel}
                        </Typography>
                      </Box>
                    </Box>

                    {user.contact && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ mr: 2, color: colors.secondary, opacity: 0.7 }} />
                        <Box>
                          <Typography variant="body2" color={colors.secondary} sx={{ opacity: 0.7 }}>
                            Contact
                          </Typography>
                          <Typography variant="body1" color={colors.secondary}>
                            {user.contact}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {user.address && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ mr: 2, color: colors.secondary, opacity: 0.7 }} />
                        <Box>
                          <Typography variant="body2" color={colors.secondary} sx={{ opacity: 0.7 }}>
                            Address
                          </Typography>
                          <Typography variant="body1" color={colors.secondary}>
                            {user.address}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Card>

                {/* Statistics Card */}
                <Card sx={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${colors.primary}`, p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color={colors.secondary} mb={2}>
                    Borrow Statistics
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color={colors.secondary}>
                        Total Borrows
                      </Typography>
                      <Chip 
                        label={stats?.totalBorrows || 0} 
                        sx={{ 
                          backgroundColor: colors.primary,
                          color: colors.secondary,
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color={colors.secondary}>
                        Pending Requests
                      </Typography>
                      <Chip 
                        label={stats?.pendingBorrows || 0} 
                        color="warning"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color={colors.secondary}>
                        Active Borrows
                      </Typography>
                      <Chip 
                        label={stats?.approvedBorrows || 0} 
                        color="info"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color={colors.secondary}>
                        Returned Books
                      </Typography>
                      <Chip 
                        label={stats?.returnedBorrows || 0} 
                        color="success"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  </Stack>
                </Card>
              </Stack>
            </Grid>

            {/* Borrow History Section */}
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${colors.primary}` }}>
                <Box sx={{ p: 3, backgroundColor: colors.primary }}>
                  <Typography variant="h5" fontWeight="bold" color={colors.secondary}>
                    Borrow History
                  </Typography>
                  <Typography variant="body2" color={colors.secondary} sx={{ opacity: 0.8 }}>
                    Complete record of borrowed books
                  </Typography>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: colors.primary }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Book Title</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Author</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Request Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Due Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {borrowHistory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <BookIcon sx={{ fontSize: 40, color: colors.primary, mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              No borrow history found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                              This user hasn't borrowed any books yet.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        borrowHistory.map((borrow) => (
                          <TableRow key={borrow._id} hover sx={{ '&:hover': { backgroundColor: colors.primary } }}>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="bold" color={colors.secondary}>
                                {borrow.book?.title || 'Book not found'}
                              </Typography>
                              <Typography variant="body2" color={colors.secondary} sx={{ opacity: 0.8, fontSize: '0.8rem' }}>
                                ISBN: {borrow.book?.isbn || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color={colors.secondary}>
                                {borrow.book?.author || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color={colors.secondary}>
                                {formatDate(borrow.requestDate)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color={colors.secondary}>
                                {borrow.dueDate ? formatDate(borrow.dueDate) : 'Not set'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={borrow.status.charAt(0).toUpperCase() + borrow.status.slice(1)}
                                color={getStatusColor(borrow.status)}
                                size="small"
                                sx={{ fontWeight: '500' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

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

export default UserDetails;