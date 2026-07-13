const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/noticeController');

router.use(protect);
router.get('/', ctrl.getNotices);
router.post('/', authorize('admin', 'staff', 'warden'), ctrl.createNotice);
router.put('/:id', authorize('admin', 'staff', 'warden'), ctrl.updateNotice);
router.delete('/:id', authorize('admin', 'warden'), ctrl.deleteNotice);

module.exports = router;
