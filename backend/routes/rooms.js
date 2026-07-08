const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/roomController');

router.use(protect);
router.get('/', ctrl.getRooms);
router.post('/', authorize('admin'), ctrl.createRoom);
router.get('/:id', ctrl.getRoom);
router.put('/:id', authorize('admin'), ctrl.updateRoom);
router.delete('/:id', authorize('admin'), ctrl.deleteRoom);
router.put('/:id/allocate', authorize('admin', 'staff'), ctrl.allocateRoom);
router.put('/:id/vacate', authorize('admin', 'staff'), ctrl.vacateRoom);
router.put('/:id/inventory', authorize('admin'), ctrl.updateInventory);

module.exports = router;
