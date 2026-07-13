const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/roomController');

router.use(protect);
router.get('/', ctrl.getRooms);
router.post('/', authorize('admin', 'warden'), ctrl.createRoom);
router.get('/:id', ctrl.getRoom);
router.put('/:id', authorize('admin', 'warden'), ctrl.updateRoom);
router.delete('/:id', authorize('admin'), ctrl.deleteRoom);
router.put('/:id/allocate', authorize('admin', 'staff', 'warden'), ctrl.allocateRoom);
router.put('/:id/vacate', authorize('admin', 'staff', 'warden'), ctrl.vacateRoom);
router.put('/:id/inventory', authorize('admin', 'warden'), ctrl.updateInventory);

module.exports = router;
