import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  List,
  ListItem,
  Drawer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Book as BookIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  ExitToApp as LogoutIcon,
  Assignment as AssignmentIcon,
  TrendingUp as ReportsIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// --- Color Palette ---
const colors = {
  accent: '#2e66a6', // Light Pink/Peach - Used for active states and highlights
  main: '#2e66a6',     // Black - Used for text and main elements
  light: '#000000',    // White - Used for sidebar background
};

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = () => {
    // Call the logout function from AuthContext
    logout();
    
    // Close the dialog
    setLogoutDialog(false);
    
    // Redirect to login page
    navigate('/login');
  };

  const handleLogoutClick = () => {
    setLogoutDialog(true);
  };

  const handleCancelLogout = () => {
    setLogoutDialog(false);
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin/dashboard',
    },
     {
      text: 'Analytics',
      icon: <ReportsIcon />,
      path: '/admin/reports',
    },
    {
      text: 'Manage Books',
      icon: <BookIcon />,
      path: '/admin/books',
    },
    {
      text: 'Manage Users',
      icon: <PeopleIcon />,
      path: '/admin/users',
    },
    {
      text: 'Borrow Requests',
      icon: <AssignmentIcon />,
      path: '/admin/borrow-requests',
    },
    {
      text: 'Return Requests',
      icon: <InventoryIcon />,
      path: '/admin/return-requests',
    },
   
  ];

  return (
    <>
    <IconButton aria-label="Open admin navigation" onClick={() => setMobileOpen(true)}
      sx={{ display: { xs: 'inline-flex', md: 'none' }, position: 'fixed', top: 12, right: 16, zIndex: (theme) => theme.zIndex.drawer + 2,
        bgcolor: '#2e66a6', color: '#fff', border: '1px solid rgba(255,255,255,.4)', boxShadow: 2,
        '&:hover': { bgcolor: '#245487' } }}><MenuIcon /></IconButton>
    <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}
      ModalProps={{ keepMounted: true }} PaperProps={{ sx: { width: 'min(86vw, 300px)', bgcolor: '#2e66a6', color: '#fff', p: 2, overflowY: 'auto' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography fontWeight="bold" color="white">E-Library Admin</Typography>
        <IconButton aria-label="Close admin navigation" onClick={() => setMobileOpen(false)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
      </Box>
      <Button component={RouterLink} onClick={() => setMobileOpen(false)} to="/admin/add-book" startIcon={<AddIcon />}
        sx={{ bgcolor: '#fff', color: '#2e66a6', fontWeight: 700, mb: 2, '&:hover': { bgcolor: '#eaf2fb' } }}>Add New Book</Button>
      <List sx={{ p: 0, flex: 1 }}>
        {menuItems.map(item => <ListItem key={item.path} disablePadding>
          <Button component={RouterLink} to={item.path} onClick={() => setMobileOpen(false)} startIcon={item.icon} fullWidth
            sx={{ justifyContent: 'flex-start', color: '#fff', my: .3, py: 1.25, backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,.18)' : 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,.15)' } }}>{item.text}</Button>
        </ListItem>)}
      </List>
      <Button startIcon={<LogoutIcon />} onClick={() => { setMobileOpen(false); handleLogoutClick(); }}
        sx={{ color: '#fff', justifyContent: 'flex-start', mt: 2 }}>Logout</Button>
    </Drawer>
    <Box
      className="elibrary-admin-sidebar"
      sx={{
        // 🌟 UPDATED: Liitan ang width
        width: 280, 
        // 🌟 UPDATED: Gawing White ang background
        backgroundColor: '#2e66a6', 
        color: colors.main, // Black text
        p: 3,
        position: 'fixed',
        height: '100dvh',
        overflowY: 'auto',
        zIndex: (theme) => theme.zIndex.drawer,
        boxShadow: '4px 0 15px rgba(0,0,0,0.1)', // Light shadow
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 5, borderBottom: `2px solid ${colors.accent}`, pb: 2 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: colors.main }}>
           E-Library Admin
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5, color: colors.main }}>
          Management System
        </Typography>
      </Box>

      {/* Add Book Quick Action */}
      <Button
        component={RouterLink}
        to="/admin/add-book"
        variant="contained"
        startIcon={<AddIcon />}
        fullWidth
        sx={{
          justifyContent: 'flex-start',
          // Accent color as the background for the primary action button
          backgroundColor: '#FFFFFF',
          color: '#2e66a6', // Black text on accent button
          mb: 4,
          py: 1.5,
          borderRadius: '12px', 
          fontWeight: 'bold',
          fontSize: '1rem',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)', 
          '&:hover': {
            backgroundColor: colors.main, // Hover to Black
            color: colors.light, // White text on hover
          },
        }}
      >
        Add New Book
      </Button>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, p: 0 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <Button
                component={RouterLink}
                to={item.path}
                fullWidth
                sx={{
                  justifyContent: 'flex-start',
                  // Active State: Accent background with Black text
                  backgroundColor: isActive ? 'rgba(255,255,255,.20)' : 'transparent',
                  color: colors.main,
                  fontWeight: isActive ? 'bold' : 'normal',
                  
                  // Icons color
                  '& .MuiButton-startIcon': {
                    color: isActive ? colors.main : colors.accent,
                  },
                  
                  // Hover state
                  '&:hover': {
                    backgroundColor: colors.accent, // Use accent for hover
                    color: colors.main,
                  },
                  py: 1.2,
                  px: 2,
                  borderRadius: '10px',
                }}
                startIcon={item.icon}
              >
                {item.text}
              </Button>
            </ListItem>
          );
        })}
      </List>

      {/* Logout Button */}
      <Button
        onClick={handleLogoutClick}
        startIcon={<LogoutIcon />}
        fullWidth
        sx={{
          justifyContent: 'flex-start',
          color: colors.main,
          backgroundColor: 'transparent',
          border: `1px solid ${colors.accent}`, // Border for definition
          '&:hover': {
            backgroundColor: colors.accent, // Accent color for hover
            color: colors.main,
          },
          py: 1.5,
          px: 2,
          borderRadius: '10px',
          mt: 4,
        }}
      >
        Logout
      </Button>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialog}
        onClose={handleCancelLogout}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout from the admin panel?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="error" variant="contained" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </>
  );
};

export default AdminSidebar;