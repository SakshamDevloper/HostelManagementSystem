const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/attendanceController');

router.use(protect);
router.get('/', ctrl.getAttendance);
router.get('/summary', ctrl.getAttendanceSummary);
router.post('/', authorize('warden'), ctrl.markAttendance);
router.post('/bulk', authorize('warden'), ctrl.bulkMarkAttendance);

module.exports = router;
