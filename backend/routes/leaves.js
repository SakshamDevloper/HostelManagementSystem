const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/leaveController');

router.use(protect);
router.get('/', ctrl.getLeaves);
router.post('/', ctrl.createLeave);
router.put('/:id/status', authorize('admin', 'staff'), ctrl.updateLeaveStatus);

module.exports = router;
