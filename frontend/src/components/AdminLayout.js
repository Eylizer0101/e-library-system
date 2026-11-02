import React from 'react';
import { Box } from '@mui/material';
import AdminSidebar from './AdminSidebar';
import Navbar from './Navbar';

const AdminLayout = ({ children, hideNavbar = false }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', width: '100%', minWidth: 0 }}>
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          marginLeft: { xs: 0, md: '280px' }, // Same as sidebar width
          width: { xs: '100%', md: 'calc(100% - 280px)' }, minWidth: 0 // Adjust width considering sidebar
        }}
      >
        {/* Navbar - Conditionally rendered */}
        {!hideNavbar && <Navbar />}
        
        {/* Page Content */}
        <Box 
          component="main" 
          sx={{ 
            flex: 1, 
            pt: hideNavbar ? { xs: 7, md: 0 } : { xs: 8, md: 8 },
            minWidth: 0, width: '100%', overflowX: 'clip', // Adjust padding based on navbar visibility
            backgroundColor: '#FFFFFF'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;