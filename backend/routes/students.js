const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/studentController');

router.use(protect);
router.get('/', ctrl.getStudents);
router.post('/', authorize('admin', 'staff', 'warden'), ctrl.createStudent);
router.post('/bulk', authorize('admin', 'warden'), ctrl.bulkImport);
router.get('/:id', ctrl.getStudent);
router.put('/:id', authorize('admin', 'staff', 'warden'), ctrl.updateStudent);
router.delete('/:id', authorize('admin'), ctrl.deleteStudent);
router.put('/:id/checkout', authorize('admin', 'staff', 'warden'), ctrl.checkoutStudent);

module.exports = router;
