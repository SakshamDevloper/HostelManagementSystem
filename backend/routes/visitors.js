const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/visitorController');

router.use(protect);
router.get('/', ctrl.getVisitors);
router.post('/', authorize('admin', 'staff', 'warden'), ctrl.createVisitor);
router.put('/:id/checkout', authorize('admin', 'staff', 'warden'), ctrl.checkoutVisitor);

module.exports = router;
