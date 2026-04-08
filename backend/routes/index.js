const { Router } = require('express');
const uploadRoutes = require('./upload.routes');
const chatRoutes = require('./chat.routes');
const systemRoutes = require('./system.routes');

const router = Router();

router.use('/upload', uploadRoutes);
router.use('/chat', chatRoutes);
router.use('/api/chat', chatRoutes);
router.use('/', systemRoutes);

module.exports = router;
