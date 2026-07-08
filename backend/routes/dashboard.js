const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/dashboardController');

router.use(protect);
router.get('/stats', ctrl.getStats);
router.get('/occupancy', ctrl.getOccupancy);
router.get('/revenue', ctrl.getRevenue);
router.get('/activity', ctrl.getActivity);
router.get('/upcoming', ctrl.getUpcoming);

module.exports = router;
