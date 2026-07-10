const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/attendanceController');

router.use(protect);
router.get('/', ctrl.getAttendance);
router.get('/summary', ctrl.getAttendanceSummary);
router.post('/', authorize('admin', 'staff'), ctrl.markAttendance);
router.post('/bulk', authorize('admin', 'staff'), ctrl.bulkMarkAttendance);

module.exports = router;
