const express = require('express');
const router = express.Router();
const ocrController = require('../models/ocr');

router.post('/imagen', ocrController.extractOCRData);

module.exports = router;