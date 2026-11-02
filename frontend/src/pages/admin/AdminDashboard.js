import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Collapse
} from '@mui/material';
import {
  Book as BookIcon,
  People as PeopleIcon,
  Assignment as RequestIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  Inventory as ReturnedIcon,
  Visibility as ViewIcon,
  FilterList,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';

// Updated Color Palette
const colors = {
  primary: "#2e66a6",
  secondary: "#000000",
  accent: "#2e66a6",
  background: "#FFFFFF",
  cardBg: "#FFFFFF",
  text: "#000000"
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all'
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const navigate = useNavigate();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      // Fetch dashboard statistics
      const statsResponse = await axios.get(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setStats(statsResponse.data);

      // Fetch recent borrow requests
      const requestsResponse = await axios.get(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/admin/borrow-requests?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setRecentRequests(requestsResponse.data || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      dateRange: 'all'
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.status !== 'all' || filters.dateRange !== 'all';

  // Filter recent requests based on filters
  const filteredRequests = recentRequests.filter(request => {
    // Status filter
    const matchesStatus = filters.status === 'all' || request.status === filters.status;
    
    // Date range filter
    let matchesDateRange = true;
    if (filters.dateRange !== 'all' && request.requestDate) {
      const requestDate = new Date(request.requestDate);
      const today = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          matchesDateRange = requestDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          matchesDateRange = requestDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          matchesDateRange = requestDate >= monthAgo;
          break;
        default:
          matchesDateRange = true;
      }
    }
    
    return matchesStatus && matchesDateRange;
  });

  // Handle view details
  const handleViewDetails = (request) => {
    navigate('/admin/borrow-request-details', { state: { request } });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status chip color
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

  // Get status text
  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <PendingIcon />;
      case 'approved': return <ApprovedIcon />;
      case 'rejected': return <RejectedIcon />;
      case 'returned': return <ReturnedIcon />;
      default: return <RequestIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar />
        <Box sx={{
          flex: 1,
          ml: { xs: 0, md: '280px' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // --- COMMON CARD STYLES FOR UNIFORM SIZE (Ito ang nagpapa-pantay ng Taas) ---
  const uniformCardStyle = {
    // Para palakihin/liitan ang Taas, i-adjust ang p at minHeight
    p: 2, // Adjusted padding slightly for a moderate size
    minHeight: 180, // **Fixed Minimum Height para Pantay ang Taas**
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',

    // Design Styles
    borderRadius: '16px',
    backgroundColor: colors.primary,
    border: `3px solid ${colors.secondary}`,
    textAlign: 'center',
    boxShadow: `1px 1px 0px ${colors.secondary}`, 
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'translate(-4px, -4px)',
      boxShadow: `12px 12px 0px ${colors.secondary}`
    }
  };
  // -------------------------------------------------------------------------

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
        <Container maxWidth="xl">
          {/* Header Section */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" fontWeight="800" color={colors.secondary}>
                Admin Dashboard 📚
              </Typography>
              <Typography variant="h6" color={colors.secondary} sx={{ opacity: 0.8 }}>
                Overview of library management system
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 4, borderColor: colors.primary }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Statistics Cards - Uniform Size and Layout */}
          {stats && (
            <Grid 
              container 
              spacing={8} // Adjusted spacing slightly
              justifyContent="center" 
              sx={{ mb: 6 }}
            >
              {/* Total Approved Card */}
              <Grid item xs={12} sm={6} md={3}> {/* **Ginawang md=3 para Pantay ang Lapad at Apat sa Isang Linya** */}
                <Card sx={uniformCardStyle}>
                  <ApprovedIcon sx={{ fontSize: 60, color: colors.secondary, mb: 2 }} />
                  <Typography variant="h3" fontWeight="900" color={colors.secondary}>
                    {stats.approvedRequests}
                  </Typography>
                  <Typography variant="h6" color={colors.secondary} sx={{ opacity: 0.9, mt: 1 }}>
                    Approved Requests
                  </Typography>
                </Card>
              </Grid>

              {/* Total Pending Card */}
              <Grid item xs={12} sm={6} md={3}> {/* Pantay na Lapad */}
                <Card sx={uniformCardStyle}>
                  <PendingIcon sx={{ fontSize: 60, color: colors.secondary, mb: 2 }} />
                  <Typography variant="h3" fontWeight="900" color={colors.secondary}>
                    {stats.pendingRequests}
                  </Typography>
                  <Typography variant="h6" color={colors.secondary} sx={{ opacity: 0.9, mt: 1 }}>
                    Pending Requests
                  </Typography>
                </Card>
              </Grid>

              {/* Total Requests Card */}
              <Grid item xs={12} sm={6} md={3}> {/* Pantay na Lapad */}
                <Card sx={uniformCardStyle}>
                  <RequestIcon sx={{ fontSize: 60, color: colors.secondary, mb: 2 }} />
                  <Typography variant="h3" fontWeight="900" color={colors.secondary}>
                    {stats.totalRequests}
                  </Typography>
                  <Typography variant="h6" color={colors.secondary} sx={{ opacity: 0.9, mt: 1 }}>
                    Total Requests
                  </Typography>
                </Card>
              </Grid>

              {/* Total Rejected Card */}
              <Grid item xs={12} sm={6} md={3}> {/* Pantay na Lapad */}
                <Card sx={uniformCardStyle}>
                  <RejectedIcon sx={{ fontSize: 60, color: colors.secondary, mb: 2 }} />
                  <Typography variant="h3" fontWeight="900" color={colors.secondary}>
                    {stats.rejectedRequests}
                  </Typography>
                  <Typography variant="h6" color={colors.secondary} sx={{ opacity: 0.9, mt: 1 }}>
                    Rejected Requests
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}

       

          {/* Recent Borrow Requests Section with Filters */}
          <Card sx={{ 
            borderRadius: '12px', 
            overflow: 'hidden', 
            border: `2px solid ${colors.primary}`,
            backgroundColor: colors.accent,
            mb: 3
          }}>
            {/* Filters Header */}
            <Box 
              sx={{ 
                p: 2, 
                backgroundColor: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => setFiltersExpanded(!filtersExpanded)}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <FilterList sx={{ color: colors.secondary }} />
                <Typography variant="h5" fontWeight="800" color={colors.secondary}>
                  Recent Borrow Requests
                </Typography>
                {hasActiveFilters && (
                  <Chip 
                    label="Active" 
                    size="small" 
                    sx={{ 
                      ml: 1, 
                      backgroundColor: colors.secondary,
                      color: colors.primary,
                      fontWeight: 'bold'
                    }}
                  />
                )}
              </Box>
              <IconButton size="small" sx={{ color: colors.secondary }}>
                {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            {/* Filters Content */}
            <Collapse in={filtersExpanded}>
              <Box sx={{ p: 3, borderBottom: `1px solid ${colors.primary}` }}>
                <Grid container spacing={2} alignItems="center">
                  {/* Status Filter */}
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: colors.secondary }}>Filter by Status</InputLabel>
                      <Select
                        value={filters.status}
                        label="Filter by Status"
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        sx={{
                          color: colors.secondary,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.primary,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.secondary,
                          },
                        }}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                        <MenuItem value="returned">Returned</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Date Range Filter */}
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: colors.secondary }}>Date Range</InputLabel>
                      <Select
                        value={filters.dateRange}
                        label="Date Range"
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                        sx={{
                          color: colors.secondary,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.primary,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.secondary,
                          },
                        }}
                      >
                        <MenuItem value="all">All Time</MenuItem>
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="week">Past Week</MenuItem>
                        <MenuItem value="month">Past Month</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Reset Filters Button */}
                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={resetFilters}
                      sx={{ 
                        borderRadius: '8px',
                        borderColor: colors.secondary,
                        color: colors.secondary,
                        fontWeight: 'bold',
                        height: '40px',
                        '&:hover': {
                          backgroundColor: colors.secondary,
                          color: colors.accent
                        }
                      }}
                    >
                      Reset Filters
                    </Button>
                  </Grid>
                </Grid>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: colors.primary, borderRadius: '8px' }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: colors.secondary, mb: 1 }}>
                      Active Filters:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {filters.status !== 'all' && (
                        <Chip 
                          label={`Status: ${filters.status}`} 
                          size="small" 
                          onDelete={() => handleFilterChange('status', 'all')}
                          sx={{ 
                            backgroundColor: colors.secondary,
                            color: colors.primary,
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                      {filters.dateRange !== 'all' && (
                        <Chip 
                          label={`Date: ${filters.dateRange}`} 
                          size="small" 
                          onDelete={() => handleFilterChange('dateRange', 'all')}
                          sx={{ 
                            backgroundColor: colors.secondary,
                            color: colors.primary,
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Collapse>

            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: colors.primary }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Book Information</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Student Information</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Request Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <RequestIcon sx={{ fontSize: 40, color: colors.primary, mb: 1 }} />
                        <Typography variant="body2" sx={{ color: colors.secondary }}>
                          No borrow requests found.
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: colors.secondary }}>
                          {hasActiveFilters ? 'Try adjusting your filters.' : 'No recent borrow requests.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request, index) => (
                      <TableRow 
                        key={request._id} 
                        hover 
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: colors.primary,
                            '& .action-buttons': {
                              opacity: 1
                            }
                          },
                          '& .action-buttons': {
                            opacity: 0.7,
                            transition: 'opacity 0.2s ease'
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" sx={{ color: colors.secondary }}>
                            {index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ position: 'relative' }}>
                              {request.book?.image ? (
                                <img
                                  src={request.book.image}
                                  alt={request.book.title}
                                  style={{
                                    width: 50,
                                    height: 60,
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: `2px solid ${colors.primary}`
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    width: 50,
                                    height: 60,
                                    backgroundColor: colors.primary,
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `2px solid ${colors.primary}`
                                  }}
                                >
                                  <BookIcon sx={{ fontSize: 24, color: colors.secondary }} />
                                </Box>
                              )}
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold" sx={{ color: colors.secondary }}>
                                {request.book?.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: colors.secondary, opacity: 0.8 }}>
                                by {request.book?.author}
                              </Typography>
                              <Typography variant="body2" sx={{ color: colors.secondary, opacity: 0.8, fontSize: '0.8rem' }}>
                                Available: {request.book?.availableCopies || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: colors.secondary }}>
                              {request.user?.fullName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.secondary, opacity: 0.8 }}>
                              ID: {request.user?.studentId}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.secondary, opacity: 0.8, fontSize: '0.8rem' }}>
                              {request.user?.course} • {request.user?.yearLevel}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: colors.secondary }}>
                            {formatDate(request.requestDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: colors.secondary }}>
                            {formatDate(request.dueDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(request.status)}
                            label={getStatusText(request.status)}
                            color={getStatusColor(request.status)}
                            size="medium" 
                            sx={{ fontWeight: '600' }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            className="action-buttons"
                            sx={{
                              color: '#2e66a6',
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              '&:hover': {
                                backgroundColor: '#FFFFFF',
                                color: '#2e66a6'
                              }
                            }}
                            onClick={() => handleViewDetails(request)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
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
          sx={{
            borderRadius: '8px',
            fontWeight: 'bold'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;