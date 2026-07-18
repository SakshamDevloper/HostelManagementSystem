const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/messMenuController');

router.use(protect);
router.get('/', ctrl.getMenu);
router.get('/week', ctrl.getWeekMenu);
router.post('/', authorize('admin', 'warden'), ctrl.createMenu);
router.post('/bulk', authorize('admin', 'warden'), ctrl.bulkCreateMenu);
router.put('/:id', authorize('admin', 'warden'), ctrl.updateMenu);
router.delete('/:id', authorize('admin', 'warden'), ctrl.deleteMenu);

module.exports = router;
