require('dotenv').config();
const express = require('express');
const brevoRouter = express.Router();
const brevo = require('@getbrevo/brevo');
const {sendSMS} = require('../utils/sendSMS')
const { TransactionalSMSApi, SendTransacSms } = require('@getbrevo/brevo');

// Configuración CORRECTA del cliente
const apiInstance = new TransactionalSMSApi();
// ESTA es la forma que actualmente funciona con el SDK:
apiInstance.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;

brevoRouter.post('/send', async (req, res) => {
    const { to, message, sender } = req.body;
    const result = await sendSMS(to, message, sender);
    
    // Responder según el resultado
    res.status(result.status).json(result);
});

module.exports = brevoRouter;