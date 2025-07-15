require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const brevoRouter = express.Router();
const brevo = require('@getbrevo/brevo');
const { TransactionalSMSApi, SendTransacSms } = require('@getbrevo/brevo');
const axios = require("axios");
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

        // Formateo y validación del número (Guatemala)
        const cleanNumber = to.replace(/\D/g, '');
        const formattedNumber = cleanNumber.startsWith('502') ? cleanNumber : `502${cleanNumber}`;

        if (formattedNumber.length !== 11) {
            throw { status: 400, message: 'Número inválido. Formato: 502XXXXYYYY' };
        }

        // Payload del mensaje SMS
        const smsPayload = {
            sender: sender?.slice(0, 11) || 'SENDER',
            recipient: formattedNumber,
            content: `${message} - ${new Date().toLocaleTimeString()}`,
            type: 'transactional'
        };

        // Envío con Axios
        const response = await axios.post(
            'https://api.brevo.com/v3/transactionalSMS/sms',
            smsPayload,
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            status: 200,
            messageId: response.data.messageId,
            recipient: formattedNumber
        };

    } catch (error) {
        console.error('❌ Error en sendSMS:', {
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message,
            details: error.response?.data || error
        });

        return {
            success: false,
            status: error.response?.status || 500,
            error: error.response?.data?.message || error.message,
            details: error.response?.data || error.stack
        };
    }
};


/**
 * Envía un SMS transaccional con Brevo usando node-fetch.
 * @param {string} numero - Número del destinatario (ej. '50212345678').
 * @param {string} mensaje - Contenido del SMS (máx. 160 caracteres).
 * @param {string} remitente - Nombre del remitente (máx. 11 caracteres).
 * @returns {Promise<Object>} Resultado del envío.
 */
const enviarSMSBrevo = async (numero, mensaje, remitente = 'UnRay') => {
    try {
        remitente = 'UnRay';
        const apiKey = process.env.BREVO_API_KEY;
        if (!apiKey) throw new Error('API key no encontrada en variables de entorno.');

        const cleanNumber = numero.replace(/\D/g, '');
        const formatted = cleanNumber.startsWith('502') ? cleanNumber : `502${cleanNumber}`;
        if (formatted.length !== 11) throw new Error('Número inválido. Debe tener 11 dígitos: 502XXXXYYYY');

        const body = {
            sender: 'UnRay',
            recipient: formatted,
            content: `${mensaje} – ${new Date().toLocaleTimeString()}`,
            type: 'transactional',
            unicodeEnabled: true
        };

        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify(body)
        };

        const res = await fetch('https://api.brevo.com/v3/transactionalSMS/send', options);
        const json = await res.json();

        if (!res.ok) throw new Error(JSON.stringify(json));

        return {
            success: true,
            messageId: json.messageId,
            recipient: formatted,
            response: json
        };
    } catch (err) {
        console.error('❌ Error al enviar SMS:', err);
        return {
            success: false,
            error: err.message || err
        };
    }
}


const enviarWhatBrevo = async (numeroDestino, sms) => {
    try {


        const response = await axios.post('https://api.brevo.com/v3/whatsapp/sendMessage', {
            senderNumber: '50254355617', // Reemplaza con el número de tu canal verificado en Brevo
            contactNumbers: [ numeroDestino],
            templateId: 34,
            params: {
                SMS: String(sms)// el orden debe coincidir con los parámetros de la plantilla
            }
        }, {
            headers: {
                accept: 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            }
        });

        console.log('📲 Mensaje enviado con éxito:', response.data);
    } catch (err) {
        console.error('❌ Error al enviar mensaje:', err.response?.data || err.message);
        throw new Error('No se pudo enviar el mensaje de WhatsApp');
    }
}



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

module.exports = { sendSMS, enviarSMSBrevo, enviarWhatBrevo };