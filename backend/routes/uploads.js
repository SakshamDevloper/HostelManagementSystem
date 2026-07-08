const router = require('express').Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/uploadController');

router.use(protect);
router.post('/image', upload.single('photo'), ctrl.uploadImage);
router.post('/document', upload.single('document'), ctrl.uploadDocument);

module.exports = router;
