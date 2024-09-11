// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', authenticateToken, userController.getUserProfile);
router.get('/search', authenticateToken, userController.searchUserByEmail);
router.put('/update', authenticateToken, userController.updateUserProfile);

module.exports = router;