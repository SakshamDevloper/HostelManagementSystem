const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/roomTransferController');

router.use(protect);
router.get('/', ctrl.getTransfers);
router.get('/:id', ctrl.getTransfer);
router.post('/', authorize('admin', 'student'), ctrl.createTransfer);
router.put('/:id/status', authorize('admin', 'warden'), ctrl.updateTransferStatus);

module.exports = router;
