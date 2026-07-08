const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/staffController');

router.use(protect, authorize('admin'));
router.get('/', ctrl.getStaff);
router.post('/', ctrl.createStaff);
router.put('/:id', ctrl.updateStaff);
router.delete('/:id', ctrl.deleteStaff);

module.exports = router;
