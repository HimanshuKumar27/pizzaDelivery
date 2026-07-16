const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/auth');
const {
  adminLogin,
  getAdminProfile,
} = require('../controllers/adminAuthController');

// Public route — admin login
router.post('/login', adminLogin);

// Protected route — get admin profile
router.get('/me', adminProtect, getAdminProfile);

module.exports = router;
