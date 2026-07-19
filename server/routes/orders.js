const express = require('express');
const router = express.Router();
const { protect, adminProtect } = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getAdminStats,
} = require('../controllers/orderController');

// User routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);

// Admin routes (must be before /:id to avoid conflicts)
router.get('/admin/stats', adminProtect, getAdminStats);
router.get('/admin/all', adminProtect, getAllOrders);
router.put('/:id/status', adminProtect, updateOrderStatus);

// Shared route (user checks own order, admin can view any)
router.get('/:id', protect, getOrderById);

module.exports = router;
