const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getKey,
  createRazorpayOrder,
  verifyPayment,
} = require('../controllers/paymentController');

// Public — get Razorpay key for frontend
router.get('/key', getKey);

// Protected — create payment order and verify
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;
