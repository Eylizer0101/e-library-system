import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Chip,
  alpha,
  useTheme,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Collapse
} from '@mui/material';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import {
  TrendingUp,
  People,
  Assignment,
  Schedule,
  CheckCircle,
  Cancel,
  Pending,
  Analytics as AnalyticsIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart,
  TableChart,
  InsertChart,
  Assessment,
  DonutLarge,
  Group,
  Report,
  Category,
  Person,
  FilterList,
  DateRange,
  ExpandMore,
  ExpandLess,
  Book,
  Inventory,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';

// Color Palette based on your requirements - FIXED COLOR FORMATS
const COLORS = {
  primary: '#2e66a6', // Light Peach/Pink
  secondary: '#000000',  // Black in hex format
  accent: '#2e66a6'    // White
};

// Chart colors - different colors for each chart
const CHART_COLORS = {
  status: ['#2e66a6', '#2e66a6', '#2e66a6', '#2e66a6', '#2e66a6'],
  course: ['#2e66a6', '#2e66a6', '#2e66a6', '#2e66a6', '#2e66a6', '#2e66a6', '#2e66a6'],
  category: ['#2e66a6', '#2e66a6', '#2e66a6', '#2e66a6', '#2e66a6', '#2e66a6', '#2e66a6'],
  popular: ['#2e66a6', '#2e66a6', '#2e66a6', '#2e66a6', '#2e66a6'],
  monthly: '#2e66a6'
};

const STATUS_COLORS = {
  pending: '#2e66a6',
  approved: '#2e66a6',
  rejected: '#2e66a6',
  returned: '#2e66a6',
  return_requested: '#2e66a6'
};

// Actual courses from your register.js - UPDATED WITH ALL COURSES
const ACTUAL_COURSES = [
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

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChart, setActiveChart] = useState('status');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    startDate: '',
    endDate: '',
    status: 'all',
    course: 'all'
  });
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters from filters
      const queryParams = new URLSearchParams();
      if (filters.dateRange !== 'all') queryParams.append('dateRange', filters.dateRange);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.course !== 'all') queryParams.append('course', filters.course);

      const response = await fetch(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/api/admin/analytics?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError('Error loading analytics data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      startDate: '',
      endDate: '',
      status: 'all',
      course: 'all'
    });
  };

  // Format data for charts
  const formatStatusData = (data) => {
    if (!data) return [];
    return data.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
      color: STATUS_COLORS[item._id] || '#2e66a6'
    }));
  };

  const formatCourseData = (data) => {
    if (!data) return [];
    return data.map((item, index) => ({
      name: item._id,
      requests: item.count,
      fill: CHART_COLORS.course[index % CHART_COLORS.course.length]
    }));
  };

  const formatMonthlyData = (data) => {
    if (!data) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Create complete year data with all months
    const completeData = [];
    
    for (let month = 1; month <= 12; month++) {
      const monthData = data.find(item => 
        item._id.month === month && item._id.year === currentYear
      );
      
      completeData.push({
        month: months[month - 1],
        requests: monthData ? monthData.count : 0
      });
    }
    
    return completeData;
  };

  // Format category data for charts
  const formatCategoryData = (data) => {
    if (!data) return [];
    return data.map((item, index) => ({
      name: item._id,
      count: item.count,
      fill: CHART_COLORS.category[index % CHART_COLORS.category.length]
    }));
  };

  // Format popular books data
  const formatPopularBooksData = (data) => {
    if (!data) return [];
    return data.map((item, index) => ({
      name: item._id.length > 20 ? item._id.substring(0, 20) + '...' : item._id,
      fullName: item._id,
      requests: item.count,
      fill: CHART_COLORS.popular[index % CHART_COLORS.popular.length]
    }));
  };

  // Calculate total requests from real data
  const getTotalRequests = () => {
    if (!analytics || !analytics.statusDistribution) return 0;
    return analytics.statusDistribution.reduce((total, item) => total + item.count, 0);
  };

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <Card 
      sx={{ 
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${alpha(COLORS.primary, 0.8)} 100%)`,
        color: COLORS.secondary,
        boxShadow: 2,
        transition: 'all 0.3s ease',
        borderRadius: 3,
        height: '100%',
        border: `2px solid ${alpha(COLORS.secondary, 0.1)}`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: COLORS.secondary }}>
              {value}
            </Typography>
            <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: COLORS.secondary }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5, color: COLORS.secondary }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: alpha(COLORS.secondary, 0.1),
              color: COLORS.secondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ChartCard = ({ title, children, icon }) => (
    <Card 
      sx={{ 
        background: COLORS.accent,
        color: COLORS.secondary,
        boxShadow: 2, 
        borderRadius: 3,
        transition: 'all 0.3s ease',
        border: `2px solid ${alpha(COLORS.primary, 0.3)}`,
        height: { xs: 420, sm: 500, lg: 600 }, // Responsive chart height
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 4,
        }
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${alpha(COLORS.primary, 0.8)} 100%)`,
          borderBottom: `2px solid ${alpha(COLORS.secondary, 0.1)}`,
          display: 'flex',
          alignItems: 'center',
          borderRadius: '12px 12px 0 0'
        }}
      >
        {icon}
        <Typography variant="h5" fontWeight="bold" sx={{ ml: 1, color: COLORS.secondary }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, flex: 1, minWidth: 0, width: '100%' }}>
        {children}
      </Box>
    </Card>
  );

  const ChartButton = ({ title, icon, chartKey, isActive }) => (
    <Button
      variant={isActive ? "contained" : "outlined"}
      startIcon={icon}
      onClick={() => setActiveChart(chartKey)}
      sx={{
        borderRadius: 2,
        px: 2,
        py: 1,
        fontWeight: 600,
        textTransform: 'none',
        fontSize: '0.85rem',
        transition: 'all 0.2s ease',
        minWidth: '110px',
        border: `2px solid ${isActive ? COLORS.primary : alpha(COLORS.secondary, 0.3)}`,
        backgroundColor: isActive ? COLORS.primary : 'transparent',
        color: isActive ? COLORS.secondary : COLORS.secondary,
        '&:hover': {
          backgroundColor: isActive ? alpha(COLORS.primary, 0.8) : alpha(COLORS.primary, 0.2),
          transform: 'translateY(-2px)',
          boxShadow: 2,
          border: `2px solid ${COLORS.primary}`,
        }
      }}
    >
      {title}
    </Button>
  );

  if (loading) {
    return (
      <AdminLayout hideNavbar={true}>
        <Box display="flex" justifyContent="center" alignItems="center" height="80vh" flexDirection="column">
          <CircularProgress size={60} thickness={4} sx={{ color: COLORS.primary }} />
          <Typography variant="h6" sx={{ mt: 2, color: COLORS.secondary }}>
            Loading Analytics Dashboard...
          </Typography>
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout hideNavbar={true}>
        <Alert 
          severity="error" 
          sx={{ 
            m: 2, 
            borderRadius: 2,
            backgroundColor: alpha('#2e66a6', 0.1),
            color: COLORS.secondary,
            border: `1px solid ${alpha('#2e66a6', 0.3)}`
          }}
          action={
            <Button color="inherit" size="small" onClick={fetchAnalytics} sx={{ color: COLORS.secondary }}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  const renderChartContent = () => {
    if (!analytics) return null;

    switch (activeChart) {
      case 'status':
        return (
          <ChartCard 
            title="Request Status Distribution" 
            icon={<DonutLarge />}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              alignItems: 'center', 
              justifyContent: 'space-between',
              height: '100%',
              gap: 3
            }}>
              {/* Pie Chart */}
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%',
                width: '100%'
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatStatusData(analytics.statusDistribution)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(1)}%`}
                    >
                      {formatStatusData(analytics.statusDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} requests`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              {/* Status Summary */}
              <Box sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                p: 2,
                height: '100%'
              }}>
                <Typography variant="h6" fontWeight="bold" color={COLORS.secondary} gutterBottom>
                  Status Summary
                </Typography>
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: 2,
                  width: '100%',
                  maxWidth: '300px'
                }}>
                  {formatStatusData(analytics.statusDistribution).map((item, index) => (
                    <Card 
                      key={index}
                      sx={{ 
                        p: 2,
                        textAlign: 'center',
                        backgroundColor: alpha(item.color, 0.1),
                        border: `2px solid ${item.color}`,
                        borderRadius: 2,
                        boxShadow: 1,
                        minHeight: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="h4" fontWeight="bold" color={item.color}>
                        {item.value}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" color={COLORS.secondary}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color={COLORS.secondary}>
                        {((item.value / getTotalRequests()) * 100).toFixed(1)}%
                      </Typography>
                    </Card>
                  ))}
                </Box>
              </Box>
            </Box>
          </ChartCard>
        );

      case 'course':
        return (
          <ChartCard 
            title="Requests by Student Course" 
            icon={<BarChartIcon />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={formatCourseData(analytics.requestsByCourse)}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(COLORS.secondary, 0.1)} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 11, fill: COLORS.secondary }}
                  interval={0}
                />
                <YAxis tick={{ fill: COLORS.secondary }} />
                <Tooltip 
                  formatter={(value) => [`${value} requests`, 'Count']}
                  contentStyle={{ 
                    backgroundColor: COLORS.accent,
                    border: `1px solid ${COLORS.primary}`,
                    color: COLORS.secondary,
                    borderRadius: 8
                  }}
                />
                <Bar 
                  dataKey="requests" 
                  name="Borrow Requests"
                  radius={[4, 4, 0, 0]}
                >
                  {formatCourseData(analytics.requestsByCourse).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        );

      case 'monthly':
        return (
          <ChartCard 
            title="Monthly Borrow Trend" 
            icon={<ShowChart />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatMonthlyData(analytics.monthlyTrend)}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(COLORS.secondary, 0.1)} />
                <XAxis dataKey="month" tick={{ fill: COLORS.secondary }} />
                <YAxis tick={{ fill: COLORS.secondary }} />
                <Tooltip 
                  formatter={(value) => [`${value} requests`, 'Count']}
                  contentStyle={{ 
                    backgroundColor: COLORS.accent,
                    border: `1px solid ${COLORS.primary}`,
                    color: COLORS.secondary,
                    borderRadius: 8
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke={CHART_COLORS.monthly}
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.monthly, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: CHART_COLORS.monthly }}
                  name="Borrow Requests"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        );

      case 'category':
        return (
          <ChartCard 
            title="Requests by Book Category" 
            icon={<Category />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={formatCategoryData(analytics.requestsByUniform)} 
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(COLORS.secondary, 0.1)} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 11, fill: COLORS.secondary }}
                  interval={0}
                />
                <YAxis tick={{ fill: COLORS.secondary }} />
                <Tooltip 
                  formatter={(value) => [`${value} requests`, 'Count']}
                  contentStyle={{ 
                    backgroundColor: COLORS.accent,
                    border: `1px solid ${COLORS.primary}`,
                    color: COLORS.secondary,
                    borderRadius: 8
                  }}
                />
                <Bar 
                  dataKey="count" 
                  name="Borrow Requests"
                  radius={[4, 4, 0, 0]}
                >
                  {formatCategoryData(analytics.requestsByUniform).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        );

      case 'popular':
        return (
          <ChartCard 
            title="Most Popular Books" 
            icon={<Book />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={formatPopularBooksData(analytics.requestsBySize)}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(COLORS.secondary, 0.1)} />
                <XAxis type="number" tick={{ fill: COLORS.secondary }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={110}
                  tick={{ fontSize: 11, fill: COLORS.secondary }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} borrows`, 'Count']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0] && payload[0].payload.fullName) {
                      return `Book: ${payload[0].payload.fullName}`;
                    }
                    return `Book: ${label}`;
                  }}
                  contentStyle={{ 
                    backgroundColor: COLORS.accent,
                    border: `1px solid ${COLORS.primary}`,
                    color: COLORS.secondary,
                    borderRadius: 8
                  }}
                />
                <Bar 
                  dataKey="requests" 
                  name="Borrow Count"
                  radius={[0, 4, 4, 0]}
                >
                  {formatPopularBooksData(analytics.requestsBySize).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        );

      case 'overview':
        return (
          <ChartCard 
            title="Library Activity Overview" 
            icon={<Assessment />}
          >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Grid container spacing={3} sx={{ width: '100%', height: '100%' }}>
                {/* Status Overview */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom align="center" sx={{ color: COLORS.secondary, fontWeight: 'bold' }}>
                    Quick Status Overview
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {analytics.statusDistribution.map((status, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        p: 2,
                        backgroundColor: alpha(STATUS_COLORS[status._id] || '#2e66a6', 0.1),
                        borderRadius: 2,
                        border: `1px solid ${alpha(STATUS_COLORS[status._id] || '#2e66a6', 0.3)}`
                      }}>
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: COLORS.secondary }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              backgroundColor: STATUS_COLORS[status._id] || '#2e66a6' 
                            }} 
                          />
                          {status._id.charAt(0).toUpperCase() + status._id.slice(1)}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.secondary }}>
                          {status.count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>

                {/* Top Categories */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom align="center" sx={{ color: COLORS.secondary, fontWeight: 'bold' }}>
                    Top Categories
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {analytics.requestsByUniform.slice(0, 5).map((category, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        p: 2,
                        backgroundColor: alpha(CHART_COLORS.category[index % CHART_COLORS.category.length], 0.1),
                        borderRadius: 2,
                        border: `1px solid ${alpha(CHART_COLORS.category[index % CHART_COLORS.category.length], 0.3)}`
                      }}>
                        <Typography variant="body1" sx={{ color: COLORS.secondary }}>
                          {category._id}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: CHART_COLORS.category[index % CHART_COLORS.category.length] }}>
                          {category.count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </ChartCard>
        );

      default:
        return (
          <Box sx={{ textAlign: 'center', py: 8, height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" sx={{ color: COLORS.secondary, opacity: 0.7 }}>
              Select a chart category to view analytics
            </Typography>
          </Box>
        );
    }
  };

  return (
    <AdminLayout hideNavbar={true}>
      <Box sx={{ p: 3, minHeight: '100vh',  backgroundColor: COLORS.accent }}>
        {/* Header Section */}
        <Paper 
          sx={{ 
            p: 4, 
            mb: 3, 
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${alpha(COLORS.primary, 0.9)} 100%)`,
            color: COLORS.secondary,
            borderRadius: 3,
            boxShadow: 3,
            border: `2px solid ${alpha(COLORS.secondary, 0.1)}`
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: COLORS.secondary }}>
                Library Analytics Dashboard
              </Typography>
              <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 400, color: COLORS.secondary }}>
                Comprehensive overview of book borrow requests and library activities
              </Typography>
            </Box>
            <AnalyticsIcon sx={{ fontSize: 60, opacity: 0.8, color: COLORS.secondary }} />
          </Box>
        </Paper>

   
        {/* REVISED: Analytics Filters Card with Custom Date Range */}
        <Card sx={{ 
          mb: 3, 
          borderRadius: 3, 
          boxShadow: 3,
          background: COLORS.accent,
          border: `2px solid ${alpha(COLORS.primary, 0.3)}`
        }}>
          <CardContent sx={{ p: 0 }}>
            {/* Filters Header */}
            <Box 
              sx={{ 
                p: 2, 
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${alpha(COLORS.primary, 0.8)} 100%)`,
                borderBottom: `2px solid ${alpha(COLORS.secondary, 0.1)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderRadius: '12px 12px 0 0'
              }}
              onClick={() => setFiltersExpanded(!filtersExpanded)}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <FilterList sx={{ color: COLORS.secondary }} />
                <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.secondary }}>
                  Analytics Filters
                </Typography>
                {Object.values(filters).some(filter => filter !== 'all' && filter !== '') && (
                  <Chip 
                    label="Active" 
                    size="small" 
                    sx={{ 
                      ml: 1, 
                      height: 24, 
                      backgroundColor: COLORS.secondary,
                      color: COLORS.primary,
                      fontWeight: 'bold'
                    }}
                  />
                )}
              </Box>
              <IconButton size="small" sx={{ color: COLORS.secondary }}>
                {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            {/* Filters Content - WITH CUSTOM DATE RANGE */}
            <Collapse in={filtersExpanded}>
              <Box sx={{ p: 3 }}>
                {/* Filter Controls Section */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: COLORS.secondary, fontWeight: 'bold' }}>
                      Filter Options
                    </Typography>
                    {/* Action Buttons Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button 
                        onClick={resetFilters} 
                        variant="outlined"
                        size="small"
                        sx={{
                          border: `2px solid ${alpha(COLORS.secondary, 0.3)}`,
                          color: COLORS.secondary,
                          fontWeight: 'bold',
                          '&:hover': {
                            border: `2px solid ${COLORS.primary}`,
                            backgroundColor: alpha(COLORS.primary, 0.1),
                          }
                        }}
                      >
                        Reset Filters
                      </Button>

                      <Button 
                        onClick={fetchAnalytics} 
                        variant="contained"
                        size="small"
                        sx={{
                          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${alpha(COLORS.primary, 0.8)} 100%)`,
                          color: COLORS.secondary,
                          fontWeight: 'bold',
                          border: `2px solid ${alpha(COLORS.secondary, 0.1)}`,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${alpha(COLORS.primary, 0.9)} 0%, ${alpha(COLORS.primary, 0.7)} 100%)`,
                            transform: 'translateY(-2px)',
                          }
                        }}
                      >
                        Apply Filters
                      </Button>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {/* Date Range Filter */}
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: COLORS.secondary }}>Date Range</InputLabel>
                        <Select
                          value={filters.dateRange}
                          label="Date Range"
                          onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                          sx={{
                            color: COLORS.secondary,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: alpha(COLORS.secondary, 0.3),
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: COLORS.primary,
                            },
                          }}
                        >
                          <MenuItem value="all">All Time</MenuItem>
                          <MenuItem value="today">Today</MenuItem>
                          <MenuItem value="week">This Week</MenuItem>
                          <MenuItem value="month">This Month</MenuItem>
                          <MenuItem value="quarter">This Quarter</MenuItem>
                          <MenuItem value="year">This Year</MenuItem>
                          <MenuItem value="custom">Custom Range</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Custom Date Range Fields - SHOW ONLY WHEN CUSTOM IS SELECTED */}
                    {filters.dateRange === 'custom' && (
                      <>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Start Date"
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha(COLORS.secondary, 0.3),
                                },
                                '&:hover fieldset': {
                                  borderColor: COLORS.primary,
                                },
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="End Date"
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha(COLORS.secondary, 0.3),
                                },
                                '&:hover fieldset': {
                                  borderColor: COLORS.primary,
                                },
                              }
                            }}
                          />
                        </Grid>
                      </>
                    )}

                    {/* Status Filter */}
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: COLORS.secondary }}>Status</InputLabel>
                        <Select
                          value={filters.status}
                          label="Status"
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          sx={{
                            color: COLORS.secondary,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: alpha(COLORS.secondary, 0.3),
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: COLORS.primary,
                            },
                          }}
                        >
                          <MenuItem value="all">All Status</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                          <MenuItem value="returned">Returned</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Course Filter - UPDATED WITH ALL COURSES */}
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: COLORS.secondary }}>Course</InputLabel>
                        <Select
                          value={filters.course}
                          label="Course"
                          onChange={(e) => handleFilterChange('course', e.target.value)}
                          sx={{
                            color: COLORS.secondary,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: alpha(COLORS.secondary, 0.3),
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: COLORS.primary,
                            },
                          }}
                        >
                          <MenuItem value="all">All Courses</MenuItem>
                          {ACTUAL_COURSES.map((course) => (
                            <MenuItem key={course} value={course}>
                              {course}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>

                {/* Chart Navigation Section */}
                <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${alpha(COLORS.primary, 0.2)}` }}>
                  <Typography variant="h6" sx={{ mb: 2, color: COLORS.secondary, fontWeight: 'bold' }}>
                    Chart Views
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    flexWrap: 'wrap', 
                    justifyContent: 'center',
                    '& > *': {
                      flex: '1 1 auto',
                      minWidth: '120px'
                    }
                  }}>
                    <ChartButton
                      title="Status"
                      icon={<DonutLarge />}
                      chartKey="status"
                      isActive={activeChart === 'status'}
                    />
                    <ChartButton
                      title="By Course"
                      icon={<Category />}
                      chartKey="course"
                      isActive={activeChart === 'course'}
                    />
                    <ChartButton
                      title="Monthly"
                      icon={<ShowChart />}
                      chartKey="monthly"
                      isActive={activeChart === 'monthly'}
                    />
                    <ChartButton
                      title="Categories"
                      icon={<Assessment />}
                      chartKey="category"
                      isActive={activeChart === 'category'}
                    />
                    <ChartButton
                      title="Popular"
                      icon={<Book />}
                      chartKey="popular"
                      isActive={activeChart === 'popular'}
                    />
                    <ChartButton
                      title="Overview"
                      icon={<TableChart />}
                      chartKey="overview"
                      isActive={activeChart === 'overview'}
                    />
                  </Box>
                </Box>
              </Box>
            </Collapse>
          </CardContent>
        </Card>

        {/* Dynamic Chart Content */}
        <Box sx={{ width: '100%', mb: 3 }}>
          {renderChartContent()}
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default Analytics;