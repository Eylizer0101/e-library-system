// src/pages/admin/EditBook.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
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
  Paper
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  PhotoCamera,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';

// UPDATED Color Scheme - Three Color Palette: #2e66a6, Black, and White/Gray
const colors = {
  // Main Colors
  primary: "#000000", // Black for main accent and text
  secondary: "#2e66a6", // Dark Gray
  accent: "#2e66a6", // The light Pinkish-Beige base color
  
  // Derived Shades
  background: "#FFFFFF", // White to #2e66a6 gradient
  cardBg: "#FFFFFF",
  text: "#000000", // Black
  
  // Custom shades for definition
  darkAccent: "#2e66a6", // Slightly darker #2e66a6 for button hover/light border
  borderColor: "#2e66a6", // A darker tone of the base for border definition
  buttonPrimary: "#000000", // Black button background
  buttonHover: "#2e66a6", // Dark Gray hover
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

const EditBook = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

  // Fetch book data
  const fetchBookData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/books/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const bookData = response.data;
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
      console.error('Error fetching book data:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching book data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-update availableCopies when totalCopies changes
      // Make sure availableCopies doesn't exceed totalCopies
      ...(name === 'totalCopies' && { availableCopies: Math.min(prev.availableCopies, value) })
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // VALIDATION: Check if category is selected
    if (!formData.category) {
      setSnackbar({
        open: true,
        message: 'Please select a category',
        severity: 'error'
      });
      setSaving(false);
      return;
    }

    try {
      const bookData = new FormData();
      
      // Append form data
      bookData.append("title", formData.title);
      bookData.append("author", formData.author);
      bookData.append("isbn", formData.isbn);
      bookData.append("category", formData.category);
      bookData.append("description", formData.description);
      bookData.append("publishedYear", formData.publishedYear.toString());
      bookData.append("publisher", formData.publisher);
      bookData.append("totalCopies", formData.totalCopies.toString());
      bookData.append("availableCopies", formData.availableCopies.toString());
      
      // Append image if exists
      if (image) {
        bookData.append("image", image);
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Use PUT request to update book
      const response = await axios.put(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/admin/books/${id}`, bookData, {
        headers: {
          // Note: axios automatically sets Content-Type to multipart/form-data with correct boundary when sending FormData
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      });

      console.log('Book updated successfully:', response.data);

      setSnackbar({
        open: true,
        message: 'Book updated successfully! Redirecting...',
        severity: 'success'
      });

      // Redirect to book details page
      setTimeout(() => {
        navigate(`/admin/book-details/${id}`);
      }, 2000);

    } catch (error) {
      console.error('Full error details:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Error updating book. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Admin privileges required.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check if backend server is running.';
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar />
        <Box sx={{ flex: 1, ml: { xs: 0, md: '280px' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress sx={{ color: colors.primary }} />
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
          <Stack alignItems="center" spacing={1} mb={4}>
            <Button
              component={RouterLink}
              to="/admin/books"
              startIcon={<BackIcon />}
              sx={{
                color: colors.primary, // Black
                mb: 2,
                textTransform: 'none',
                alignSelf: 'flex-start',
                '&:hover': {
                    backgroundColor: colors.darkAccent, // Darker #2e66a6 hover
                }
              }}
            >
              Back to Manage Books
            </Button>
            <Typography
              variant="h4"
              fontWeight="800"
              color={colors.primary} // Black
              textAlign="center"
            >
              Edit Book
            </Typography>
            <Typography
              variant="h6"
              color={colors.secondary} // Dark Gray
              textAlign="center"
              sx={{ opacity: 0.8 }}
            >
              Update book information for Book ID: {id}
            </Typography>
          </Stack>

          <Divider sx={{ width: "60%", mb: 4, borderColor: colors.borderColor, mx: 'auto' }} />

          {/* Main Content Layout */}
          <Stack
            width="100%"
            direction={{ xs: "column", md: "row" }}
            justifyContent="center"
            alignItems="flex-start"
            gap={4}
          >
            {/* Form Section */}
            <Container component="main" maxWidth="sm" sx={{ p: 0 }}>
              <Paper
                elevation={8}
                sx={{
                  borderRadius: "16px",
                  p: { xs: 3, md: 4 },
                  background: colors.cardBg, // White
                  // Adjusted box shadow to use the primary color (Black)
                  boxShadow: `0 8px 20px ${colors.primary}15`, 
                  border: `2px solid ${colors.borderColor}`, // Darker #2e66a6 tone for border
                }}
              >
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    {/* Upload Section */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="600" mb={1} color={colors.primary}>
                        Update Book Cover Image
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Button
                          variant="contained"
                          component="label"
                          endIcon={<PhotoCamera />}
                          sx={{
                            borderRadius: "8px",
                            textTransform: "none",
                            px: 2,
                            py: 1,
                            fontSize: "14px",
                            background: colors.buttonPrimary, // Black button
                            '&:hover': { 
                              background: colors.buttonHover, // Dark Gray hover
                            },
                          }}
                        >
                          Change Cover
                          <input
                            hidden
                            accept="image/*"
                            type="file"
                            onChange={handleImageUpload}
                          />
                        </Button>
                        <Typography fontSize="13px" color={colors.secondary}>
                          {image ? image.name : "No new image selected"}
                        </Typography>
                      </Stack>
                    </Grid>

                    {/* Book Title */}
                    <Grid item xs={12}>
                      <TextField
                        required
                        name="title"
                        label="Book Title"
                        size="small"
                        fullWidth
                        value={formData.title}
                        onChange={handleChange}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '& fieldset': { borderColor: colors.borderColor }, // Darker #2e66a6
                            '&:hover fieldset': { borderColor: colors.primary }, // Black hover
                            '&.Mui-focused fieldset': { borderColor: colors.primary }, // Black focus
                          },
                        }}
                      />
                    </Grid>

                    {/* Author */}
                    <Grid item xs={12}>
                      <TextField
                        required
                        name="author"
                        label="Author"
                        size="small"
                        fullWidth
                        value={formData.author}
                        onChange={handleChange}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '& fieldset': { borderColor: colors.borderColor },
                            '&:hover fieldset': { borderColor: colors.primary },
                            '&.Mui-focused fieldset': { borderColor: colors.primary },
                          },
                        }}
                      />
                    </Grid>

                    {/* ISBN and Category - Side by Side */}
                    <Grid item xs={12} container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          required
                          name="isbn"
                          label="ISBN"
                          size="small"
                          fullWidth
                          value={formData.isbn}
                          onChange={handleChange}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              '& fieldset': { borderColor: colors.borderColor },
                              '&:hover fieldset': { borderColor: colors.primary },
                              '&.Mui-focused fieldset': { borderColor: colors.primary },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth size="small" required>
                          <InputLabel>Category *</InputLabel>
                          <Select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            label="Category *"
                            sx={{
                              borderRadius: '8px',
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.borderColor },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
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

                    {/* Stock Information */}
                    <Grid item xs={12} container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          required
                          name="totalCopies"
                          label="Total Copies"
                          type="number"
                          InputLabelProps={{ shrink: true }}
                          size="small"
                          fullWidth
                          value={formData.totalCopies}
                          onChange={handleChange}
                          inputProps={{ min: 1 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              '& fieldset': { borderColor: colors.borderColor },
                              '&:hover fieldset': { borderColor: colors.primary },
                              '&.Mui-focused fieldset': { borderColor: colors.primary },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          required
                          name="availableCopies"
                          label="Available Copies"
                          type="number"
                          InputLabelProps={{ shrink: true }}
                          size="small"
                          fullWidth
                          value={formData.availableCopies}
                          onChange={handleChange}
                          inputProps={{ 
                            min: 0, 
                            max: formData.totalCopies 
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              '& fieldset': { borderColor: colors.borderColor },
                              '&:hover fieldset': { borderColor: colors.primary },
                              '&.Mui-focused fieldset': { borderColor: colors.primary },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* Description */}
                    <Grid item xs={12}>
                      <TextField
                        label="Description"
                        name="description"
                        multiline
                        rows={3}
                        size="small"
                        required
                        fullWidth
                        value={formData.description}
                        onChange={handleChange}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '& fieldset': { borderColor: colors.borderColor },
                            '&:hover fieldset': { borderColor: colors.primary },
                            '&.Mui-focused fieldset': { borderColor: colors.primary },
                          },
                        }}
                      />
                    </Grid>

                    {/* Published Year and Publisher - Side by Side */}
                    <Grid item xs={12} container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          required
                          name="publishedYear"
                          label="Published Year"
                          type="number"
                          InputLabelProps={{ shrink: true }}
                          size="small"
                          fullWidth
                          value={formData.publishedYear}
                          onChange={handleChange}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              '& fieldset': { borderColor: colors.borderColor },
                              '&:hover fieldset': { borderColor: colors.primary },
                              '&.Mui-focused fieldset': { borderColor: colors.primary },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          required
                          name="publisher"
                          label="Publisher"
                          size="small"
                          fullWidth
                          value={formData.publisher}
                          onChange={handleChange}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              '& fieldset': { borderColor: colors.borderColor },
                              '&:hover fieldset': { borderColor: colors.primary },
                              '&.Mui-focused fieldset': { borderColor: colors.primary },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12} mt={2}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                          component={RouterLink}
                          to="/admin/books"
                          variant="outlined"
                          sx={{
                            borderColor: colors.primary, // Black border
                            color: colors.primary, // Black text
                            borderRadius: '8px',
                            px: 4,
                            textTransform: 'none',
                            fontWeight: '600',
                            '&:hover': {
                              backgroundColor: colors.darkAccent, // Lighter hover derived from #2e66a6
                              borderColor: colors.primary
                            }
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={saving}
                          sx={{
                            borderRadius: "10px",
                            px: 4,
                            fontSize: "16px",
                            fontWeight: "600",
                            textTransform: "none",
                            background: colors.buttonPrimary, // Black button
                            '&:hover': {
                              background: colors.buttonHover, // Dark Gray hover
                            },
                          }}
                          startIcon={
                            saving ? <CircularProgress size={18} color="inherit" /> : null
                          }
                        >
                          {saving ? "Updating Book..." : "Update Book"}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Container>

            {/* Image Preview Section */}
            <Stack
              sx={{ 
                display: { xs: "none", md: "flex" },
                width: "40%"
              }}
              justifyContent="center"
              alignItems="center"
              gap={2}
            >
              <Box
                sx={{
                  p: 3,
                  borderRadius: "12px",
                  background: colors.cardBg, // White
                  boxShadow: `0 4px 20px ${colors.primary}1A`, // Shadow using Black
                  border: `2px solid ${colors.borderColor}`, // Darker #2e66a6 border
                }}
              >
                <Typography variant="h6" fontWeight="600" color={colors.primary} mb={2} textAlign="center">
                  Book Preview
                </Typography>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Book preview"
                    style={{ 
                      maxWidth: "100%", 
                      height: "auto", 
                      borderRadius: "8px",
                      display: "block",
                      maxHeight: "300px"
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 200,
                      height: 250,
                      backgroundColor: colors.accent, // Use #2e66a6 as placeholder background
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: colors.primary, // Black text inside placeholder
                      fontSize: "14px",
                      textAlign: "center",
                      p: 2,
                      border: `1px dashed ${colors.primary}`
                    }}
                  >
                    No book cover available
                  </Box>
                )}
              </Box>
              {/* Metadata Preview - ADDED FOR BETTER DESIGN */}
              <Card
                 elevation={0}
                 sx={{
                   width: '100%',
                   maxWidth: 300,
                   p: 2,
                   borderRadius: "12px",
                   backgroundColor: colors.accent, // Use #2e66a6
                   border: `1px solid ${colors.primary}`,
                 }}
               >
                 <CardContent sx={{ p: '8px !important' }}>
                   <Stack spacing={0.5}>
                     <Typography variant="body2" fontWeight="600" color={colors.primary}>
                       {formData.title || "Book Title"}
                     </Typography>
                     <Typography variant="caption" color={colors.secondary} sx={{ opacity: 0.8 }}>
                       Author: {formData.author || "Unknown"}
                     </Typography>
                     <Typography variant="caption" color={colors.secondary} sx={{ opacity: 0.8 }}>
                       Category: {formData.category || "Select Category"}
                     </Typography>
                   </Stack>
                 </CardContent>
               </Card>
            </Stack>
          </Stack>
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

export default EditBook;