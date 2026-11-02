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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Book as BookIcon,
  Close as CloseIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const colors = {
  primary: "#2e66a6",
  secondary: '#000000',
  accent: "#2e66a6",
  background: "#FFFFFF",
  cardBg: '#FFFFFF',
  text: '#000000',
  lightAccent: "#2e66a6",
  statusAvailable: '#000000',
  statusFunding: "#2e66a6",
  statusBorrowed: "#2e66a6",
  statusPending: "#2e66a6"
};

const defaultBookImage = `https://via.placeholder.com/250x350/F8D6D0/000000?text=No+Image`;

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [borrowingBooks, setBorrowingBooks] = useState(new Set());
  const [expandedTitles, setExpandedTitles] = useState(new Set());
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
  const [imageDialog, setImageDialog] = useState({ open: false, imageUrl: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      let response;
      try {
        response = await axios.get(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/admin/books`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setBooks(response.data || []);
      } catch {
        response = await axios.get(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/books`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setBooks(response.data.books || []);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to load books. Please try again.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/books/categories/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCategories(response.data || []);
    } catch {
      setCategories([]);
    }
  };

  const handleBorrowBook = async (bookId) => {
    try {
      setBorrowingBooks(prev => new Set(prev).add(bookId));
      const token = localStorage.getItem('token');
      await axios.post(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/borrow/request`,
        { bookId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setBooks(prevBooks =>
        prevBooks.map(book =>
          book._id === bookId ? { ...book, status: 'pending' } : book
        )
      );
      setSnackbar({ open: true, message: 'Book borrow request sent successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to borrow book. Please try again.',
        severity: 'error'
      });
    } finally {
      setBorrowingBooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookId);
        return newSet;
      });
    }
  };

  const handleImageError = (e) => {
    e.target.src = defaultBookImage;
  };

  const toggleTitle = (bookId) => {
    setExpandedTitles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };

  const toggleDescription = (bookId) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };

  const openImageDialog = (imageUrl) => {
    setImageDialog({ open: true, imageUrl });
  };

  const closeImageDialog = () => {
    setImageDialog({ open: false, imageUrl: '' });
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusChipProps = (book) => {
    if (book.status === 'borrowed') {
      return { label: "Borrowed", sx: { backgroundColor: colors.statusBorrowed, color: '#2e66a6' } };
    } else if (book.status === 'pending') {
      return { label: "Pending", sx: { backgroundColor: colors.statusPending, color: '#2e66a6' } };
    } else {
      return { label: "Available", sx: { backgroundColor: colors.statusAvailable, color: '#2e66a6' } };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Function to truncate text
  const truncateText = (text, maxLength = 60) => {
    if (!text) return 'No text available.';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: colors.background }}>
        <CircularProgress sx={{ color: colors.secondary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ background: colors.background, minHeight: '100vh', py: 12 }}>
      <Container maxWidth="xl">
        <Stack alignItems="center" spacing={2} mb={4}>
          <Typography variant="h3" fontWeight="900" color={colors.secondary} textAlign="center" gutterBottom sx={{ letterSpacing: 2 }}>
            Digital Book Catalog
          </Typography>
          <Typography variant="h6" color={colors.text} textAlign="center" sx={{ opacity: 0.9, mb: 2 }}>
            Discover our extensive collection of books
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', maxWidth: 600, color: colors.secondary, backgroundColor: colors.primary }}>
              {error}
            </Alert>
          )}

          <Box sx={{ p: 1, backgroundColor: colors.primary, borderRadius: '4px', border: `1px solid black` }}>
            <Typography variant="body2" color={colors.secondary}>
              <strong>Debug Info:</strong> Total Books: {books.length} | Showing: {filteredBooks.length}
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', maxWidth: 600 }} alignItems="center">
            <TextField
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: colors.cardBg,
                  '& fieldset': { borderColor: colors.primary },
                  '&:hover fieldset': { borderColor: colors.secondary, borderWidth: '2px' },
                  '&.Mui-focused fieldset': { borderColor: colors.secondary, borderWidth: '2px' },
                },
                input: { color: colors.text }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.secondary }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: colors.secondary }}>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: colors.cardBg,
                  color: colors.text,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary, borderWidth: '2px' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary, borderWidth: '2px' },
                }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category} sx={{ color: colors.secondary }}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <Divider sx={{ width: "90%", mb: 4, borderColor: colors.primary, mx: 'auto', borderBottomWidth: 2 }} />

        {/* FIXED GRID SYSTEM - Mas malaking width */}
        <Grid container spacing={3} justifyContent="center">
          {filteredBooks.map((book, index) => {
            const isTitleExpanded = expandedTitles.has(book._id);
            const isDescriptionExpanded = expandedDescriptions.has(book._id);
            
            const title = book.title || 'Untitled Book';
            const description = book.description || 'No description available.';
            
            const showTitleReadMore = title.length > 60;
            const showDescriptionReadMore = description.length > 100;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book._id || index} sx={{ 
                display: 'flex',
                justifyContent: 'center'
              }}>
                <Card
                  sx={{
                    minHeight: 600, // Content can expand without clipping
                    height: 'auto',
                    width: '100%', // Scale to available grid column
                    maxWidth: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    backgroundColor: colors.cardBg,
                    boxShadow: `0 4px 10px rgba(0,0,0,0.1)`,
                    border: `2px solid ${colors.primary}`,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 10px 20px rgba(0,0,0,0.2)`,
                      border: `2px solid ${colors.secondary}`,
                    },
                  }}
                >
                  {/* Clickable Image */}
                  <Box 
                    sx={{ 
                      position: 'relative',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                    onClick={() => openImageDialog(book.image || defaultBookImage)}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: 220, // Mas mataas na image height
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderBottom: `2px solid ${colors.primary}`,
                        backgroundColor: colors.primary,
                        borderTopLeftRadius: '10px',
                        borderTopRightRadius: '10px',
                      }}
                    >
                      <CardMedia
                        component="img"
                        sx={{
                          objectFit: 'contain',
                          width: '100%',
                          height: '100%',
                          backgroundColor: colors.primary,
                          transition: 'transform 0.3s',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          }
                        }}
                        image={book.image || defaultBookImage}
                        alt={book.title}
                        onError={handleImageError}
                      />
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: '#2e66a6',
                        borderRadius: '4px',
                        px: 1,
                        py: 0.5,
                        fontSize: '0.7rem',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      Click to enlarge
                    </Box>
                  </Box>

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      p: 2.5, // Mas malaking padding
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      {/* Title with Read More */}
                      <Box sx={{ mb: 1.5 }}>
                        <Typography
                          variant="h6"
                          fontWeight="700"
                          color={colors.secondary}
                          sx={{
                            fontSize: '1.1rem', // Mas malaking font
                            lineHeight: 1.3,
                            minHeight: '2.8em',
                          }}
                        >
                          <strong>Title:</strong>{' '}
                          {isTitleExpanded ? title : truncateText(title, 60)}
                        </Typography>
                        {showTitleReadMore && (
                          <Button
                            size="small"
                            onClick={() => toggleTitle(book._id)}
                            sx={{
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              p: 0,
                              mt: 0.5,
                              minWidth: 'auto',
                              color: colors.secondary,
                              fontWeight: 'bold',
                              '&:hover': {
                                backgroundColor: 'transparent',
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {isTitleExpanded ? 'Read Less' : 'Read More'}
                          </Button>
                        )}
                      </Box>

                      {/* Author */}
                      <Typography
                        variant="body2"
                        color={colors.text}
                        sx={{
                          opacity: 0.9,
                          mb: 1.5,
                          fontStyle: 'italic',
                          fontSize: '0.95rem', // Mas malaking font
                          height: '1.3em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <strong>Author:</strong> {book.author || 'Unknown Author'}
                      </Typography>

                      {/* Description with Read More */}
                      <Box sx={{ mb: 1.5 }}>
                        <Typography
                          variant="body2"
                          color={colors.text}
                          sx={{
                            opacity: 0.8,
                            fontSize: '0.85rem', // Mas malaking font
                            lineHeight: 1.4,
                            minHeight: '3.5em', // Mas mataas na height
                          }}
                        >
                          <strong>Description:</strong>{' '}
                          {isDescriptionExpanded ? description : truncateText(description, 100)}
                        </Typography>
                        {showDescriptionReadMore && (
                          <Button
                            size="small"
                            onClick={() => toggleDescription(book._id)}
                            sx={{
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              p: 0,
                              mt: 0.5,
                              minWidth: 'auto',
                              color: colors.secondary,
                              fontWeight: 'bold',
                              '&:hover': {
                                backgroundColor: 'transparent',
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                          </Button>
                        )}
                      </Box>

                      {/* Category and Status Chips */}
                      <Stack direction="row" spacing={0.5} mb={1.5} flexWrap="wrap" gap={0.5}>
                        <Chip
                          label={book.category || 'Uncategorized'}
                          size="small"
                          sx={{
                            backgroundColor: colors.primary,
                            color: colors.secondary,
                            fontWeight: '600',
                            fontSize: '0.75rem', // Mas malaking font
                            border: `1px solid ${colors.secondary}`,
                            maxWidth: '130px' // Mas malaking max width
                          }}
                        />
                        <Chip
                          {...getStatusChipProps(book)}
                          size="small"
                          sx={{
                            ...getStatusChipProps(book).sx,
                            fontWeight: '600',
                            fontSize: '0.75rem', // Mas malaking font
                            border: `1px solid ${colors.secondary}`,
                            maxWidth: '100px'
                          }}
                        />
                      </Stack>
                    </Box>

                    <Box>
                      <Stack spacing={0.3} sx={{ mb: 2.5 }}>
                        <Typography variant="caption" color={colors.text} sx={{ opacity: 0.8, lineHeight: 1.3, fontSize: '0.75rem' }}>
                          <strong>ISBN:</strong> {book.isbn || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color={colors.text} sx={{ opacity: 0.8, lineHeight: 1.3, fontSize: '0.75rem' }}>
                          <strong>Published:</strong> {book.publishedYear || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color={colors.text} sx={{ opacity: 0.8, lineHeight: 1.3, fontSize: '0.75rem' }}>
                          <strong>Publisher:</strong> {book.publisher || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color={colors.text} sx={{ opacity: 0.8, lineHeight: 1.3, fontSize: '0.75rem' }}>
                          <strong>Added:</strong> {formatDate(book.createdAt)}
                        </Typography>
                      </Stack>

                      <Box sx={{ textAlign: 'center' }}>
                        <Button
                          variant="contained"
                          startIcon={<BookmarkIcon />}
                          disabled={borrowingBooks.has(book._id) || book.status === 'borrowed' || book.status === 'pending'}
                          onClick={() => handleBorrowBook(book._id)}
                          sx={{
                            backgroundColor: book.status === 'available' ? colors.secondary : '#2e66a6',
                            color: book.status === 'available' ? 'white' : '#2e66a6',
                            borderRadius: '8px',
                            px: 3,
                            py: 1.2, // Mas malaking padding
                            textTransform: 'none',
                            fontWeight: '600',
                            fontSize: '0.9rem', // Mas malaking font
                            width: '100%',
                            '&:hover': book.status === 'available' ? {
                              backgroundColor: colors.primary,
                              color: colors.secondary,
                            } : {},
                          }}
                        >
                          {borrowingBooks.has(book._id)
                            ? (<><CircularProgress size={16} sx={{ mr: 1, color: '#2e66a6' }} /> Borrowing...</>)
                            : (book.status === 'borrowed' || book.status === 'pending'
                              ? 'Not Available'
                              : 'Borrow This Book')}
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* Image Dialog */}
      <Dialog
        open={imageDialog.open}
        onClose={closeImageDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: colors.primary,
          color: colors.secondary
        }}>
          Book Image
          <IconButton onClick={closeImageDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          textAlign: 'center', 
          p: 0,
          backgroundColor: colors.lightAccent
        }}>
          <img
            src={imageDialog.imageUrl}
            alt="Book preview"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain'
            }}
            onError={handleImageError}
          />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookCatalog;