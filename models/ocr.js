/*const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads');

// ⏱ Función de timeout para limitar el tiempo del OCR
const timeoutPromise = (ms) => new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout de OCR superado')), ms)
);

const extractOCRData = async (req, res) => {
    const { imageBase64, } = req.body;

    if (!imageBase64) {
        return res.status(400).json({ success: false, msg: 'Imagen no proporcionada' });
    }

    try {
        // 🖼 Convertir Base64 en Buffer
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // ⚖️ Validar tamaño máximo permitido (5 MB)
        const maxSizeInMB = 5;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        if (buffer.length > maxSizeInBytes) {
            return res.status(413).json({
                success: false,
                msg: `La imagen excede el tamaño máximo permitido de ${maxSizeInMB} MB`
            });
        }

        // 📂 Guardar imagen temporal
        const tempPath = path.join(uploadDir, `ocr-${Date.now()}.jpg`);
        fs.writeFileSync(tempPath, buffer);

        // 🔍 Ejecutar OCR con límite de tiempo (20s)
        const resultOCR = await Promise.race([
            Tesseract.recognize(tempPath, 'eng'),
            timeoutPromise(20000)
        ]);

        // ✅ Borrar imagen temporal
        fs.unlinkSync(tempPath);

        const text = resultOCR.data.text;

        console.log("DATOS DE LA IMAGEN ", text)
        const result = {};

        // 🧠 Regex para extraer datos
        const comprobanteRegex = /(Comprobante|No\.|Número|Transaccion|No\.\s*de\s*autorización|Numero\.\s*de\s*deposito|No\.\s*de\s*autorizacion|Número\s*de\s*Depósito|Código\s*de\s*autorizacion|Cddigo\s*de\s*autorizacion|No\.\s*de\s*Referencia):?\s*(\d+)/i;
        const fechaRegex = /(Fecha|Date):?\s*([\d\/\-]+)/i;
        const montoRegex = /(Monto|Cantidad|Total|por un valor de|Monto\s*a\s*debitar):?\s*(Q|GTQ|\$)?\s*([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)/i;


        // 📌 Extraer comprobante
        const comprobanteMatch = text.match(comprobanteRegex);
        if (comprobanteMatch) result.receiptNumber = comprobanteMatch[2];



        // 📅 Extraer fecha
        const fechaMatch = text.match(fechaRegex);
        if (fechaMatch) result.fecha = fechaMatch[2];

        // 💵 Extraer monto
        const montoMatch = text.match(montoRegex);
        if (montoMatch) {
            const montoRaw = montoMatch[3];
            const montoFormateado = montoRaw.replace(/(?<=\d),(?=\d{3}\b)/g, '');
            // const montoRaw = montoMatch[3].replace(/(?<=\d),(?=\d{3}\b)/g, '');
            result.amount = parseFloat(montoFormateado);
        }

        // ✔ Validación final
        console.log("DATOS DE IMAGEN ,", result)
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
        console.error('❌ Error al procesar OCR:', error.message || error);
        return res.status(500).json({
            success: false,
            msg: 'Error al procesar la imagen. Intenta nuevamente más tarde.'
        });
    }
};

module.exports = {
    extractOCRData
};
*/


const fs = require('fs');
const path = require('path');
const { CognitiveServicesCredentials } = require('@azure/ms-rest-azure-js');
const { ComputerVisionClient } = require('@azure/cognitiveservices-computervision');

// Configuración desde variables de entorno
const key = process.env.AZURE_CV_KEY;
const endpoint = process.env.AZURE_CV_ENDPOINT;

// Crear credenciales y cliente
const credentials = new CognitiveServicesCredentials(key);
const client = new ComputerVisionClient(credentials, endpoint);

/**
 * Procesa una imagen en base64 usando Azure Computer Vision OCR
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.processOCR = async (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ 
      success: false, 
      msg: 'Imagen no proporcionada en base64' 
    });
  }

  try {
    // Limpiar base64 (remover encabezado si existe)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Validar tamaño máximo (5 MB)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (buffer.length > maxSizeInBytes) {
      return res.status(413).json({ 
        success: false, 
        msg: 'La imagen excede el tamaño máximo permitido (5 MB)' 
      });
    }

    // Enviar a Azure OCR
    const result = await client.readInStream(buffer);
    const operationId = result.operationLocation.split('/').pop();

    // Esperar hasta que el procesamiento termine
    let readResult;
    while (true) {
      readResult = await client.getReadResult(operationId);
      if (readResult.status !== 'notStarted' && readResult.status !== 'running') break;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Verificar si el procesamiento fue exitoso
    if (readResult.status !== 'succeeded') {
      throw new Error('El procesamiento OCR no fue exitoso');
    }

    // Extraer todo el texto
    const allText = readResult.analyzeResult.readResults
      .flatMap(page => page.lines.map(line => line.text))
      .join(' ');

    // Expresiones regulares para extraer datos específicos
    const receiptPatterns = {
      receiptNumber: /(Comprobante|No\.|Número|Transaccion|No\.\s*de\s*autorización|Numero\.\s*de\s*deposito|No\.\s*de\s*autorizacion|Número\s*de\s*Depósito|Código\s*de\s*autorizacion|Cddigo\s*de\s*autorizacion|No\.\s*de\s*Referencia):?\s*(\d+)/i;,
      amount: /(Monto|Cantidad|Total|por un valor de|Monto\s*a\s*debitar):?\s*(Q|GTQ|\$)?\s*([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)/i,
      date: /(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4}[\/\-]\d{2}[\/\-]\d{2})/i,
      nit: /(NIT|Nit|nit)\s*[\:\-]?\s*([\d\-]+)/i
    };

    // Extraer datos con los patrones
    const extractedData = {};
    for (const [key, pattern] of Object.entries(receiptPatterns)) {
      const match = allText.match(pattern);
      extractedData[key] = match ? match[match.length - 1] : null;
    }

    // Formatear montos (remover comas)
    if (extractedData.amount) {
      extractedData.amount = extractedData.amount.replace(',', '');
    }

    return res.status(200).json({
      success: true,
      rawText: allText,
      extractedData,
      processingTime: readResult.analyzeResult.readResults.reduce(
        (acc, page) => acc + page.lines.length, 0
      )
    });

  } catch (err) {
    console.error('Error en Azure OCR:', err);
    return res.status(500).json({ 
      success: false, 
      msg: 'Error al procesar la imagen OCR',
      error: err.message 
    });
  }
};