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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera
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

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    description: '',
    publishedYear: new Date().getFullYear(),
    publisher: '',
    totalCopies: 1,
    availableCopies: 1
  });

  // Fetch book details
  const fetchBookDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/books/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const bookData = response.data;
      setBook(bookData);
      
      // Set form data
      setFormData({
        title: bookData.title || '',
        author: bookData.author || '',
        isbn: bookData.isbn || '',
        category: bookData.category || '',
        description: bookData.description || '',
        publishedYear: bookData.publishedYear || new Date().getFullYear(),
        publisher: bookData.publisher || '',
        totalCopies: bookData.totalCopies || 1,
        availableCopies: bookData.availableCopies || 1
      });

      // Set image preview
      if (bookData.image) {
        setImagePreview(getImageUrl(bookData.image));
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching book details',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-update available copies when total copies changes
      ...(name === 'totalCopies' && { 
        availableCopies: Math.min(prev.availableCopies, value)
      })
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Save edited book
  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const updateData = new FormData();
      
      // Append form data
      updateData.append("title", formData.title);
      updateData.append("author", formData.author);
      updateData.append("isbn", formData.isbn);
      updateData.append("category", formData.category);
      updateData.append("description", formData.description);
      updateData.append("publishedYear", formData.publishedYear.toString());
      updateData.append("publisher", formData.publisher);
      updateData.append("totalCopies", formData.totalCopies.toString());
      updateData.append("availableCopies", formData.availableCopies.toString());
      
      // Append new image if exists
      if (image) {
        updateData.append("image", image);
      }

      // Use PUT request to update book
      const response = await axios.put(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/admin/books/${id}`, updateData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setSnackbar({
        open: true,
        message: 'Book updated successfully!',
        severity: 'success'
      });

      // Exit edit mode and refresh data
      setEditMode(false);
      setImage(null);
      fetchBookDetails();
      
    } catch (error) {
      console.error('Error updating book:', error);
      setSnackbar({
        open: true,
        message: 'Error updating book',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditMode(false);
    setImage(null);
    setImagePreview(book?.image ? getImageUrl(book.image) : null);
    // Reset form data to original book data
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        category: book.category || '',
        description: book.description || '',
        publishedYear: book.publishedYear || new Date().getFullYear(),
        publisher: book.publisher || '',
        totalCopies: book.totalCopies || 1,
        availableCopies: book.availableCopies || 1
      });
    }
  };

  // Delete book function
  const handleDeleteBook = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/admin/books/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSnackbar({
        open: true,
        message: 'Book deleted successfully!',
        severity: 'success'
      });
      
      // Redirect to manage books page
      setTimeout(() => {
        navigate('/admin/books');
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting book:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting book',
        severity: 'error'
      });
    }
  };

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

  if (!book) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar />
        <Box sx={{ flex: 1, ml: { xs: 0, md: '280px' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h6">Book not found</Typography>
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
                to="/admin/books"
                startIcon={<BackIcon />}
                sx={{
                  color: colors.secondary,
                  mb: 2,
                  textTransform: 'none'
                }}
              >
                Back to Manage Books
              </Button>
              <Typography variant="h4" fontWeight="800" color={colors.secondary}>
                {editMode ? 'Edit Book' : 'Book Details'}
              </Typography>
              <Typography variant="h6" color={colors.secondary} sx={{ opacity: 0.8 }}>
                {editMode ? 'Update book information' : 'Complete information about the book'}
              </Typography>
            </Box>
            
          
          </Stack>

          <Divider sx={{ mb: 4, borderColor: colors.primary }} />

          {/* Book Details Card */}
          <Card sx={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${colors.primary}`, p: 4 }}>
            <Grid container spacing={4}>
              {/* Book Cover Section */}
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  {editMode ? (
                    <Stack spacing={2}>
                      <Box sx={{ textAlign: 'center' }}>
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Book preview"
                            style={{
                              width: '100%',
                              maxWidth: 300,
                              height: 'auto',
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                              marginBottom: '16px'
                            }}
                          />
                        ) : book.image ? (
                          <img
                            src={getImageUrl(book.image)}
                            alt={book.title}
                            style={{
                              width: '100%',
                              maxWidth: 300,
                              height: 'auto',
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                              marginBottom: '16px'
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              maxWidth: 300,
                              height: 400,
                              backgroundColor: colors.primary,
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto',
                              marginBottom: '16px'
                            }}
                          >
                            <Typography variant="body1" color={colors.secondary}>
                              No Book Cover
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<PhotoCamera />}
                        sx={{
                          borderRadius: "8px",
                          borderColor: colors.secondary,
                          color: colors.secondary,
                          textTransform: 'none'
                        }}
                      >
                        Change Cover Image
                        <input
                          hidden
                          accept="image/*"
                          type="file"
                          onChange={handleImageUpload}
                        />
                      </Button>
                    </Stack>
                  ) : (
                    book.image ? (
                      <img
                        src={getImageUrl(book.image)}
                        alt={book.title}
                        style={{
                          width: '100%',
                          maxWidth: 300,
                          height: 'auto',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 300,
                          height: 400,
                          backgroundColor: colors.primary,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto'
                        }}
                      >
                        <Typography variant="body1" color={colors.secondary}>
                          No Book Cover
                        </Typography>
                      </Box>
                    )
                  )}
                </Box>
              </Grid>

              {/* Book Information Section */}
              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  {editMode ? (
                    // EDIT MODE FORM
                    <>
                      <TextField
                        required
                        name="title"
                        label="Book Title"
                        fullWidth
                        value={formData.title}
                        onChange={handleInputChange}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          },
                        }}
                      />

                      <TextField
                        required
                        name="author"
                        label="Author"
                        fullWidth
                        value={formData.author}
                        onChange={handleInputChange}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          },
                        }}
                      />

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            name="isbn"
                            label="ISBN"
                            fullWidth
                            value={formData.isbn}
                            onChange={handleInputChange}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                              },
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth required>
                            <InputLabel>Category</InputLabel>
                            <Select
                              name="category"
                              value={formData.category}
                              onChange={handleInputChange}
                              label="Category"
                              sx={{
                                borderRadius: '8px',
                              }}
                            >
                              {categories.map((category) => (
                                <MenuItem key={category} value={category}>
                                  {category}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            name="publishedYear"
                            label="Published Year"
                            type="number"
                            fullWidth
                            value={formData.publishedYear}
                            onChange={handleInputChange}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            name="publisher"
                            label="Publisher"
                            fullWidth
                            value={formData.publisher}
                            onChange={handleInputChange}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                              },
                            }}
                          />
                        </Grid>
                      </Grid>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            name="totalCopies"
                            label="Total Copies"
                            type="number"
                            fullWidth
                            value={formData.totalCopies}
                            onChange={handleInputChange}
                            inputProps={{ min: 1 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            name="availableCopies"
                            label="Available Copies"
                            type="number"
                            fullWidth
                            value={formData.availableCopies}
                            onChange={handleInputChange}
                            inputProps={{ 
                              min: 0, 
                              max: formData.totalCopies 
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                              },
                            }}
                          />
                        </Grid>
                      </Grid>

                      <TextField
                        required
                        name="description"
                        label="Description"
                        multiline
                        rows={4}
                        fullWidth
                        value={formData.description}
                        onChange={handleInputChange}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          },
                        }}
                      />

                      {/* Edit Action Buttons */}
                      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveEdit}
                          disabled={saving}
                          sx={{
                            borderRadius: "8px",
                            px: 3,
                            fontSize: "16px",
                            fontWeight: "600",
                            textTransform: "none",
                            backgroundColor: colors.secondary,
                            color: colors.accent,
                            '&:hover': {
                              backgroundColor: colors.secondary,
                              opacity: 0.9
                            },
                          }}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancelEdit}
                          disabled={saving}
                          sx={{
                            borderRadius: "8px",
                            px: 3,
                            fontSize: "16px",
                            fontWeight: "600",
                            textTransform: "none",
                            borderColor: colors.secondary,
                            color: colors.secondary,
                            '&:hover': {
                              backgroundColor: colors.primary,
                              borderColor: colors.secondary
                            },
                          }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </>
                  ) : (
                    // VIEW MODE
                    <>
                      {/* Title and Author */}
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color={colors.secondary} gutterBottom>
                          Title: {book.title}
                        </Typography>
                        <Typography variant="h6" color={colors.secondary} sx={{ opacity: 0.8 }}>
                          Author:  {book.author}
                        </Typography>
                      </Box>

                      {/* Basic Information Grid */}
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color={colors.secondary} sx={{ opacity: 0.7 }}>
                            ISBN
                          </Typography>
                          <Typography variant="body1" color={colors.secondary} fontWeight="500">
                            {book.isbn}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color={colors.secondary} sx={{ opacity: 0.7 }}>
                            Category
                          </Typography>
                          <Chip 
                            label={book.category} 
                            sx={{ 
                              backgroundColor: colors.primary,
                              color: colors.secondary,
                              fontWeight: '500'
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color={colors.secondary} sx={{ opacity: 0.7 }}>
                            Published Year
                          </Typography>
                          <Typography variant="body1" color={colors.secondary} fontWeight="500">
                            {book.publishedYear}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color={colors.secondary} sx={{ opacity: 0.7 }}>
                            Publisher
                          </Typography>
                          <Typography variant="body1" color={colors.secondary} fontWeight="500">
                            {book.publisher}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color={colors.secondary} sx={{ opacity: 0.7 }}>
                            Total Copies
                          </Typography>
                          <Typography variant="body1" color={colors.secondary} fontWeight="500">
                            {book.totalCopies || 0}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color={colors.secondary} sx={{ opacity: 0.7 }}>
                            Available Copies
                          </Typography>
                          <Typography variant="body1" color={colors.secondary} fontWeight="500">
                            {book.availableCopies || 0}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color={colors.secondary} sx={{ opacity: 0.7 }}>
                            Status
                          </Typography>
                          <Chip 
                            label={book.availableCopies > 0 ? 'Available' : 'Out of Stock'} 
                            color={book.availableCopies > 0 ? 'success' : 'error'}
                            sx={{ fontWeight: '500' }}
                          />
                        </Grid>
                      </Grid>

                      {/* Description */}
                      <Box>
                        <Typography variant="h6" color={colors.secondary} gutterBottom>
                          Description
                        </Typography>
                        <Card 
                          sx={{ 
                            p: 3, 
                            backgroundColor: colors.primary,
                            borderRadius: '8px'
                          }}
                        >
                          <Typography variant="body1" color={colors.secondary}>
                            {book.description}
                          </Typography>
                        </Card>
                      </Box>

                      {/* View Mode Action Buttons */}
                      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={() => setEditMode(true)}
                          sx={{
                            borderRadius: "8px",
                            px: 3,
                            fontSize: "16px",
                            fontWeight: "600",
                            textTransform: "none",
                            backgroundColor: colors.secondary,
                            color: colors.accent,
                            '&:hover': {
                              backgroundColor: colors.secondary,
                              opacity: 0.9
                            },
                          }}
                        >
                          Edit Book
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<DeleteIcon />}
                          onClick={() => setDeleteDialog(true)}
                          sx={{
                            borderRadius: "8px",
                            px: 3,
                            fontSize: "16px",
                            fontWeight: "600",
                            textTransform: "none",
                            borderColor: '#2e66a6',
                            color: '#2e66a6',
                            '&:hover': {
                              backgroundColor: '#FFFFFF',
                              borderColor: '#2e66a6'
                            },
                          }}
                        >
                          Delete Book
                        </Button>
                      </Stack>
                    </>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle>Delete Book</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{book.title}" by {book.author}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All borrow records associated with this book will also be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteBook}
            color="error"
            variant="contained"
          >
            Delete
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

export default BookDetails;