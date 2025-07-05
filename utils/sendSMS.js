require('dotenv').config();
const express = require('express');
const brevoRouter = express.Router();
const brevo = require('@getbrevo/brevo');
const { TransactionalSMSApi, SendTransacSms } = require('@getbrevo/brevo');

// Configuración CORRECTA del cliente
const apiInstance = new TransactionalSMSApi();
// ESTA es la forma que actualmente funciona con el SDK:
apiInstance.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;

const sendSMS = async (to, message, sender) => {
    try {
        // Validaciones básicas
        if (!to || !message) {
            throw { status: 400, message: 'Se requiere número y mensaje' };
        }

        // Formateo y validación de número (Guatemala)
        const cleanNumber = to.replace(/\D/g, '');
        const formattedNumber = cleanNumber.startsWith('502') ? cleanNumber : `502${cleanNumber}`;

        if (formattedNumber.length !== 11) {
            throw { status: 400, message: 'Número inválido. Formato: 502XXXXYYYY' };
        }

        // Configuración del SMS
        const sms = new SendTransacSms();
        sms.sender = sender.slice(0, 11);
        sms.recipient = formattedNumber;
        sms.content = message;
        sms.type = 'transactional';

        // Configuración de la petición
        const options = {
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        };

        // Envío del SMS
        const data = await apiInstance.sendTransacSms(sms, options);

        return {
            success: true,
            status: 200,
            messageId: data.messageId,
            recipient: formattedNumber
        };

    } catch (error) {
        console.error('Error en sendSMS:', {
            status: error.status || 500,
            message: error.message,
            details: error.response?.data || error
        });

        return {
            success: false,
            status: error.status || 500,
            error: error.message || 'Error en servidor',
            details: error.response?.data || error.stack
        };
    }
};

/*
brevoRouter.post('/send', async (req, res) => {
    try {
        const { to, message, sender = 'Un Ray' } = req.body;

        // Validaciones
        if (!to || !message) {
            return res.status(400).json({ error: 'Se requiere número y mensaje' });
        }

        // Formateo número Guatemala
        const cleanNumber = to.replace(/\D/g, '');
        const formattedNumber = cleanNumber.startsWith('502') ? cleanNumber : `502${cleanNumber}`;

        if (formattedNumber.length !== 11) {
            return res.status(400).json({ error: 'Número inválido. Formato: 502XXXXYYYY' });
        }

        // Configurar SMS
        const sms = new SendTransacSms();
        sms.sender = sender.slice(0, 11); // Máximo 11 caracteres
        sms.recipient = formattedNumber;
        sms.content = message.slice(0, 160); // Limitar a 160 caracteres

        // Enviar con configuración explícita
        const options = {
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        };

        const data = await apiInstance.sendTransacSms(sms, options);
        
        return res.json({
            success: true,
            messageId: data.messageId,
            recipient: formattedNumber
        });

    } catch (error) {
        console.error('Detalles del error:', {
            status: error.status,
            headers: error.response?.headers,
            data: error.response?.data
        });

        return res.status(500).json({
            success: false,
            error: 'Error en servidor',
            details: error.response?.data || error.message
        });
    }
});*/

module.exports = { sendSMS };