import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, MenuItem, InputAdornment, IconButton, Stack, Grid, Link, CircularProgress } from '@mui/material';
import { PersonOutline, EmailOutlined, BadgeOutlined, LockOutlined, Visibility, VisibilityOff, AutoStoriesOutlined, ArrowBack } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

const yearLevels = [
  "1st Year College",
  "2nd Year College",
  "3rd Year College",
  "4th Year College"
];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [values, setValues] = useState({ fullName: '', studentId: '', email: '', password: '', course: '', yearLevel: '' });
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const update = (e) => setValues(v => ({ ...v, [e.target.name]: e.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (values.fullName.trim().length < 6 || /\d/.test(values.fullName)) return setError('Enter your full name (at least 6 letters, without numbers).');
    if (!/^\d{2}-\d{4}-\d{5,6}$/.test(values.studentId.trim())) return setError('Use Student ID format XX-XXXX-XXXXX.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return setError('Enter a valid email address.');
    if (values.password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(values.password)) return setError('Password must be at least 8 characters and contain a special character.');
    if (!values.course || !values.yearLevel) return setError('Please select your course and year level.');
    setLoading(true);
    try {
      await register({ ...values, fullName: values.fullName.trim(), studentId: values.studentId.trim(), email: values.email.trim().toLowerCase() }, false);
      setSuccess(true);
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (err) { setError(err.message || 'Could not create your account.'); }
    finally { setLoading(false); }
  };
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFFFF', px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={0} sx={{ position: 'relative', width: '100%', maxWidth: 1120, borderRadius: '15px', border: '1px solid #E0E6EF', boxShadow: '0 9px 24px rgba(0,0,0,.09)', p: { xs: 2, sm: 3, md: 5 } }}>
        <IconButton component={RouterLink} to="/" aria-label="Back to home" sx={{ position: 'absolute', top: 16, left: 16, border: '1px solid #D8E0EA', width: 36, height: 36, color: '#2e66a6' }}><ArrowBack fontSize="small" /></IconButton>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.8fr 1.2fr' }, gap: { xs: 3, md: 0 }, mt: { xs: 1, md: 0 } }}>
          <Box sx={{ borderRight: { md: '1px solid #D0D7E2' }, pr: { md: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: { xs: 2, md: 4 } }}>
            <Box component="img" src="/img/phinma-logo.png" alt="PHINMA Araullo University logo" sx={{ width: { xs: 105, md: 140 }, height: { xs: 105, md: 140 }, objectFit: 'contain' }} />
            <Typography sx={{ color: '#000000', fontWeight: 850, fontSize: { xs: 24, md: 30 }, lineHeight: 1.25, mt: 2 }}>PHINMA AU<br />University</Typography>
          </Box>
          <Box component="form" onSubmit={submit} sx={{ pl: { md: 4 }, py: { xs: 1, md: 2 }, minWidth: 0 }}>
            <Typography component="h1" sx={{ color: '#000000', fontWeight: 850, fontSize: { xs: 23, md: 26 }, textAlign: 'center', mb: 2.5 }}>Create Student Account</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>Account created successfully!</Alert>}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, columnGap: 2, rowGap: 1.5 }}>
              {[
                { name: 'fullName', label: 'Full Name', placeholder: 'Enter your full name', icon: <PersonOutline /> },
                { name: 'studentId', label: 'Student ID', placeholder: 'XX-XXXX-XXXXX', icon: <BadgeOutlined /> },
                { name: 'email', label: 'Email Address', placeholder: 'Enter your email', type: 'email', icon: <EmailOutlined /> }
              ].map(field => <Box key={field.name}><Typography component="label" htmlFor={'register-' + field.name} sx={{ display: 'block', color: '#000000', fontWeight: 700, fontSize: 12.5, mb: .55 }}>{field.label}</Typography><TextField id={'register-' + field.name} size="small" fullWidth required name={field.name} type={field.type || 'text'} placeholder={field.placeholder} value={values[field.name]} onChange={update} InputProps={{ startAdornment: <InputAdornment position="start">{React.cloneElement(field.icon, { sx: { fontSize: 19, color: '#65758A' } })}</InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '7px' } }} /></Box>)}
              <Box><Typography component="label" htmlFor="register-course" sx={{ display: 'block', color: '#000000', fontWeight: 700, fontSize: 12.5, mb: .55 }}>Course</Typography><TextField id="register-course" size="small" fullWidth select required name="course" value={values.course} onChange={update} SelectProps={{ displayEmpty: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '7px' } }}><MenuItem value="" disabled>Select Course</MenuItem>{courses.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField></Box>
              <Box><Typography component="label" htmlFor="register-year" sx={{ display: 'block', color: '#000000', fontWeight: 700, fontSize: 12.5, mb: .55 }}>Year Level</Typography><TextField id="register-year" size="small" fullWidth select required name="yearLevel" value={values.yearLevel} onChange={update} SelectProps={{ displayEmpty: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '7px' } }}><MenuItem value="" disabled>Select Year Level</MenuItem>{yearLevels.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}</TextField></Box>
              <Box><Typography component="label" htmlFor="register-password" sx={{ display: 'block', color: '#000000', fontWeight: 700, fontSize: 12.5, mb: .55 }}>Password</Typography><TextField id="register-password" size="small" fullWidth required name="password" value={values.password} type={visible ? 'text' : 'password'} onChange={update} placeholder="Create a password" helperText="8+ characters and one special character" InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 19, color: '#65758A' }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton size="small" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(v => !v)}>{visible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '7px' } }} /></Box>
            </Box>
            <Button type="submit" variant="contained" fullWidth disabled={loading || success} sx={{ mt: 2.5, minHeight: 45, bgcolor: '#2e66a6', color: '#FFFFFF', borderRadius: '7px', fontWeight: 800, '&:hover': { bgcolor: '#245487', boxShadow: '0 5px 13px rgba(46,102,166,.22)' } }}>{loading ? <CircularProgress size={23} color="inherit" /> : 'Register'}</Button>
            <Typography sx={{ color: '#000000', mt: 2, textAlign: 'center', fontSize: 14 }}>Already have an account? <Link component={RouterLink} to="/login" underline="hover" fontWeight={700}>Login here</Link></Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
