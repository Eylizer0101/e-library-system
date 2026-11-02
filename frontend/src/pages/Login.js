import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Snackbar,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stack,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Visibility, VisibilityOff, Email, Lock, Key, ArrowBack } from '@mui/icons-material';
import axios from 'axios';

// Bagong Color Palette
const colors = {
  // Primary: Light Pink/Peach (Accent color para sa buttons/highlights)
  primary: "#2e66a6", 
  // Dark: Black (Para sa text at dark background elements)
  dark: "#000000",     
  // Text/Background: White (Para sa text sa loob ng card at background ng dialog)
  text: "#2e66a6",
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Forgot Password States
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    // Never persist passwords in browser storage.
    localStorage.removeItem('rememberedPassword');
    const savedPassword = null;
    
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail
      }));
      setRememberMe(true);
    }
    
    if (savedPassword) {
      setFormData(prev => ({
        ...prev,
        password: savedPassword
      }));
    }
  }, []);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

 // In the handleSubmit function, replace the redirect part:
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await login(formData.email, formData.password);

    // Save credentials if remember me is checked
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email);
      localStorage.removeItem('rememberedPassword');
    } else {
      // Clear saved credentials if remember me is unchecked
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
    }

    // Show success message
    setSnackbarOpen(true);

    // Redirect after showing success message - BASED ON ROLE
    setTimeout(() => {
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/book-catalog');
      }
    }, 1500);

  } catch (err) {
    setError(err.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setError('Please enter your email address');
      return;
    }

    setForgotPasswordLoading(true);
    setError('');

    try {
      // Assuming axios is correctly imported and configured to the backend
      await axios.post('/auth/forgot-password', { 
        email: forgotPasswordEmail 
      });
      
      setForgotPasswordSuccess('Password reset instructions have been sent to your email!');
      setForgotPasswordEmail('');
      
      setTimeout(() => {
        setForgotPasswordOpen(false);
        setForgotPasswordSuccess('');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleForgotPasswordOpen = () => {
    setForgotPasswordOpen(true);
    setForgotPasswordEmail('');
    setForgotPasswordSuccess('');
    setError('');
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordEmail('');
    setForgotPasswordSuccess('');
    setError('');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFFFF', px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={0} sx={{ position: 'relative', width: '100%', maxWidth: 980, borderRadius: '15px', border: '1px solid #E0E6EF', boxShadow: '0 9px 24px rgba(0,0,0,.09)', p: { xs: 2, sm: 3, md: 5 }, overflow: 'hidden' }}>
        <IconButton component={RouterLink} to="/" aria-label="Back to home" sx={{ position: 'absolute', top: 16, left: 16, border: '1px solid #D8E0EA', width: 36, height: 36, color: '#2e66a6' }}><ArrowBack fontSize="small" /></IconButton>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, alignItems: 'stretch', gap: { xs: 3, md: 0 }, mt: { xs: 1, md: 0 } }}>
          <Box sx={{ borderRight: { md: '1px solid #D0D7E2' }, pr: { md: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: { xs: 2, md: 4 } }}>
            <Box component="img" src="/img/landing%20page/login.png" alt="E-Library student login illustration" sx={{ width: { xs: 130, md: 190 }, height: { xs: 140, md: 210 }, objectFit: 'contain' }} />
            <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, color: '#000000', fontWeight: 900, mt: 1 }}>E-Library</Typography>
            <Typography sx={{ color: '#222222', maxWidth: 320, mt: 1, lineHeight: 1.65, fontSize: { xs: 14, md: 17 } }}>PHINMA AU Digital Library Management System</Typography>
            
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={{ pl: { md: 4 }, py: { xs: 1, md: 2 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
            <Typography component="h1" sx={{ color: '#000000', fontWeight: 800, fontSize: { xs: 24, md: 27 }, textAlign: 'center', mb: 3 }}>Student Login</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Typography component="label" htmlFor="login-email" sx={{ color: '#000000', fontWeight: 700, fontSize: 13, mb: .7 }}>University Email</Typography>
            <TextField id="login-email" type="email" required fullWidth size="small" placeholder="Enter your university email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '7px' } }} InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#62758A', fontSize: 19 }} /></InputAdornment> }} />
            <Typography component="label" htmlFor="login-password" sx={{ color: '#000000', fontWeight: 700, fontSize: 13, mb: .7 }}>Password</Typography>
            <TextField id="login-password" required fullWidth size="small" placeholder="Enter your password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '7px' } }} InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#62758A', fontSize: 19 }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton size="small" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={handleClickShowPassword}>{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment> }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1, mb: 2, gap: 1 }}>
              <FormControlLabel sx={{ ml: -.5, mr: 0 }} control={<Checkbox size="small" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />} label={<Typography sx={{ fontSize: 12, color: '#27394B' }}>Remember Me</Typography>} />
              <Button onClick={handleForgotPasswordOpen} sx={{ p: 0, minWidth: 0, color: '#2e66a6', fontSize: 12, textTransform: 'none', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}>Forgot password?</Button>
            </Stack>
            <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ bgcolor: '#2e66a6', color: '#FFFFFF', borderRadius: '7px', minHeight: 45, fontWeight: 800, '&:hover': { bgcolor: '#245487', boxShadow: '0 5px 13px rgba(46,102,166,.22)' } }}>{loading ? <CircularProgress color="inherit" size={22} /> : 'Log in'}</Button>
            <Typography sx={{ mt: 3, textAlign: 'center', fontSize: 14, color: '#000000' }}>Don't have an account? <Box component={RouterLink} to="/register" sx={{ color: '#2e66a6', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Register here</Box></Typography>
          </Box>
        </Box>
      </Paper>
      <Snackbar open={snackbarOpen} autoHideDuration={1500} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert onClose={handleSnackbarClose} severity="success">Login successful! Redirecting...</Alert></Snackbar>
      <Dialog open={forgotPasswordOpen} onClose={handleForgotPasswordClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '15px', bgcolor: '#FFFFFF' } }}>
        <DialogTitle sx={{ bgcolor: '#2e66a6', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}><Key />Reset Your Password</DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          {forgotPasswordSuccess ? <Alert severity="success">{forgotPasswordSuccess}</Alert> : <><Typography sx={{ color: '#000000', mb: 2 }}>Enter your email address and we'll send you instructions to reset your password.</Typography><TextField fullWidth label="Email Address" type="email" value={forgotPasswordEmail} onChange={e => setForgotPasswordEmail(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#2e66a6' }} /></InputAdornment> }} /></>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={handleForgotPasswordClose} disabled={forgotPasswordLoading} sx={{ color: '#000000' }}>Cancel</Button>{!forgotPasswordSuccess && <Button onClick={handleForgotPassword} variant="contained" disabled={forgotPasswordLoading || !forgotPasswordEmail} sx={{ bgcolor: '#2e66a6', color: '#FFFFFF' }}>{forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}</Button>}</DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
