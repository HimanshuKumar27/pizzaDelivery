const express = require('express');
const router = express.Router();
const { protect, adminProtect } = require('../middleware/auth');
const {
  getAllItems,
  getAdminItems,
  getItemsByCategory,
  updateItem,
  addItem,
  deleteItem,
} = require('../controllers/inventoryController');

// Public / User routes
router.get('/', getAllItems);
router.get('/category/:category', getItemsByCategory);

// Admin-only routes
router.get('/admin/all', adminProtect, getAdminItems);
router.post('/', adminProtect, addItem);
router.put('/:id', adminProtect, updateItem);
router.delete('/:id', adminProtect, deleteItem);

module.exports = router;
