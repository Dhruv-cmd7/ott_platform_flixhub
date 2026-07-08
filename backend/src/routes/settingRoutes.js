const express = require('express');
const router = express.Router();
const settingController = require('../controllers/systemSettingController');
const { protect } = require('../middleware/auth');

router.get('/', protect, settingController.getSettings);
router.put('/', protect, settingController.updateSettings);
router.get('/payments', protect, settingController.getPaymentStats);

module.exports = router;
