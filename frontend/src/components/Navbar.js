import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Drawer,
  ListItemButton,
  Divider
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CloseIcon from '@mui/icons-material/Close';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

// Dark navigation surface with contrasting gold labels.
const colors = {
  primary: '#2e66a6',
  accent: '#000000',
  bgCard: '#FFFFFF',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSelected, setMobileSelected] = useState('Home');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate('/');
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const scrollToSection = (sectionId) => {
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const yOffset = -80;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        // WHITE background para sa AppBar
        backgroundColor: '#2e66a6', 
        boxShadow: '0 2px 14px rgba(0,0,0,0.07)',
        borderRadius: '0px',
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out',
        // Inalis ang blur para mas clean
        background: '#2e66a6' // Navigation frame
      }}
    >
      <Toolbar sx={{ minHeight: { xs: '64px', md: '64px' }, py: 0.5, px: { xs: 2, md: 4 }, gap: 1 }}>
        {/* Logo - Left Side */}
        <Box 
          component={RouterLink} 
          to="/"
          sx={{ 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              opacity: 0.9
            }
          }}
        >
          <AutoStoriesIcon sx={{ fontSize: { xs: 27, md: 34 }, color: '#FFFFFF', mr: 1.5 }} />
          <Typography 
            variant="h5" 
            sx={{ 
              // BLACK ang logo text
              color: '#FFFFFF', 
              fontWeight: 'bold',
              fontSize: '1.6rem',
              fontFamily: 'Arial, sans-serif',
              // Inalis ang gradient, ginawang solid Black text
            }}
          >
            E-Library
          </Typography>
        </Box>
        <Box aria-hidden="true" sx={{ display: { xs: 'none', lg: 'block' }, width: '1px', height: 34, bgcolor: 'rgba(255,255,255,.55)', ml: 3.5 }} />

        {/* Navigation Buttons - Center (Logged-in User) */}
        {user ? (
          <Box sx={{ flexGrow: 1, display: { xs: 'none', lg: 'flex' }, justifyContent: 'center', gap: 0 }}>
            {/* Nav Links - Black text, Pale Pink Hover BG */}
            {['/book-catalog', '/my-borrowed', '/profile'].map((path, index) => {
                const labels = ["Book Catalog", "My Borrowed Books", "Profile"];
                return (
                    <Button 
                        key={path}
                        color="inherit" 
                        component={RouterLink} 
                        to={path}
                        sx={{ 
                            fontWeight: '600',
                            fontSize: '1rem',
                            textTransform: 'none',
                            mx: 2,
                            color: '#FFFFFF', // Legible labels on blue navbar
                            borderRadius: '25px',
                            px: 3,
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,.13)', // Accessible navbar hover
                                color: "#FFFFFF", // White text on blue navbar
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)' // Subtle Black Shadow
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {labels[index]}
                    </Button>
                );
            })}
          </Box>
        ) : (
          /* Navigation Buttons - Center (Non-logged-in User) */
          <Box sx={{ flexGrow: 1, display: { xs: 'none', lg: 'flex' }, justifyContent: 'center', gap: 0 }}>
            {/* Home and Contact Links - Black text, Pale Pink Hover BG */}
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/"
              sx={{ 
                fontWeight: '600',
                fontSize: '1rem',
                textTransform: 'none',
                mx: 2,
                color: '#FFFFFF', // Legible labels on blue navbar
                borderRadius: '25px',
                px: 3,
                '&::after': { content: '""', position: 'absolute', bottom: 1, left: '27%', right: '27%', height: 3, borderRadius: 3, backgroundColor: '#FFFFFF' },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,.13)', // Accessible navbar hover
                  color: "#FFFFFF", // White text on blue navbar
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Home
            </Button>
          
            <Button color="inherit" onClick={() => scrollToSection('how-it-works')}
              sx={{ fontWeight: 600, fontSize: '1rem', textTransform: 'none', mx: 2, color: '#FFFFFF', px: 3, '&:hover': { backgroundColor: 'rgba(255,255,255,.13)' } }}>
              How It Works
            </Button>

            <Button 
              color="inherit" 
              onClick={() => scrollToSection('contact')}
              sx={{ 
                fontWeight: '600',
                fontSize: '1rem',
                textTransform: 'none',
                mx: 2,
                color: '#FFFFFF', // Legible labels on blue navbar
                borderRadius: '25px',
                px: 3,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,.13)', // Accessible navbar hover
                  color: "#FFFFFF", // White text on blue navbar
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Contact
            </Button>
          </Box>
        )}

        {/* Mobile right-side navigation drawer; desktop navbar remains unchanged. */}
        <IconButton
          aria-label="Open navigation menu"
          aria-controls="elibrary-mobile-drawer"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
          sx={{ display: { xs: 'inline-flex', lg: 'none' }, color: '#FFFFFF', ml: 'auto' }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          id="elibrary-mobile-drawer"
          anchor="right"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            zIndex: (theme) => theme.zIndex.modal + 1,
            '& .MuiDrawer-paper': {
              width: 'min(82vw, 310px)',
              maxWidth: '100vw',
              height: '100dvh',
              backgroundColor: '#FFFFFF',
              color: '#000000',
              borderRadius: '18px 0 0 18px',
              overflow: 'hidden',
              boxShadow: '-8px 0 28px rgba(0,0,0,.14)',
            },
          }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF' }}>
            {/* Compact transparent-image banner. Drawer is above the navbar so nothing is covered. */}
            <Box sx={{ px: 1.5, pt: 2, pb: 2, position: 'relative', flexShrink: 0 }}>
              <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '17px', lineHeight: 0 }}>
                <Box
                  component="img"
                  src="/img/Banner.png"
                  alt=""
                  aria-hidden="true"
                  sx={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '3.8 / 1', objectFit: 'fill' }}
                />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, px: 2 }}>
                  <AutoStoriesIcon sx={{ color: '#FFFFFF', fontSize: 27, flexShrink: 0 }} />
                  <Typography sx={{ color: '#FFFFFF', fontSize: '1.3rem', fontWeight: 800, whiteSpace: 'nowrap' }}>E-Library</Typography>
                </Box>
              </Box>
              <IconButton
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                size="small"
                sx={{ position: 'absolute', top: 8, right: 7, zIndex: 2, color: '#FFFFFF', bgcolor: 'rgba(0,0,0,.4)', '&:hover': { bgcolor: 'rgba(0,0,0,.55)' } }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box component="nav" aria-label="Mobile navigation" sx={{ px: 1.5, pt: 1, overflowY: 'auto', flex: 1, position: 'relative', zIndex: 1 }}>
              {(user ? [
                { label: 'Book Catalog', icon: <MenuBookOutlinedIcon />, path: '/book-catalog' },
                { label: 'My Borrowed Books', icon: <HistoryEduOutlinedIcon />, path: '/my-borrowed' },
                { label: 'Profile', icon: <PersonOutlineIcon />, path: '/profile' },
              ] : [
                { label: 'Home', icon: <HomeOutlinedIcon />, path: '/' },
                { label: 'How It Works', icon: <InfoOutlinedIcon />, section: 'how-it-works' },
                { label: 'Contact', icon: <PhoneOutlinedIcon />, section: 'contact' },
              ]).map((item) => {
                const active = user
                  ? window.location.pathname === item.path
                  : mobileSelected === item.label && (item.section || window.location.pathname === '/');
                return (
                  <ListItemButton
                    key={item.label}
                    component={item.path ? RouterLink : 'button'}
                    to={item.path || undefined}
                    onClick={() => {
                      setMobileSelected(item.label);
                      setMobileOpen(false);
                      if (item.section) scrollToSection(item.section);
                    }}
                    selected={Boolean(active)}
                    sx={{
                      borderRadius: '13px', mb: 0.75, px: 1.5, py: 1.5, gap: 2,
                      color: active ? '#205993' : '#000000',
                      backgroundColor: active ? '#e3f0fc' : '#FFFFFF',
                      '&.Mui-selected': { backgroundColor: '#e3f0fc' },
                      '&:hover, &.Mui-selected:hover': { backgroundColor: '#edf5fc' },
                      '& .MuiSvgIcon-root': { fontSize: 23, color: '#2e66a6', flexShrink: 0 },
                    }}
                  >
                    {item.icon}
                    <Typography sx={{ fontSize: '1rem', fontWeight: active ? 750 : 500, color: 'inherit' }}>{item.label}</Typography>
                  </ListItemButton>
                );
              })}
              <Divider sx={{ my: 1.5, borderColor: '#d8e3ed' }} />
              {(user ? [
                { label: 'Logout', icon: <LogoutOutlinedIcon />, action: handleLogoutClick },
              ] : [
                { label: 'Log in', icon: <LoginOutlinedIcon />, path: '/login' },
                { label: 'Register', icon: <PersonAddAltOutlinedIcon />, path: '/register' },
              ]).map((item) => (
                <ListItemButton
                  key={item.label}
                  component={item.path ? RouterLink : 'button'}
                  to={item.path || undefined}
                  onClick={() => { setMobileOpen(false); if (item.action) item.action(); }}
                  sx={{ borderRadius: '13px', mb: 0.75, px: 1.5, py: 1.5, gap: 2,
                    color: '#000000', '&:hover': { backgroundColor: '#edf5fc' },
                    '& .MuiSvgIcon-root': { fontSize: 23, color: '#2e66a6', flexShrink: 0 } }}
                >
                  {item.icon}
                  <Typography sx={{ fontSize: '1rem', color: 'inherit' }}>{item.label}</Typography>
                </ListItemButton>
              ))}
            </Box>
            <Box aria-hidden="true" sx={{ height: 58, flexShrink: 0, position: 'relative', overflow: 'hidden',
              '&::before': { content: '""', position: 'absolute', left: '-10%', bottom: -37, width: '125%', height: 79, backgroundColor: '#2e66a6', borderRadius: '70% 0 0 0', transform: 'rotate(-9deg)' },
              '&::after': { content: '""', position: 'absolute', right: '-7%', bottom: 0, width: '90%', height: 8, backgroundColor: '#7db7eb', transform: 'rotate(-16deg)', transformOrigin: 'right bottom' },
            }} />
          </Box>
        </Drawer>

        {/* Right Side - Auth Buttons */}
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
          {user ? (
            /* LOGOUT BUTTON - Black Text, Pale Pink BG Hover */
            <Button 
              color="inherit" 
              onClick={handleLogoutClick}
              sx={{ 
                fontWeight: '600',
                fontSize: '1rem',
                textTransform: 'none',
                // Default: Black text, Transparent/White background
                color: '#FFFFFF', 
                borderRadius: '25px',
                px: 3,
                py: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,.13)', // Accessible navbar hover
                  color: "#FFFFFF", // White text on blue navbar
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Logout
            </Button>
          ) : (
            <>
              {/* LOG IN BUTTON - Black Text, Pale Pink BG Hover */}
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ 
                  fontWeight: '600',
                  fontSize: '1rem',
                  textTransform: 'none',
                  color: '#FFFFFF', // Legible labels on blue navbar
                  borderRadius: '25px',
                  px: 3,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,.13)', // Accessible navbar hover
                    color: "#FFFFFF", // White text on blue navbar
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Log in
              </Button>
              {/* REGISTER BUTTON - Pale Pink/Peach BG, White Text */}
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/register"
                sx={{ 
                  fontWeight: '600',
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderRadius: '25px',
                  px: 4,
                  // Pale Pink/Peach background
                  backgroundColor: "#FFFFFF", 
                  color: "#2e66a6", // Black text
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  '&:hover': {
                    // Darker Pink or Black hover background
                    backgroundColor: "#2e66a6", // Hover: approved primary blue
                    color: "#FFFFFF", // White text on hover
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>

      {/* LOGOUT CONFIRMATION DIALOG */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 15px 50px rgba(0,0,0,0.2)',
            width: 'min(420px, calc(100vw - 32px))', minWidth: 0
          }
        }}
      >
        {/* Dialog Title - Pale Pink Background, Black Text */}
        <DialogTitle id="logout-dialog-title" sx={{ 
          textAlign: 'center',
          backgroundColor: colors.primary, // Pale Pink/Peach
          color: "#FFFFFF", // White text
          fontWeight: 'bold',
          fontSize: '1.3rem'
        }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <DialogContentText 
            id="logout-dialog-description" 
            sx={{ fontSize: '1.1rem', color: colors.accent }} // Black text
          >
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
          {/* Cancel Button - Black text, Pale Pink Border/Hover */}
          <Button 
            onClick={handleLogoutCancel}
            variant="outlined"
            sx={{ 
              borderRadius: '25px',
              px: 4,
              py: 1,
              fontSize: '1rem',
              textTransform: 'none',
              fontWeight: '600',
              borderColor: colors.accent, // Black Border
              color: colors.accent, // Black Text
              '&:hover': {
                backgroundColor: colors.primary, // Pale Pink Hover BG
                borderColor: colors.accent,
                color: colors.accent
              }
            }}
          >
            Cancel
          </Button>
          {/* Logout Button - Black BG, White Text, Pale Pink Hover BG */}
          <Button 
            onClick={handleLogoutConfirm}
            variant="contained"
            sx={{ 
              borderRadius: '25px',
              px: 4,
              py: 1,
              fontSize: '1rem',
              textTransform: 'none',
              fontWeight: '600',
              backgroundColor: colors.accent, // Black BG
              color: colors.bgCard, // White Text
              '&:hover': {
                backgroundColor: colors.primary, // Pale Pink Hover BG
                color: "#000000" // Black Text on hover
              }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;