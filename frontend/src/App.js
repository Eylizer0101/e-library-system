import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookCatalog from './pages/BookCatalog';
import MyBorrowedBooks from './pages/MyBorrowedBooks';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddBook from './pages/admin/AddBook';
import BookDetails from './pages/BookDetails';
import ManageBooks from './pages/admin/ManageBooks';
import AdminBookDetails from './pages/admin/AdminBookDetails';
import EditBook from './pages/admin/EditBook';
import ManageUsers from './pages/admin/ManageUsers';
import UserDetails from './pages/admin/UserDetails';
import ManageBorrowRequests from './pages/admin/ManageBorrowRequests';
import BorrowRequestDetailsPage from './pages/admin/BorrowRequestDetailsPage';
import ManageReturnRequests from './pages/admin/ManageReturnRequests';
// ADD THIS IMPORT
import Analytics from './pages/admin/Analytics';

const DARK_BROWN = '#000000';
const BROWN = '#2e66a6';
const GOLD = '#2e66a6';
const CREAM = '#FFFFFF';
const WHITE = '#FFFFFF';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: BROWN, light: GOLD, dark: DARK_BROWN, contrastText: WHITE },
    secondary: { main: BROWN, light: BROWN, dark: DARK_BROWN, contrastText: WHITE },
    background: { default: CREAM, paper: WHITE },
    text: { primary: DARK_BROWN, secondary: BROWN },
    divider: GOLD,
    success: { main: '#2e66a6' }, warning: { main: '#2e66a6' }, error: { main: '#2e66a6' }, info: { main: '#2e66a6' },
    action: { active: GOLD, hover: 'rgba(46,102,166,.12)', selected: 'rgba(46,102,166,.22)', disabled: 'rgba(46,102,166,.48)' },
  },
  typography: {
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
    h3: { fontWeight: 800, letterSpacing: '-.035em' },
    h4: { fontWeight: 800, letterSpacing: '-.03em' },
    h5: { fontWeight: 750 }, h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: CREAM, color: DARK_BROWN } } },
    MuiButton: { styleOverrides: {
      root: { borderRadius: 11, minHeight: 42, padding: '9px 18px', boxShadow: 'none', fontWeight: 750, '&:focus-visible': { outline: `2px solid ${GOLD}`, outlineOffset: 3 } },
      contained: { backgroundImage: 'none', '&:hover': { boxShadow: 'none' } },
    } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none', border: '1px solid #D9E4F0' } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 17, boxShadow: '0 6px 22px rgba(0,0,0,.07)' } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 11, backgroundColor: WHITE } } },
    MuiTableHead: { styleOverrides: { root: { backgroundColor: '#F5F8FC' } } },
    MuiTableCell: { styleOverrides: { root: { borderBottom: `1px solid ${GOLD}` }, head: { fontWeight: 800, color: DARK_BROWN } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 18 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 9, fontWeight: 700 } } },
  },
});

// Component to conditionally show Navbar
const AppContent = () => {
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith('/admin') && !['/login', '/register'].includes(location.pathname);

  return (
    <div className="App">
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* User Routes */}
        <Route 
          path="/book-catalog" 
          element={
            <ProtectedRoute>
              <BookCatalog />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-borrowed" 
          element={
            <ProtectedRoute>
              <MyBorrowedBooks />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/borrowed-book-details/:borrowId" 
          element={
            <ProtectedRoute>
              <BookDetails />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        {/* ADD ANALYTICS ROUTE */}
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <Analytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/add-book" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AddBook />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/books" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <ManageBooks />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/book-details/:id" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminBookDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/edit-book/:id" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <EditBook />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <ManageUsers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/user-details/:id" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <UserDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/borrow-requests" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <ManageBorrowRequests />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/borrow-request-details" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <BorrowRequestDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/return-requests" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <ManageReturnRequests />
            </ProtectedRoute>
          } 
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/book-catalog" />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    // Redirect to appropriate page based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/book-catalog" />;
    }
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;