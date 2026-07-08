const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/auditController');

router.use(protect, authorize('admin'));
router.get('/', ctrl.getAuditLogs);

module.exports = router;
