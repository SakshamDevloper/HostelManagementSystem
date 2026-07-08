const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/exportController');

router.use(protect, authorize('admin'));
router.get('/students', ctrl.exportStudents);
router.get('/payments', ctrl.exportPayments);
router.get('/complaints', ctrl.exportComplaints);

module.exports = router;
