import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Stack
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Email, 
  Phone, 
  LocationOn, 
  Book, 
  Search, 
  History, 
  Person,
  LibraryBooks,
  AccessTime,
  ArrowForward
} from '@mui/icons-material';

// Strict three-color palette with readable foreground/background combinations.
const colors = {
  primary: '#2e66a6',
  secondary: '#2e66a6',
  dark: '#000000',
  lightBg: '#FFFFFF',
  neutral: '#FFFFFF',
  text: '#000000',
  white: '#FFFFFF',
};

const Home = () => {
  const { user } = useAuth();

  // Opens the visitor's email application; sending requires the visitor to confirm there.
  const handleContactSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const sender = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (!sender || !message) return;
    const subject = encodeURIComponent('E-Library Contact Inquiry');
    const body = encodeURIComponent(`From: ${sender}\n\n${message}`);
    window.location.href = `mailto:library@university.edu?subject=${subject}&body=${body}`;
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <Stack width="100%" alignItems="center" sx={{ backgroundColor: "#FFFFFF", pt: { xs: 8, md: 8 } }}>

      {/* Hero landing section: keeps existing action destinations and the original image asset. */}
      <Box component="section" id="home" sx={{
        width: '100%', overflow: 'hidden', position: 'relative',
        minHeight: { xs: 'auto', md: 'min(780px, calc(100svh - 72px))' },
        display: 'flex', alignItems: 'center',
        background: 'linear-gradient(128deg, #f8fcff 0%, #e8f3ff 55%, #cce3fa 100%)',
        '&::before': { content: '""', position: 'absolute', pointerEvents: 'none', width: '85%', height: '78%', top: '-35%', right: '-30%', borderRadius: '0 0 55% 65%', transform: 'rotate(-20deg)', background: 'rgba(255,255,255,.30)' },
        '&::after': { content: '""', position: 'absolute', pointerEvents: 'none', width: '125%', height: { xs: 110, md: 165 }, bottom: { xs: -75, md: -118 }, left: '-12%', borderRadius: '50% 50% 0 0', transform: 'rotate(-3deg)', background: 'linear-gradient(105deg, #b6d8f7, #d3e7fc 52%, #a6d0f5)', opacity: .85 }
      }}>
        <Box sx={{
          width: '100%', maxWidth: 1700, mx: 'auto', position: 'relative', zIndex: 1,
          px: { xs: 2.5, sm: 5, md: 6, lg: 9 },
          pt: { xs: 6, sm: 8, md: 4 }, pb: { xs: 9, md: 7 },
          display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 46%) minmax(0, 54%)' },
          gap: { xs: 3, md: 1 }, alignItems: 'center'
        }}>
          <Box sx={{ minWidth: 0, position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.2, px: 2.1, py: 1, mb: { xs: 3, md: 4 }, border: '1px solid #a8cff8', borderRadius: 10, bgcolor: '#FFFFFF', color: '#000000', fontSize: { xs: 12, sm: 14 }, fontWeight: 750 }}><LibraryBooks fontSize="small" /> Your digital campus library</Box>
            <Typography component="h1" sx={{ color: '#000000', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-.045em', fontSize: { xs: 'clamp(2.2rem,9vw,3.35rem)', sm: '3.7rem', md: 'clamp(2.6rem,4.1vw,4.8rem)' }, mb: { xs: 2.5, md: 3 }, overflowWrap: 'normal' }}>
              PHINMA AU<Box component="span" sx={{ display: 'block', color: '#000000', whiteSpace: { lg: 'nowrap' } }}>E-Library System</Box>
            </Typography>
            <Typography component="h2" sx={{ color: '#000000', fontSize: { xs: '1.3rem', sm: '1.55rem', lg: '1.9rem' }, fontWeight: 850, mb: 2.5 }}>Digital Library Management</Typography>
            <Typography sx={{ color: '#000000', lineHeight: 1.65, maxWidth: 575, fontSize: { xs: '1rem', md: '1.07rem', lg: '1.15rem' }, mb: 4 }}>
              Browse, borrow, and return books online. Explore our collection, submit borrowing requests, and keep track of your library activity—all in one place.
            </Typography>
            {!user && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ maxWidth: { xs: 350, sm: 'none' }, alignItems: { xs: 'stretch', sm: 'center' } }}>
              <Button component={RouterLink} to="/register" variant="contained" endIcon={<ArrowForward />} sx={{ bgcolor: '#2e66a6', color: '#FFFFFF', px: { xs: 3, md: 4 }, py: 1.5, minHeight: 55, borderRadius: '12px', fontSize: '1rem', boxShadow: '0 8px 22px rgba(25,84,150,.16)', '&:hover': { bgcolor: '#2e66a6' } }}>Get Started</Button>
              <Button component={RouterLink} to="/login" variant="outlined" sx={{ border: '2px solid #2e66a6', color: '#2e66a6', bgcolor: 'rgba(255,255,255,.84)', px: { xs: 3, md: 4 }, py: 1.5, minHeight: 55, borderRadius: '12px', fontSize: '1rem', '&:hover': { border: '2px solid #2e66a6', bgcolor: '#FFFFFF' } }}>Student Login</Button>
            </Stack>}
          </Box>
          <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, py: { xs: 1, md: 2 } }}>
            <Box component="img" src="/img/landing%20page/E-LibraryStudy.png" alt="E-Library laptop, academic books, and library workspace" sx={{ display: 'block', width: '100%', maxWidth: 900, height: 'auto', maxHeight: { md: 610 }, objectFit: 'contain', filter: 'drop-shadow(0 20px 24px rgba(22,72,130,.10))' }} />
          </Box>
        </Box>
      </Box>

      {/* QUICK ACTIONS FOR LOGGED IN USERS */}
      {user && (
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom color={colors.dark} fontWeight="bold">
            Quick Actions
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }, borderRadius: '20px' }}>
                {/* Ginawang black ang icon color */}
                <Search sx={{ fontSize: 60, color: colors.primary, mb: 2 }} /> 
                <Typography variant="h5" gutterBottom fontWeight="bold" color={colors.dark}>
                  Browse Books
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Explore our extensive collection of books across various categories and genres.
                </Typography>
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/book-catalog"
                  size="large"
                  sx={{ 
                    fontWeight: 'bold', 
                    px: 4,
                    // Ginawang primary (#2e66a6) ang background at black ang teksto
                    bgcolor: colors.primary, 
                    color: colors.dark,
                    borderRadius: '10px',
                    '&:hover': {
                      bgcolor: colors.dark,
                      color: colors.primary,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Browse Catalog
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }, borderRadius: '20px' }}>
                {/* Ginawang black ang icon color */}
                <History sx={{ fontSize: 60, color: colors.primary, mb: 2 }} /> 
                <Typography variant="h5" gutterBottom fontWeight="bold" color={colors.dark}>
                  My Borrowed Books
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  View your currently borrowed books and track return dates.
                </Typography>
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/my-borrowed"
                  size="large"
                  sx={{ 
                    fontWeight: 'bold', 
                    px: 4,
                    // Ginawang primary (#2e66a6) ang background at black ang teksto
                    bgcolor: colors.primary, 
                    color: colors.dark,
                    borderRadius: '10px',
                    '&:hover': {
                      bgcolor: colors.dark,
                      color: colors.primary,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  View My Books
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      )}


      {/* HOW IT WORKS SECTION — compact, white, responsive horizontal steps */}
      <Box component="section" id="how-it-works" sx={{
        width: '100%', bgcolor: '#FFFFFF', scrollMarginTop: '90px',
        pt: { xs: 6, md: 9 }, pb: { xs: 7, md: 10 }
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              borderRadius: '999px', px: 2.5, py: 1, mb: 2, color: '#2e66a6', fontWeight: 800,
              bgcolor: '#FFFFFF', border: '1px solid #B9DFFF'
            }}>
              <LibraryBooks sx={{ fontSize: 22 }} /> How It Works
            </Box>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={{ xs: 1.5, sm: 3 }}>
              <Box sx={{ width: { xs: 22, sm: 95 }, height: 3, bgcolor: '#2e66a6', borderRadius: 2 }} />
              <Typography component="h2" sx={{
                color: '#000000', fontWeight: 900, letterSpacing: '-.035em', lineHeight: 1.15,
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }, whiteSpace: 'nowrap'
              }}>
                How It Works
              </Typography>
              <Box sx={{ width: { xs: 22, sm: 95 }, height: 3, bgcolor: '#2e66a6', borderRadius: 2 }} />
            </Stack>
            <Typography sx={{ color: '#000000', mt: 1.8, fontSize: { xs: '.95rem', md: '1.1rem' } }}>
              Get started with our e-library in 3 simple steps.
            </Typography>
          </Box>

          <Box sx={{
            display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            gap: { xs: 2, md: 2.5 }, width: '100%'
          }}>
            {[
              { title: 'Browse Catalog', desc: 'Search and explore our extensive book collection.', icon: <Search sx={{ fontSize: { xs: 31, sm: 36 } }} /> },
              { title: 'Request Book', desc: 'Borrow books with simple click requests.', icon: <Book sx={{ fontSize: { xs: 31, sm: 36 } }} /> },
              { title: 'Track & Return', desc: 'Monitor due dates and return books easily.', icon: <History sx={{ fontSize: { xs: 31, sm: 36 } }} /> }
            ].map((item, index) => (
              <Card key={item.title} elevation={0} sx={{
                position: 'relative', minWidth: 0, bgcolor: '#FFFFFF',
                border: '1px solid #D8E6F5', borderBottom: '2px solid #2e66a6',
                borderRadius: '20px', boxShadow: '0 8px 20px rgba(0,0,0,.07)',
                transition: 'transform .2s ease, box-shadow .2s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 24px rgba(0,0,0,.10)' }
              }}>
                <Box sx={{
                  position: 'absolute', top: 10, left: 12, zIndex: 1,
                  width: { xs: 29, sm: 33 }, height: { xs: 29, sm: 33 },
                  display: 'grid', placeItems: 'center', borderRadius: '50%',
                  bgcolor: '#2e66a6', color: '#FFFFFF', fontWeight: 800, fontSize: 16
                }}>{index + 1}</Box>
                <CardContent sx={{
                  display: 'flex', flexDirection: 'row', alignItems: 'center',
                  gap: { xs: 1.5, sm: 2 },
                  pl: { xs: 2, sm: 2.5 }, pr: { xs: 2, sm: 2.5 },
                  pt: { xs: 6.5, sm: 5 }, pb: { xs: 2.5, sm: 3 },
                  minHeight: { xs: 160, sm: 155, md: 175 },
                  '&:last-child': { pb: { xs: 2.5, sm: 3 } }
                }}>
                  <Box sx={{
                    flexShrink: 0, width: { xs: 65, sm: 76, md: 70 },
                    height: { xs: 65, sm: 76, md: 70 },
                    display: 'grid', placeItems: 'center', borderRadius: '50%',
                    color: '#2e66a6', bgcolor: '#EFF6FD', border: '1px solid #D7E9FA'
                  }}>{item.icon}</Box>
                  <Box sx={{ borderLeft: '1px solid #D8E6F5', pl: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
                    <Typography component="h3" sx={{
                      fontWeight: 850, color: '#000000', fontSize: { xs: '1.05rem', sm: '1.2rem' },
                      lineHeight: 1.25, mb: 0.75
                    }}>{item.title}</Typography>
                    <Typography sx={{ color: '#000000', fontSize: { xs: '.85rem', sm: '.92rem' }, lineHeight: 1.5 }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CONTACT SECTION */}
      <Container id="contact" maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 7 }, scrollMarginTop: '90px' }}>
        <Typography variant="h4" component="h2" textAlign="center" sx={{ color: colors.dark, fontWeight: 850, mb: 1, fontSize: { xs: '1.9rem', md: '2.25rem' } }}>Contact Us</Typography>
        <Typography textAlign="center" sx={{ color: '#000000', mb: 3 }}>Have questions about our e-library system? Our team is here to help you.</Typography>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: '15px', border: '1px solid #DAE8F7', boxShadow: '0 5px 22px rgba(24,60,105,.055)' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, alignItems: 'stretch' }}>
            <Stack spacing={2.5} sx={{ py: 1 }}>
              {[
                { title: 'Library Location', value: 'Main Campus Library Building', icon: <LocationOn /> },
                { title: 'Email', value: 'library@university.edu', icon: <Email /> },
                { title: 'Phone', value: '(044) 123-4567', icon: <Phone /> }
              ].map(item => <Stack key={item.title} direction="row" spacing={2} alignItems="center">
                <Box sx={{ flexShrink: 0, width: 55, height: 55, borderRadius: '50%', bgcolor: '#FFFFFF', color: colors.primary, display: 'grid', placeItems: 'center', '& svg': { fontSize: 27 } }}>{item.icon}</Box>
                <Box sx={{ minWidth: 0 }}><Typography sx={{ color: '#000000', fontWeight: 750 }}>{item.title}</Typography><Typography sx={{ color: '#000000', overflowWrap: 'anywhere' }}>{item.value}</Typography></Box>
              </Stack>)}
            </Stack>
            <Box sx={{ bgcolor: '#FFFFFF', borderRadius: '13px', p: { xs: 2.5, sm: 3 }, height: '100%' }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}><Box sx={{ display: 'grid', placeItems: 'center', color: colors.primary, bgcolor: '#FFFFFF', borderRadius: '50%', width: 45, height: 45 }}><AccessTime /></Box><Typography variant="h6" sx={{ color: '#000000', fontWeight: 800 }}>Library Hours</Typography></Stack>
              {[['Monday - Friday', '8:00 AM - 8:00 PM'], ['Saturday', '9:00 AM - 5:00 PM'], ['Sunday', 'Closed']].map(([day, hours], i) => <Box key={day} sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, py: 1.3, borderBottom: i < 2 ? '1px solid #D3E4F5' : 'none' }}><Typography sx={{ color: '#000000' }}>{day}</Typography><Typography sx={{ color: '#000000', fontWeight: 600 }}>{hours}</Typography></Box>)}
            </Box>
          </Box>
          <Box component="form" onSubmit={handleContactSubmit} sx={{ mt: 4, pt: 3, borderTop: '1px solid #DAE8F7' }}>
            <Typography component="h3" variant="h6" sx={{ fontWeight: 800, color: colors.dark, mb: 0.5 }}>Send Us a Message</Typography>
            <Typography sx={{ color: '#000000', mb: 2 }}>Enter your email and message below.</Typography>
            <Stack spacing={2}>
              <TextField name="email" label="Your Email" type="email" autoComplete="email" placeholder="you@example.com" required fullWidth inputProps={{ maxLength: 254 }} />
              <TextField name="message" label="Message" multiline rows={4} placeholder="How can we help you?" required fullWidth inputProps={{ maxLength: 2000 }} />
              <Box><Button type="submit" variant="contained" startIcon={<Email />} sx={{ bgcolor: colors.primary, color: '#FFFFFF', px: 3, '&:hover': { bgcolor: '#245487' } }}>Send Message</Button></Box>
             
            </Stack>
          </Box>
        </Paper>
      </Container>

      {/* FOOTER */}
      <Box component="footer" sx={{ bgcolor: colors.primary, color: '#FFFFFF', width: '100%', py: 3 }}>
        <Container maxWidth="lg"><Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2.5}>
          <Box><Typography sx={{ color: '#FFFFFF', fontWeight: 850, fontSize: '1.35rem' }}>E-Library</Typography><Typography sx={{ color: '#FFFFFF', fontSize: '.85rem' }}>PHINMA AU E-Library System</Typography><Typography sx={{ color: '#FFFFFF', fontSize: '.8rem', opacity: .93 }}>Your digital campus library.</Typography></Box>
          <Stack direction="row" spacing={3} flexWrap="wrap"><Button component={RouterLink} to="/" sx={{ color: '#FFFFFF' }}>Home</Button><Button onClick={() => scrollToSection('how-it-works')} sx={{ color: '#FFFFFF' }}>How It Works</Button><Button onClick={() => scrollToSection('contact')} sx={{ color: '#FFFFFF' }}>Contact</Button></Stack>
          <Stack direction="row" spacing={1} alignItems="center"><LibraryBooks /><Typography sx={{ color: '#FFFFFF', fontSize: '.84rem', fontStyle: 'italic' }}>Browse. Borrow. Learn. Grow.</Typography></Stack>
        </Stack></Container>
      </Box>
    </Stack>
  );
};

export default Home;