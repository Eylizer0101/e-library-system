const express = require('express');
const multer = require('multer');
const path = require('path');
const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Add new book (Admin only)
router.post('/books', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      description,
      publishedYear,
      publisher,
      totalCopies, // ADDED
      availableCopies // ADDED
    } = req.body;

    console.log('Received book data:', req.body);
    console.log('File received:', req.file);

    // Check if book with same ISBN already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }

    // FIXED: Use full URL for image path
    const imagePath = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : '';

    const book = new Book({
      title,
      author,
      isbn,
      category,
      description,
      publishedYear: parseInt(publishedYear),
      publisher,
      totalCopies: parseInt(totalCopies) || 1, // ADDED
      availableCopies: parseInt(availableCopies) || parseInt(totalCopies) || 1, // ADDED
      image: imagePath
    });

    await book.save();

    res.status(201).json({
      message: 'Book added successfully',
      book
    });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update book (Admin only)
router.put('/books/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      description,
      publishedYear,
      publisher,
      totalCopies,
      availableCopies
    } = req.body;

    console.log('Updating book data:', req.body);
    console.log('File received:', req.file);

    // Check if book exists
    const existingBook = await Book.findById(req.params.id);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if ISBN is being changed and if new ISBN already exists
    if (isbn !== existingBook.isbn) {
      const bookWithSameISBN = await Book.findOne({ isbn });
      if (bookWithSameISBN && bookWithSameISBN._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Book with this ISBN already exists' });
      }
    }

    // Prepare update data
    const updateData = {
      title,
      author,
      isbn,
      category,
      description,
      publishedYear: parseInt(publishedYear),
      publisher,
      totalCopies: parseInt(totalCopies) || 1,
      availableCopies: parseInt(availableCopies) || parseInt(totalCopies) || 1
    };

    // Update image if new image is provided
    if (req.file) {
      updateData.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all books for admin
router.get('/books', adminAuth, async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ADDED: Delete book route
router.delete('/books/:id', adminAuth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await Book.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== USER MANAGEMENT ROUTES ==========

// Get all users (Admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user details with borrow history (Admin only)
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's borrow history
    const borrowHistory = await Borrow.find({ user: req.params.id })
      .populate('book', 'title author isbn')
      .sort({ createdAt: -1 });

    res.json({
      user,
      borrowHistory
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has active borrows
    const activeBorrows = await Borrow.findOne({ 
      user: req.params.id, 
      status: { $in: ['pending', 'approved'] } 
    });

    if (activeBorrows) {
      return res.status(400).json({ 
        message: 'Cannot delete user with active borrow requests' 
      });
    }

    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's borrow statistics
router.get('/users/:id/statistics', adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const totalBorrows = await Borrow.countDocuments({ user: userId });
    const pendingBorrows = await Borrow.countDocuments({ 
      user: userId, 
      status: 'pending' 
    });
    const approvedBorrows = await Borrow.countDocuments({ 
      user: userId, 
      status: 'approved' 
    });
    const returnedBorrows = await Borrow.countDocuments({ 
      user: userId, 
      status: 'returned' 
    });

    res.json({
      totalBorrows,
      pendingBorrows,
      approvedBorrows,
      returnedBorrows
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== BORROW MANAGEMENT ROUTES ==========

// Get all borrow requests for admin
router.get('/borrow-requests', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const borrowRequests = await Borrow.find(query)
      .populate('user', 'fullName email studentId course yearLevel')
      .populate('book', 'title author isbn category image availableCopies')
      .sort({ createdAt: -1 });

    res.json(borrowRequests);
  } catch (error) {
    console.error('Error fetching borrow requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get borrow request statistics
router.get('/borrow-requests/statistics', adminAuth, async (req, res) => {
  try {
    const totalRequests = await Borrow.countDocuments();
    const pendingRequests = await Borrow.countDocuments({ status: 'pending' });
    const approvedRequests = await Borrow.countDocuments({ status: 'approved' });
    const rejectedRequests = await Borrow.countDocuments({ status: 'rejected' });
    const returnedRequests = await Borrow.countDocuments({ status: 'returned' });

    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      returnedRequests
    });
  } catch (error) {
    console.error('Error fetching borrow statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve borrow request
router.put('/borrow-requests/:id/approve', adminAuth, async (req, res) => {
  try {
    const { dueDate } = req.body;
    
    const borrowRequest = await Borrow.findById(req.params.id)
      .populate('book');

    if (!borrowRequest) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    if (borrowRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only approve pending requests' });
    }

    // Check if book has available copies
    const book = await Book.findById(borrowRequest.book._id);
    if (book.availableCopies <= 0) {
      return res.status(400).json({ 
        message: 'Cannot approve request - book is out of stock' 
      });
    }

    // Update borrow request
    borrowRequest.status = 'approved';
    borrowRequest.approvedDate = new Date();
    if (dueDate) {
      borrowRequest.dueDate = new Date(dueDate);
    } else {
      // Set default due date (14 days from approval)
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 14);
      borrowRequest.dueDate = defaultDueDate;
    }
    await borrowRequest.save();

    // Decrease available copies
    book.availableCopies -= 1;
    await book.save();

    res.json({ 
      message: 'Borrow request approved successfully', 
      borrowRequest 
    });

  } catch (error) {
    console.error('Error approving borrow request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject borrow request
router.put('/borrow-requests/:id/reject', adminAuth, async (req, res) => {
  try {
    const { adminNotes } = req.body;

    const borrowRequest = await Borrow.findById(req.params.id);

    if (!borrowRequest) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    if (borrowRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only reject pending requests' });
    }

    // Update borrow request
    borrowRequest.status = 'rejected';
    if (adminNotes) {
      borrowRequest.adminNotes = adminNotes;
    }
    await borrowRequest.save();

    res.json({ 
      message: 'Borrow request rejected successfully', 
      borrowRequest 
    });

  } catch (error) {
    console.error('Error rejecting borrow request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark book as returned
router.put('/borrow-requests/:id/return', adminAuth, async (req, res) => {
  try {
    const borrowRequest = await Borrow.findById(req.params.id)
      .populate('book');

    if (!borrowRequest) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    if (borrowRequest.status !== 'approved') {
      return res.status(400).json({ message: 'Can only return approved books' });
    }

    // Update borrow request
    borrowRequest.status = 'returned';
    borrowRequest.returnDate = new Date();
    await borrowRequest.save();

    // Increase available copies
    const book = await Book.findById(borrowRequest.book._id);
    book.availableCopies += 1;
    await book.save();

    res.json({ 
      message: 'Book marked as returned successfully', 
      borrowRequest 
    });

  } catch (error) {
    console.error('Error marking book as returned:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== RETURN REQUESTS MANAGEMENT ROUTES ==========

// Get all return requests for admin
router.get('/return-requests', adminAuth, async (req, res) => {
  try {
    const returnRequests = await Borrow.find({ status: 'return_requested' })
      .populate('user', 'fullName email studentId course yearLevel')
      .populate('book', 'title author isbn category image availableCopies')
      .sort({ returnRequestDate: -1 });

    res.json(returnRequests);
  } catch (error) {
    console.error('Error fetching return requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get return request statistics
router.get('/return-requests/statistics', adminAuth, async (req, res) => {
  try {
    const totalReturnRequests = await Borrow.countDocuments({ status: 'return_requested' });
    const totalReturned = await Borrow.countDocuments({ status: 'returned' });

    res.json({
      totalReturnRequests,
      totalReturned
    });
  } catch (error) {
    console.error('Error fetching return statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve return request
router.put('/return-requests/:id/approve', adminAuth, async (req, res) => {
  try {
    const borrowRequest = await Borrow.findById(req.params.id)
      .populate('book');

    if (!borrowRequest) {
      return res.status(404).json({ message: 'Return request not found' });
    }

    if (borrowRequest.status !== 'return_requested') {
      return res.status(400).json({ message: 'Can only approve pending return requests' });
    }

    // Update borrow request
    borrowRequest.status = 'returned';
    borrowRequest.returnDate = new Date();
    await borrowRequest.save();

    // Increase available copies
    const book = await Book.findById(borrowRequest.book._id);
    book.availableCopies += 1;
    await book.save();

    res.json({ 
      message: 'Return request approved successfully', 
      borrowRequest 
    });

  } catch (error) {
    console.error('Error approving return request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== DASHBOARD ROUTES ==========

// Get dashboard statistics
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    // Get borrow request statistics
    const totalRequests = await Borrow.countDocuments();
    const pendingRequests = await Borrow.countDocuments({ status: 'pending' });
    const approvedRequests = await Borrow.countDocuments({ status: 'approved' });
    const rejectedRequests = await Borrow.countDocuments({ status: 'rejected' });
    const returnedRequests = await Borrow.countDocuments({ status: 'returned' });
    const returnRequested = await Borrow.countDocuments({ status: 'return_requested' });

    // Get book statistics
    const totalBooks = await Book.countDocuments();
    const availableBooks = await Book.countDocuments({ availableCopies: { $gt: 0 } });
    const outOfStockBooks = await Book.countDocuments({ availableCopies: 0 });

    // Get user statistics
    const totalUsers = await User.countDocuments({ role: 'student' });

    res.json({
      // Borrow Statistics
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      returnedRequests,
      returnRequested,
      
      // Book Statistics
      totalBooks,
      availableBooks,
      outOfStockBooks,
      
      // User Statistics
      totalUsers
    });

  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== ANALYTICS ROUTES ==========

// Get comprehensive analytics data
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const { 
      dateRange, 
      startDate, 
      endDate, 
      status, 
      course
    } = req.query;

    // Build date filter
    let dateFilter = {};
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let start = new Date();
      
      switch (dateRange) {
        case 'today':
          start.setHours(0, 0, 0, 0);
          break;
        case 'week':
          start.setDate(now.getDate() - 7);
          break;
        case 'month':
          start.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          start.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          start.setFullYear(now.getFullYear() - 1);
          break;
        case 'custom':
          // Custom date range will be handled separately
          break;
      }
      if (dateRange !== 'custom') {
        dateFilter.createdAt = { $gte: start };
      }
    }

    // Custom date range - FIXED: Only apply if custom is selected and dates are provided
    if (dateRange === 'custom' && startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z') // Include entire end date
      };
    }

    // Build main filter
    let filter = { ...dateFilter };
    if (status && status !== 'all') filter.status = status;

    // FIXED: Course filter - properly populate user data first
    let userFilter = {};
    if (course && course !== 'all') {
      userFilter.course = course;
    }

    // Get users based on course filter
    let users = [];
    if (course && course !== 'all') {
      users = await User.find(userFilter).select('_id');
      const userIds = users.map(user => user._id);
      filter.user = { $in: userIds };
    }

    // Get borrow data with filters
    const borrowData = await Borrow.find(filter)
      .populate('user', 'fullName email studentId course yearLevel')
      .populate('book', 'title author isbn category');

    // Status Distribution
    const statusDistribution = await Borrow.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // FIXED: Requests by Course - Use aggregation with proper population
    const requestsByCourse = await Borrow.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: '$userData' },
      {
        $group: {
          _id: '$userData.course',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly Trend (Current Year)
    const currentYear = new Date().getFullYear();
    const monthlyTrend = await Borrow.aggregate([
      {
        $match: {
          ...filter,
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Book Category Analysis
    const requestsByCategory = await Borrow.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'books',
          localField: 'book',
          foreignField: '_id',
          as: 'bookData'
        }
      },
      { $unwind: '$bookData' },
      {
        $group: {
          _id: '$bookData.category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Popular Books
    const popularBooks = await Borrow.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$book',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookData'
        }
      },
      { $unwind: '$bookData' },
      {
        $project: {
          _id: '$bookData.title',
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Approved count
    const approvedCount = statusDistribution.find(s => s._id === 'approved')?.count || 0;

    res.json({
      statusDistribution,
      requestsByCourse,
      monthlyTrend,
      requestsByUniform: requestsByCategory,
      requestsBySize: popularBooks,
      approvedCount,
      totalRequests: borrowData.length
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;