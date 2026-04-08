const { Router } = require('express');
const { getHealth } = require('../controllers/health.controller');
const { clearCache } = require('../controllers/cache.controller');

const router = Router();

router.get('/health', getHealth);
router.delete('/cache', clearCache);

module.exports = router;
