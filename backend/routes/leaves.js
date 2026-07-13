const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/leaveController');

router.use(protect);
router.get('/', ctrl.getLeaves);
router.post('/', ctrl.createLeave);
router.delete('/:id', ctrl.deleteLeave);
router.put('/:id/status', authorize('warden'), ctrl.updateLeaveStatus);

module.exports = router;
