const { Router } = require('express');
const upload = require('../middleware/upload.middleware');
const { uploadDocument } = require('../controllers/upload.controller');

const router = Router();

router.post('/', upload.single('file'), uploadDocument);

module.exports = router;
