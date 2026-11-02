import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  TextField,
  Button,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  Inventory as ReturnIcon,
  Book as BookIcon,
  Check as ApproveIcon,
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

// Course options from your system
const COURSE_OPTIONS = [
  "BS Accountancy",
  "BS Business Administration",
  "BS Business Administration (Marketing Management)",
  "BS Business Administration (Banking and Microfinance)",
  "BS Business Administration (Financial Management)",
  "BS Business Administration (Human Resource Management)",
  "BS Entrepreneurship",
  "BS Hospitality Management",
  "BS Tourism Management",
  "BS Criminology",
  "BS Civil Engineering",
  "BS Electrical Engineering",
  "BS Information Technology",
  "BS Information Technology (Business Informatics)",
  "BS Information Technology (System Development)",
  "BS Nursing",
  "BS Pharmacy",
  "BS Medical Laboratory Science",
  "BS Psychology",
  "BSED (Bachelor of Secondary Education)",
  "BSED (Science)",
  "BSED (Mathematics)",
  "BSED (English)",
  "BSED (Filipino)",
  "BA Political Science",
  "BA English Language",
];

const ManageReturnRequests = () => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState(null);
  const [approveDialog, setApproveDialog] = useState({ open: false, request: null });
  const [filters, setFilters] = useState({
    course: 'all',
    dateRange: 'all'
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const navigate = useNavigate();

  // Fetch all return requests
  const fetchReturnRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/admin/return-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setReturnRequests(response.data || []);

      // Fetch statistics
      const statsResponse = await axios.get(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/admin/return-requests/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStats(statsResponse.data);

    } catch (error) {
      console.error('Error fetching return requests:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching return requests',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  // Handle approve return
  const handleApproveReturn = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/admin/return-requests/${requestId}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSnackbar({
        open: true,
        message: 'Return request approved successfully',
        severity: 'success'
      });

      setApproveDialog({ open: false, request: null });
      fetchReturnRequests(); // Refresh the list

    } catch (error) {
      console.error('Error approving return request:', error);
      setSnackbar({
        open: true,
        message: 'Error approving return request',
        severity: 'error'
      });
    }
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
      course: 'all',
      dateRange: 'all'
    });
    setSearchTerm('');
  };

  // Filter requests based on search and filters
  const filteredRequests = returnRequests.filter(request => {
    // Search filter
    const matchesSearch = 
      request.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user?.studentId?.includes(searchTerm) ||
      request.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.book?.author?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Course filter
    const matchesCourse = filters.course === 'all' || request.user?.course === filters.course;
    
    // Date range filter
    let matchesDateRange = true;
    if (filters.dateRange !== 'all' && request.returnRequestDate) {
      const requestDate = new Date(request.returnRequestDate);
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
    
    return matchesSearch && matchesCourse && matchesDateRange;
  });

  // Check if any filters are active
  const hasActiveFilters = filters.course !== 'all' || filters.dateRange !== 'all' || searchTerm !== '';

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
                Manage Return Requests
              </Typography>
              <Typography variant="h6" color={colors.secondary} sx={{ opacity: 0.8 }}>
                Review and approve book return requests
              </Typography>
            </Box>
            
            {stats && (
              <Box>
                <Typography variant="body1" color={colors.secondary} sx={{ opacity: 0.8 }}>
                  Pending Returns: {stats.totalReturnRequests} • Total Returned: {stats.totalReturned}
                </Typography>
              </Box>
            )}
          </Stack>

          <Divider sx={{ mb: 4, borderColor: colors.primary }} />

       

   
<Card sx={{ 
  mb: 3, 
  borderRadius: '12px', 
  backgroundColor: colors.accent,
  border: `2px solid ${colors.primary}`,
  overflow: 'hidden'
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
      <Typography variant="h6" fontWeight="bold" sx={{ color: colors.secondary }}>
        Search & Filters
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
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Search Field - HINABAAAN */}
        <Grid item xs={12} md={5}>
          <TextField
            fullWidth
            placeholder="Search by student name, ID, book title, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: colors.secondary }} />
            }}
            sx={{ minWidth: 700,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: colors.accent,
                '& fieldset': {
                  borderColor: colors.primary,
                },
                '&:hover fieldset': {
                  borderColor: colors.secondary,
                },
              },
            }}
          />
        </Grid>

        {/* Course Filter */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: colors.secondary }}>Filter by Course</InputLabel>
            <Select
              value={filters.course}
              label="Filter by Course"
              onChange={(e) => handleFilterChange('course', e.target.value)}
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
              <MenuItem value="all">All Courses</MenuItem>
              {COURSE_OPTIONS.map((course) => (
                <MenuItem key={course} value={course}>
                  {course}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Date Range Filter */}
        <Grid item xs={12} md={2}>
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

        {/* Reset Filters Button - NASA GILID NA NG DATE RANGE */}
        <Grid item xs={12} md={2}>
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
            {searchTerm && (
              <Chip 
                label={`Search: "${searchTerm}"`} 
                size="small" 
                onDelete={() => setSearchTerm('')}
                sx={{ 
                  backgroundColor: colors.secondary,
                  color: colors.primary,
                  fontWeight: 'bold'
                }}
              />
            )}
            {filters.course !== 'all' && (
              <Chip 
                label={`Course: ${filters.course}`} 
                size="small" 
                onDelete={() => handleFilterChange('course', 'all')}
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
</Card>

          {/* Return Requests Table */}
          <Card sx={{ 
            borderRadius: '12px', 
            overflow: 'hidden', 
            border: `2px solid ${colors.primary}`,
            backgroundColor: colors.accent
          }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: colors.primary }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Book Information</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Student Information</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Borrowed Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Return Request Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <CircularProgress sx={{ color: colors.primary }} />
                        <Typography variant="body2" sx={{ mt: 1, color: colors.secondary }}>
                          Loading return requests...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <ReturnIcon sx={{ fontSize: 40, color: colors.primary, mb: 1 }} />
                        <Typography variant="body2" sx={{ color: colors.secondary }}>
                          No return requests found.
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: colors.secondary }}>
                          {hasActiveFilters ? 'Try adjusting your filters.' : 'No pending return requests.'}
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
                                ISBN: {request.book?.isbn}
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
                            <Chip 
                              label={request.user?.course} 
                              size="small" 
                              sx={{ 
                                mt: 0.5,
                                backgroundColor: colors.primary,
                                color: colors.secondary,
                                fontWeight: '500',
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: colors.secondary }}>
                            {formatDate(request.approvedDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: colors.secondary }}>
                            {formatDate(request.dueDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={formatDate(request.returnRequestDate)}
                            size="small"
                            sx={{ 
                              fontWeight: '500',
                              backgroundColor: colors.secondary,
                              color: colors.primary
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} className="action-buttons">
                            <IconButton
                              size="small"
                              sx={{ 
                                color: '#2e66a6',
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '&:hover': {
                                  backgroundColor: '#FFFFFF',
                                  color: '#2e66a6'
                                }
                              }}
                              onClick={() => setApproveDialog({ open: true, request })}
                            >
                              <ApproveIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ 
                                color: '#2e66a6',
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '&:hover': {
                                  backgroundColor: '#FFFFFF',
                                  color: '#2e66a6'
                                }
                              }}
                              onClick={() => navigate('/admin/borrow-request-details', { state: { request } })}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Stack>
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

      {/* Approve Return Confirmation Dialog */}
      <Dialog
        open={approveDialog.open}
        onClose={() => setApproveDialog({ open: false, request: null })}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            border: `2px solid ${colors.primary}`
          }
        }}
      >
        <DialogTitle sx={{ backgroundColor: colors.primary, color: colors.secondary, fontWeight: 'bold' }}>
          Confirm Return Approval
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText sx={{ color: colors.secondary }}>
            Are you sure you want to approve the return of <strong>"{approveDialog.request?.book?.title}"</strong> 
            by <strong>{approveDialog.request?.user?.fullName}</strong>?
            <br /><br />
            This will:
            <ul>
              <li>Mark the book as returned</li>
              <li>Increase the available copies</li>
              <li>Complete the borrowing cycle</li>
            </ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setApproveDialog({ open: false, request: null })}
            sx={{ 
              color: colors.secondary,
              fontWeight: 'bold'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleApproveReturn(approveDialog.request?._id)}
            variant="contained" 
            startIcon={<ApproveIcon />}
            sx={{ 
              borderRadius: '8px',
              backgroundColor: colors.secondary,
              color: colors.primary,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: colors.primary,
                color: colors.secondary,
                border: `2px solid ${colors.secondary}`
              }
            }}
          >
            Approve Return
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

export default ManageReturnRequests;