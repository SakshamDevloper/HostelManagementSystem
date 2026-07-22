const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/paymentController');

router.use(protect);
router.get('/', ctrl.getPayments);
router.post('/', authorize('admin', 'staff', 'warden'), ctrl.createPayment);
router.get('/dues', ctrl.getDues);
router.get('/student/:studentId', ctrl.getStudentPayments);
router.get('/:id', ctrl.getPayment);
router.put('/:id', authorize('admin', 'staff', 'warden'), ctrl.updatePayment);

module.exports = router;
