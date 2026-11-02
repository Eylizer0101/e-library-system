const express = require('express');
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Request to borrow a book
router.post('/request', auth, async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    // Check if book exists and has available copies
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if book has available copies
    if (book.availableCopies <= 0) {
      return res.status(400).json({ 
        message: 'Sorry, this book is currently out of stock' 
      });
    }

    // Check if user already has a pending or approved request for this book
    const existingBorrow = await Borrow.findOne({
      user: userId,
      book: bookId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingBorrow) {
      return res.status(400).json({ 
        message: 'You already have an active request for this book' 
      });
    }

    // Create borrow request
    const borrowRequest = new Borrow({
      user: userId,
      book: bookId,
      status: 'pending'
    });

    await borrowRequest.save();

    // Populate the book details in the response
    await borrowRequest.populate('book');

    res.status(201).json({
      message: 'Borrow request submitted successfully',
      borrowRequest
    });

  } catch (error) {
    console.error('Error creating borrow request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ADDED: Admin approve borrow request (with stock deduction)
router.put('/:id/approve', adminAuth, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const borrowRequest = await Borrow.findById(req.params.id)
      .populate('book');

    if (!borrowRequest) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    // Check if request is pending
    if (borrowRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only approve pending requests' });
    }

    // Check if book still has available copies
    const book = await Book.findById(borrowRequest.book._id);
    if (book.availableCopies <= 0) {
      return res.status(400).json({ 
        message: 'Cannot approve request - book is out of stock' 
      });
    }

    // Update borrow request status
    borrowRequest.status = 'approved';
    borrowRequest.approvedDate = new Date();
    
    // Add admin notes if provided
    if (adminNotes) {
      borrowRequest.adminNotes = adminNotes;
    }
    
    await borrowRequest.save();

    // DECREASE available copies
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

// ADDED: Admin reject borrow request
router.put('/:id/reject', adminAuth, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const borrowRequest = await Borrow.findById(req.params.id);

    if (!borrowRequest) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    // Check if request is pending
    if (borrowRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only reject pending requests' });
    }

    // Update borrow request status
    borrowRequest.status = 'rejected';
    
    // Add admin notes if provided
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

// RETURN book (with stock increment)
router.put('/:id/return', auth, async (req, res) => {
  try {
    const borrowRequest = await Borrow.findById(req.params.id)
      .populate('book');

    if (!borrowRequest) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    // Check if user owns this request
    if (borrowRequest.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow return of approved books
    if (borrowRequest.status !== 'approved') {
      return res.status(400).json({ message: 'Can only return approved books' });
    }

    // Update status to returned
    borrowRequest.status = 'returned';
    borrowRequest.returnDate = new Date();
    await borrowRequest.save();

    // INCREASE available copies
    const book = await Book.findById(borrowRequest.book._id);
    book.availableCopies += 1;
    await book.save();

    res.json({ 
      message: 'Book returned successfully', 
      borrowRequest 
    });

  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's borrowed books
router.get('/my-books', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const borrowedBooks = await Borrow.find({ user: userId })
      .populate('book')
      .sort({ createdAt: -1 });

    res.json(borrowedBooks);

  } catch (error) {
    console.error('Error fetching borrowed books:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get borrow request by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const borrowRequest = await Borrow.findById(req.params.id)
      .populate('book')
      .populate('user', 'fullName email studentId');

    if (!borrowRequest) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    // Check if user owns this request or is admin
    if (borrowRequest.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(borrowRequest);

  } catch (error) {
    console.error('Error fetching borrow request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE borrow request (cancel)
router.delete('/:id', auth, async (req, res) => {
  try {
    const borrowRequest = await Borrow.findById(req.params.id);

    if (!borrowRequest) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    // Check if user owns this request
    if (borrowRequest.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow cancellation of pending requests
    if (borrowRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel non-pending request' });
    }

    await Borrow.findByIdAndDelete(req.params.id);

    res.json({ message: 'Borrow request cancelled successfully' });

  } catch (error) {
    console.error('Error cancelling borrow request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ADDED: Get all borrow requests for admin
router.get('/admin/requests', adminAuth, async (req, res) => {
  try {
    const borrowRequests = await Borrow.find()
      .populate('book')
      .populate('user', 'fullName email studentId')
      .sort({ createdAt: -1 });

    res.json(borrowRequests);
  } catch (error) {
    console.error('Error fetching borrow requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request to return a book
router.put('/:id/request-return', auth, async (req, res) => {
  try {
    const borrowRequest = await Borrow.findById(req.params.id)
      .populate('book');

    if (!borrowRequest) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    // Check if user owns this request
    if (borrowRequest.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow return request for approved books
    if (borrowRequest.status !== 'approved') {
      return res.status(400).json({ message: 'Can only request return for approved books' });
    }

    // Update status to return_requested
    borrowRequest.status = 'return_requested';
    borrowRequest.returnRequestDate = new Date();
    await borrowRequest.save();

    res.json({ 
      message: 'Return request submitted successfully', 
      borrowRequest 
    });

  } catch (error) {
    console.error('Error requesting return:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin approve return request
router.put('/:id/approve-return', adminAuth, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const borrowRequest = await Borrow.findById(req.params.id)
      .populate('book');

    if (!borrowRequest) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    // Check if request is for return
    if (borrowRequest.status !== 'return_requested') {
      return res.status(400).json({ message: 'Can only approve return requested books' });
    }

    // Update status to returned
    borrowRequest.status = 'returned';
    borrowRequest.returnDate = new Date();
    
    // Add admin notes if provided
    if (adminNotes) {
      borrowRequest.adminNotes = adminNotes;
    }
    
    await borrowRequest.save();

    // INCREASE available copies
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

module.exports = router;