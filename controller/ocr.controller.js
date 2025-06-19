/*const express = require('express');
const router = express.Router();
const ocrController = require('../models/ocr');

router.post('/imagen', ocrController.extractOCRData);

module.exports = router;*/

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ocrController = require('../models/ocr');

// Configuración de multer
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Ruta para subir imagen y procesarla
router.post('/imagen', 
  // Middleware para validar el body
  (req, res, next) => {
    if (!req.body.imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el campo imageBase64 en el body'
      });
    }
    next();
  },
  ocrController.processOCR
);

module.exports = router;