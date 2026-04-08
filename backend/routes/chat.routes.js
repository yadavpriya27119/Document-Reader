const { Router } = require('express');
const { postChat, deleteChatSession } = require('../controllers/chat.controller');

const router = Router();

router.post('/', postChat);
router.delete('/session', deleteChatSession);

module.exports = router;
