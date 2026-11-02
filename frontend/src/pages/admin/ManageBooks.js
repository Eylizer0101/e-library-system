// src/pages/admin/ManageBooks.js
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Collapse
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  FilterList,
  ExpandMore,
  ExpandLess
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

const categories = [
  'Computer Science',
  'Literature',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Business',
  'History',
  'Art',
  'Biology',
  'Engineering'
];

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, book: null });
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    availability: 'all'
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const navigate = useNavigate();

  // Fetch all books
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/books`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setBooks(response.data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching books',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Delete book function
  const handleDeleteBook = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/admin/books/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSnackbar({
        open: true,
        message: 'Book deleted successfully!',
        severity: 'success'
      });
      
      // Refresh books list
      fetchBooks();
      setDeleteDialog({ open: false, book: null });
      
    } catch (error) {
      console.error('Error deleting book:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting book',
        severity: 'error'
      });
    }
  };

  // Edit book function - navigate to edit book page
  const handleEditBook = (bookId) => {
    navigate(`/admin/edit-book/${bookId}`);
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
      category: 'all',
      status: 'all',
      availability: 'all'
    });
    setSearchTerm('');
  };

  // Check if any filters are active
  const hasActiveFilters = filters.category !== 'all' || filters.status !== 'all' || filters.availability !== 'all' || searchTerm !== '';

  // Filter books based on search and filters
  const filteredBooks = books.filter(book => {
    // Search filter
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm);
    
    // Category filter
    const matchesCategory = filters.category === 'all' || book.category === filters.category;
    
    // Availability filter
    const matchesAvailability = filters.availability === 'all' || 
      (filters.availability === 'available' && book.availableCopies > 0) ||
      (filters.availability === 'out_of_stock' && book.availableCopies === 0);
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  // Calculate statistics
  const totalBooks = books.length;
  const availableBooks = books.filter(book => book.availableCopies > 0).length;
  const outOfStockBooks = books.filter(book => book.availableCopies === 0).length;

  // Fix image URL function
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If imagePath is already a full URL, return it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If imagePath is a relative path, construct the full URL
    return `${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${imagePath}`;
  };

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
        <Container maxWidth="xl">
          {/* Header Section */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" fontWeight="800" color={colors.secondary}>
                Manage Books
              </Typography>
              <Typography variant="h6" color={colors.secondary} sx={{ opacity: 0.8 }}>
                View, edit, and manage all books in the library
              </Typography>
            </Box>
            
            <Button
              component={RouterLink}
              to="/admin/add-book"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: "10px",
                px: 3,
                fontSize: "16px",
                fontWeight: "600",
                textTransform: "none",
                backgroundColor: colors.primary,
                color: colors.secondary,
                '&:hover': {
                  backgroundColor: colors.primary,
                  opacity: 0.9
                },
              }}
            >
              Add New Book
            </Button>
          </Stack>

          <Divider sx={{ mb: 4, borderColor: colors.primary }} />

         

          {/* Search and Filters Section */}
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
                  {/* Search Field */}
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      placeholder="Search by title, author, or ISBN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: colors.secondary }} />
                      }}
                      sx={{minWidth: 750,
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

                  {/* Category Filter */}
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: colors.secondary }}>Category</InputLabel>
                      <Select
                        value={filters.category}
                        label="Category"
                        onChange={(e) => handleFilterChange('category', e.target.value)}
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
                        <MenuItem value="all">All Categories</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Availability Filter */}
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: colors.secondary }}>Availability</InputLabel>
                      <Select
                        value={filters.availability}
                        label="Availability"
                        onChange={(e) => handleFilterChange('availability', e.target.value)}
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
                        <MenuItem value="all">All Books</MenuItem>
                        <MenuItem value="available">Available</MenuItem>
                        <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Reset Filters Button */}
                  <Grid item xs={12} md={1}>
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
                      Reset
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
                      {filters.category !== 'all' && (
                        <Chip 
                          label={`Category: ${filters.category}`} 
                          size="small" 
                          onDelete={() => handleFilterChange('category', 'all')}
                          sx={{ 
                            backgroundColor: colors.secondary,
                            color: colors.primary,
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                      {filters.availability !== 'all' && (
                        <Chip 
                          label={`Availability: ${filters.availability === 'available' ? 'Available' : 'Out of Stock'}`} 
                          size="small" 
                          onDelete={() => handleFilterChange('availability', 'all')}
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

          {/* Books Table */}
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
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Book Cover</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Author</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>ISBN</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Stock</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.secondary }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <CircularProgress sx={{ color: colors.primary }} />
                        <Typography variant="body2" sx={{ mt: 1, color: colors.secondary }}>
                          Loading books...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredBooks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" sx={{ color: colors.secondary }}>
                          No books found.
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: colors.secondary }}>
                          {hasActiveFilters ? 'Try adjusting your filters.' : 'Add some books to get started!'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBooks.map((book, index) => (
                      <TableRow 
                        key={book._id} 
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
                          {book.image ? (
                            <img
                              src={getImageUrl(book.image)}
                              alt={book.title}
                              style={{
                                width: 50,
                                height: 60,
                                objectFit: 'cover',
                                borderRadius: '4px',
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
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `2px solid ${colors.primary}`
                              }}
                            >
                              <Typography variant="caption" sx={{ color: colors.secondary }}>
                                No Image
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: colors.secondary }}>
                            {book.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: colors.secondary }}>
                            {book.author}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: colors.secondary }}>
                            {book.isbn}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={book.category}
                            size="small"
                            sx={{ 
                              backgroundColor: colors.primary,
                              color: colors.secondary,
                              fontWeight: '500'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold" sx={{ color: colors.secondary }}>
                              {book.availableCopies || 0}/{book.totalCopies || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.secondary, opacity: 0.8 }}>
                              Available/Total
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                            color={book.availableCopies > 0 ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: '500' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} className="action-buttons">
                            <IconButton
                              size="small"
                              component={RouterLink}
                              to={`/admin/book-details/${book._id}`}
                              sx={{ 
                                color: '#2e66a6',
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '&:hover': {
                                  backgroundColor: '#FFFFFF',
                                  color: '#2e66a6'
                                }
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ 
                                color: '#2e66a6',
                                backgroundColor: 'rgba(46,102,166,0.1)',
                                '&:hover': {
                                  backgroundColor: '#FFFFFF',
                                  color: '#2e66a6'
                                }
                              }}
                              onClick={() => handleEditBook(book._id)}
                            >
                              <EditIcon />
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
                              onClick={() => setDeleteDialog({ open: true, book })}
                            >
                              <DeleteIcon />
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, book: null })}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            border: `2px solid ${colors.primary}`
          }
        }}
      >
        <DialogTitle sx={{ backgroundColor: colors.primary, color: colors.secondary, fontWeight: 'bold' }}>
          Delete Book
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography sx={{ color: colors.secondary }}>
            Are you sure you want to delete <strong>"{deleteDialog.book?.title}"</strong> by {deleteDialog.book?.author}?
          </Typography>
          <Typography variant="body2" sx={{ color: colors.secondary, mt: 1 }}>
            ISBN: {deleteDialog.book?.isbn}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.secondary, mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, book: null })}
            sx={{ 
              color: colors.secondary,
              fontWeight: 'bold'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDeleteBook(deleteDialog.book?._id)}
            color="error"
            variant="contained"
            sx={{
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Delete Book
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

export default ManageBooks;