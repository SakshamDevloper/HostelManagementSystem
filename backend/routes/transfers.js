const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/roomTransferController');

router.use(protect);
router.get('/', ctrl.getTransfers);
router.post('/', authorize('admin', 'staff'), ctrl.createTransfer);
router.put('/:id/status', authorize('admin'), ctrl.updateTransferStatus);

module.exports = router;
