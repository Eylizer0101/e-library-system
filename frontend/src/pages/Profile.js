import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Button,
  Stack,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  InputAdornment,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Badge as BadgeIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Save as SaveIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// --- Color and Data Definitions ---
const colors = {
  primary: "#2e66a6", // Light pinkish tone
  secondary: '#000000', // Black for main text/accents
  background: "#FFFFFF", // White background
  cardBg: '#FFFFFF', // White card background
  text: '#000000' // Black text
};

const yearLevels = [
  "1st Year College",
  "2nd Year College",
  "3rd Year College",
  "4th Year College",
];

const courses = [
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

const Profile = () => {
  const { user, updateUser } = useAuth(); // ADD updateUser HERE
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    contact: '',
    course: '',
    yearLevel: '',
    address: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        studentId: user.studentId || '',
        contact: user.contact || '',
        course: user.course || '',
        yearLevel: user.yearLevel || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    if (!user?.id) {
      setMessage({ type: 'error', text: 'No user found!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = {
        fullName: formData.fullName,
        contact: formData.contact,
        course: formData.course,
        yearLevel: formData.yearLevel,
        address: formData.address
      };
      
      const response = await axios.put(
        `${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/users/update/${user.id}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data) {
        // UPDATE USER CONTEXT WITH NEW DATA
        updateUser({
          ...user,
          fullName: formData.fullName,
          contact: formData.contact,
          course: formData.course,
          yearLevel: formData.yearLevel,
          address: formData.address
        });
        
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: colors.background }}>
        <CircularProgress sx={{ color: colors.secondary }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: colors.background, // White Background
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        py: { xs: 3, sm: 6, md: 10 } // Compact mobile layout
      }}
    >
      <Box
        sx={{
          width: "95%",
          maxWidth: "1000px",
          mt: { xs: 1, md: 4 },
          pb: { xs: 3, md: 8 },
        }}
      >
        {/* Header Section */}
        <Card 
          sx={{ 
            mb: 4, 
            p: 3, 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
            backgroundColor: colors.cardBg,
            borderLeft: `5px solid ${colors.primary}` // Accent line using F8D6D0
          }}
        >
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} sm={8} display="flex" alignItems="center">
              <Box sx={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  src={image ? URL.createObjectURL(image) : user.img}
                  sx={{
                    width: 100,
                    height: 100,
                    mr: 3,
                    border: `3px solid ${colors.primary}`, 
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", 
                    backgroundColor: colors.primary,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 50, color: colors.secondary }} />
                </Avatar>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      id="upload-avatar"
                      style={{ display: "none" }}
                      onChange={(e) => setImage(e.target.files[0])}
                    />
                    <label htmlFor="upload-avatar">
                      <IconButton
                        component="span"
                        size="small" 
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          right: 20,
                          backgroundColor: colors.primary,
                          color: colors.secondary, // Black icon on F8D6D0 background
                          border: `2px solid ${colors.cardBg}`,
                          "&:hover": { backgroundColor: colors.secondary, color: colors.cardBg },
                          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </label>
                  </>
                )}
              </Box>
              <Box>
                <Typography
                  variant="h5" 
                  sx={{ fontWeight: 600, color: colors.text, mb: 0.5 }}
                >
                  {user.fullName || 'User Name'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text, opacity: 0.9, fontWeight: 500 }}>
                  {/* Tumaas ang opacity para mas malinaw ang text */}
                  **{user.role}** | {user.email}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4} textAlign="right">
              <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'center', sm: 'flex-end' }}>
                {isEditing && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data to current user data on cancel
                      setFormData({
                        fullName: user.fullName || '',
                        email: user.email || '',
                        studentId: user.studentId || '',
                        contact: user.contact || '',
                        course: user.course || '',
                        yearLevel: user.yearLevel || '',
                        address: user.address || '',
                      });
                      setMessage({ type: '', text: '' }); // Clear message on cancel
                    }}
                    sx={{
                      borderColor: colors.secondary,
                      color: colors.secondary,
                      textTransform: "none",
                      px: 2,
                      py: 1,
                      fontSize: "15px",
                      borderRadius: '8px',
                      "&:hover": { backgroundColor: colors.primary, borderColor: colors.secondary },
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                  onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
                  disabled={loading}
                  sx={{
                    backgroundColor: colors.secondary, // Black for action button
                    color: colors.cardBg, // White text
                    textTransform: "none",
                    px: 3,
                    py: 1,
                    fontSize: "15px",
                    borderRadius: '8px',
                    minWidth: '140px',
                    "&:hover": { 
                      backgroundColor: colors.primary, 
                      color: colors.secondary, // Black text on hover
                      boxShadow: 'none' 
                    },
                  }}
                >
                  {loading ? <CircularProgress size={20} sx={{ color: colors.cardBg }} /> : (isEditing ? 'Save' : 'Edit Profile')}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Card>

        {message.text && (
          <Alert 
            severity={message.type} 
            sx={{ 
              mb: 3, 
              borderRadius: '8px',
              backgroundColor: colors.primary, // Alert background F8D6D0
              color: colors.secondary, // Alert text black (High contrast)
            }}
            onClose={() => setMessage({ type: '', text: '' })}
          >
            {message.text}
          </Alert>
        )}

        {/* Profile Fields */}
        <Card sx={{ p: 4, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', backgroundColor: colors.cardBg }}>
          <CardContent sx={{ p: 0 }}>
            <Typography variant="h6" gutterBottom sx={{ color: colors.secondary, fontWeight: '600', mb: 3, borderBottom: `2px solid ${colors.primary}`, pb: 1 }}>
              Personal and Academic Information
            </Typography>
            <Grid container spacing={3}>
              {/* Full Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: colors.secondary }} />
                      </InputAdornment>
                    ),
                    style: { color: colors.text } // Ensure input text is black
                  }}
                  sx={fieldStyles(colors)}
                />
              </Grid>

              {/* Student ID (read-only) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Student ID (Read Only)" 
                  name="studentId"
                  value={formData.studentId}
                  fullWidth
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ color: colors.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={readOnlyFieldStyles(colors)}
                />
              </Grid>

              {/* Contact (editable) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact Number"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: colors.secondary }} />
                      </InputAdornment>
                    ),
                    style: { color: colors.text } // Ensure input text is black
                  }}
                  sx={fieldStyles(colors)}
                />
              </Grid>

              {/* Address (editable) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon sx={{ color: colors.secondary }} />
                      </InputAdornment>
                    ),
                    style: { color: colors.text } // Ensure input text is black
                  }}
                  sx={fieldStyles(colors)}
                />
              </Grid>

              {/* Year Level (editable) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Year Level"
                  name="yearLevel"
                  select
                  value={formData.yearLevel}
                  onChange={handleChange}
                  disabled={!isEditing}
                  fullWidth
                  sx={fieldStyles(colors)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon sx={{ color: colors.secondary }} />
                      </InputAdornment>
                    ),
                    style: { color: colors.text } // Ensure input text is black
                  }}
                >
                  {yearLevels.map((lvl, idx) => (
                    <MenuItem key={idx} value={lvl}>
                      {lvl}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Course (editable) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Course"
                  name="course"
                  select
                  value={formData.course}
                  onChange={handleChange}
                  disabled={!isEditing}
                  fullWidth
                  sx={fieldStyles(colors)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon sx={{ color: colors.secondary }} />
                      </InputAdornment>
                    ),
                    style: { color: colors.text } // Ensure input text is black
                  }}
                >
                  {courses.map((course, idx) => (
                    <MenuItem key={idx} value={course}>
                      {course}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Email (read-only) */}
              <Grid item xs={12}>
                <TextField
                  label="Email (Read Only)" 
                  name="email"
                  value={formData.email}
                  fullWidth
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: colors.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={readOnlyFieldStyles(colors)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

// --- Custom Styles for Reusability ---
const fieldStyles = (colors) => ({
    // General styles for editable fields
    "& .MuiInputBase-root": { 
        height: 50, 
        fontSize: "15px",
        color: colors.text, // **GINARANTUHAN BLACK ANG TEXT SA LOOB**
    },
    "& .MuiInputLabel-root": { 
        fontSize: "15px",
        color: colors.secondary, // GINARANTUHAN BLACK ANG LABEL
        '&.Mui-focused': { color: colors.secondary } // Focus state label color
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: colors.cardBg,
      '& fieldset': { borderColor: colors.primary + '80' },
      '&:hover fieldset': { borderColor: colors.secondary },
      '&.Mui-focused fieldset': { borderColor: colors.secondary, borderWidth: '2px' },
      '&.Mui-disabled fieldset': { borderColor: colors.primary, opacity: 0.6 },
    },
    // Para sa text na hindi masyadong malabo kapag disabled (pero editable dapat siya)
    '& .Mui-disabled .MuiInputBase-input': {
        WebkitTextFillColor: colors.text + ' !important', // Para sa Safari/Chrome
        opacity: 0.8, // Mas matapang na opacity
    }
});

const readOnlyFieldStyles = (colors) => ({
    // General styles for read-only (disabled) fields
    "& .MuiInputBase-root": { 
        height: 50, 
        fontSize: "15px",
        color: colors.text, 
    },
    "& .MuiInputLabel-root": { 
        fontSize: "15px",
        color: colors.secondary, // GINARANTUHAN BLACK ANG LABEL
        '&.Mui-focused': { color: colors.secondary }
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: colors.primary + '40', // Light F8D6D0 background
      '& fieldset': { borderColor: colors.primary },
      // **PINAKAMALAKING PAGBABAGO DITO:** Tinaas ang color/opacity para mas malinaw
      '&.Mui-disabled': { 
        opacity: 1, 
      },
      '&.Mui-disabled .MuiInputBase-input': {
        WebkitTextFillColor: colors.text + ' !important', // Para sa Safari/Chrome, titiyakin na black
        color: colors.text + ' !important', // Titiyakin na black
        opacity: 1, // Full opacity para hindi malabo
      },
      '&.Mui-disabled fieldset': { borderColor: colors.primary, backgroundColor: colors.primary + '40' },
    }
});

export default Profile;