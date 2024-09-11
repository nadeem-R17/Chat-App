const router = require('express').Router();
const groupController = require('../controllers/groupController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/create', authenticateToken, groupController.createGroup);
router.get('/details', authenticateToken, groupController.groupDetails);
router.put('/update', authenticateToken, groupController.updateGroup);
router.get('/memberstatus', authenticateToken, groupController.memberStatus);

module.exports = router;