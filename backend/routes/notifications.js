const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.use(protect);
router.get('/', ctrl.getNotifications);
router.get('/unread-count', ctrl.getUnreadCount);
router.put('/:id/read', ctrl.markAsRead);
router.put('/read-all', ctrl.markAllAsRead);

module.exports = router;
