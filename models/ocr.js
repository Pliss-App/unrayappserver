const Tesseract = require('tesseract.js');
const fs = require('fs');


const extractOCRData = async (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ success: false, msg: 'Imagen no proporcionada' });
  }

  try {
    const { data } = await Tesseract.recognize(imageBase64, 'eng');

    const text = data.text;
    const result = {};

    // REGEX para comprobante, fecha y monto
    const comprobanteRegex = /(Comprobante|No\.|Número|Transaccion|No\.\s*de\s*autorización|Numero\.\s*de\s*deposito|No\.\s*de\s*autorizacion|Número\s*de\s*Depósito|Código\s*de\s*autorizacion|Cddigo\s*de\s*autorizacion|No\.\s*de\s*Referencia):?\s*(\d+)/i;
    const fechaRegex = /(Fecha|Date):?\s*([\d\/\-]+)/i;
    const montoRegex = /(Monto|Cantidad|Total|por un valor de|Monto\s*a\s*debitar):?\s*(Q|GTQ|\$)?\s*([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)/i;

    // Buscar número de comprobante
    const comprobanteMatch = text.match(comprobanteRegex);
    if (comprobanteMatch) {
      result.receiptNumber = comprobanteMatch[2];
    }

    // Buscar fecha
    const fechaMatch = text.match(fechaRegex);
    if (fechaMatch) {
      result.fecha = fechaMatch[2];
    }

    // Buscar monto
    const montoMatch = text.match(montoRegex);
    if (montoMatch) {
      let montoRaw = montoMatch[3].replace(/(?<=\d),(?=\d{3}\b)/g, '');
      result.amount = parseFloat(montoRaw);
    }

    // Verifica si datos clave están presentes
    if (result.receiptNumber && result.amount) {
      return res.status(200).json({
        success: true,
        msg: 'Imagen válida',
        data: result,
        rawText: text
      });
    } else {
      return res.status(200).json({
        success: false,
        msg: 'No se encontraron datos válidos en la imagen',
        rawText: text
      });
    }

  } catch (error) {
    console.error('❌ Error al procesar OCR:', error);
    return res.status(500).json({
      success: false,
      msg: 'Error al procesar la imagen. Intenta nuevamente más tarde.'
    });
  }
};

module.exports = {
  extractOCRData
};
