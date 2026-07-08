const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/complaintController');

router.use(protect);
router.get('/', ctrl.getComplaints);
router.post('/', ctrl.createComplaint);
router.put('/:id/status', authorize('admin', 'staff'), ctrl.updateComplaintStatus);
router.put('/:id/feedback', ctrl.addFeedback);

module.exports = router;
