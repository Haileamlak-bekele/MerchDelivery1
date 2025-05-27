const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messages.controller.js');

router.post('/send', sendMessage);
router.get('/history', getMessages);

module.exports = router;