const express = require('express');
const router = express.Router();
const { sendMessage, getMessages,getMerchantConversations } = require('../controllers/messages.controller.js');

router.post('/send', sendMessage);
router.get('/history', getMessages);
router.get('/conversations', getMerchantConversations);

module.exports = router;