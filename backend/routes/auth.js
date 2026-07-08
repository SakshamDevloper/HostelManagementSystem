const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  login, logout, getMe, updateProfile, changePassword,
} = require('../controllers/authController');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;
