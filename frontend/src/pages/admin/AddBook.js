import React, { useState } from 'react';
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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  PhotoCamera
} from '@mui/icons-material';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';

// UPDATED Color Scheme - Two Color Palette: #2e66a6 and Black/Gray
const colors = {
  // #2e66a6 and shades derived from it (for primary, accent, and background)
  primary: "#000000", // Black for main accent (since green is removed)
  secondary: "#2e66a6", // Dark Gray
  accent: "#2e66a6", // The light base color
  background: "#FFFFFF", // White to #2e66a6 gradient
  cardBg: "#FFFFFF",
  text: "#000000", // Black
  
  // Custom shades derived from the main palette
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

const AddBook = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [image, setImage] = useState(null);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-update availableCopies when totalCopies changes
      ...(name === 'totalCopies' && { availableCopies: value })
    }));
  };

  const handleImageUpload = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // VALIDATION: Check if category is selected
    if (!formData.category) {
      setSnackbar({
        open: true,
        message: 'Please select a category',
        severity: 'error'
      });
      setLoading(false);
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

      console.log('Form Data:', {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        category: formData.category,
        description: formData.description,
        publishedYear: formData.publishedYear,
        publisher: formData.publisher,
        totalCopies: formData.totalCopies,
        availableCopies: formData.availableCopies
      });
      
      // GET TOKEN FIRST
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Exists' : 'Missing');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // FIXED: Use full URL with error handling
      const response = await axios.post(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/admin/books`, bookData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      });

      console.log('Book added successfully:', response.data);

      setSnackbar({
        open: true,
        message: 'Book added successfully! Redirecting to manage books...',
        severity: 'success'
      });

      // Reset form
      setFormData({
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
      setImage(null);

      // REDIRECT TO MANAGE BOOKS PAGE (CHANGED FROM BOOK CATALOG)
      setTimeout(() => {
        navigate('/admin/books');
      }, 2000);

    } catch (error) {
      console.error('Full error details:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Error adding book. Please try again.';
      
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
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Admin Sidebar - Gamitin ang shared AdminSidebar */}
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
          {/* Header Section - Compact like example */}
          <Stack alignItems="center" spacing={1} mb={4}>
            <Typography
              variant="h4"
              fontWeight="800"
              color={colors.primary}
              textAlign="center"
            >
              Add New Book
            </Typography>
            <Typography
              variant="h6"
              color={colors.secondary}
              textAlign="center"
              sx={{ opacity: 0.8 }}
            >
              Expand the library collection with new books
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
                  background: colors.cardBg,
                  // Adjusted box shadow to use the primary color (Black)
                  boxShadow: `0 8px 20px ${colors.primary}15`, 
                  border: `2px solid ${colors.borderColor}`, // Darker #2e66a6 tone for border
                }}
              >
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    {/* Upload Section - Like the example */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="600" mb={1} color={colors.primary}>
                        Upload Book Cover Image
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
                          Upload Cover
                          <input
                            hidden
                            accept="image/*"
                            type="file"
                            onChange={handleImageUpload}
                          />
                        </Button>
                        <Typography fontSize="13px" color={colors.secondary}>
                          {image ? image.name : "No image selected"}
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
                            '& fieldset': { borderColor: colors.borderColor },
                            '&:hover fieldset': { borderColor: colors.primary },
                            '&.Mui-focused fieldset': { borderColor: colors.primary },
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

                    {/* Stock Information - ADDED THIS SECTION */}
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
                            borderColor: colors.primary,
                            color: colors.primary,
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
                          disabled={loading}
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
                            loading ? <CircularProgress size={18} color="inherit" /> : null
                          }
                        >
                          {loading ? "Adding Book..." : "Add Book"}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Container>

            {/* Image Preview Section - Like the example */}
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
                  background: colors.cardBg,
                  boxShadow: `0 4px 20px ${colors.primary}1A`,
                  border: `2px solid ${colors.borderColor}`,
                }}
              >
                <Typography variant="h6" fontWeight="600" color={colors.primary} mb={2} textAlign="center">
                  Book Preview
                </Typography>
                {image ? (
                  <img
                    src={URL.createObjectURL(image)}
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
                    Book cover preview will appear here
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

export default AddBook;