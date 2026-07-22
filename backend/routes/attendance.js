const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/attendanceController');

router.use(protect);
router.get('/', ctrl.getAttendance);
router.get('/summary', ctrl.getAttendanceSummary);
router.post('/', authorize('admin', 'staff', 'warden'), ctrl.markAttendance);
router.post('/bulk', authorize('admin', 'staff', 'warden'), ctrl.bulkMarkAttendance);

module.exports = router;
