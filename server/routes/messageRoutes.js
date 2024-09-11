// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/history', authenticateToken, messageController.getInitChatHistory);
router.get('/groupchat', authenticateToken, messageController.getGroupChat);
router.get('/directchat', authenticateToken, messageController.getDirectMessages);

module.exports = router;