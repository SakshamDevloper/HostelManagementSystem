const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/staffController');

router.use(protect, authorize('admin', 'warden'));
router.get('/', ctrl.getStaff);
router.post('/', authorize('admin'), ctrl.createStaff);
router.put('/:id', authorize('admin'), ctrl.updateStaff);
router.delete('/:id', authorize('admin'), ctrl.deleteStaff);

module.exports = router;
