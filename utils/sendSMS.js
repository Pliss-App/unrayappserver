require('dotenv').config();
const express = require('express');
const OneSignal = require('../models/onesignalModel')
const fetch = require('node-fetch');
const brevoRouter = express.Router();
const brevo = require('@getbrevo/brevo');
const userController = require('../models/usuario');
const regController = require('../models/registro');
const { TransactionalSMSApi, SendTransacSms } = require('@getbrevo/brevo');
const axios = require("axios");
const { DateTime } = require('luxon');
const ahoraGT = DateTime.now().setZone('America/Guatemala').toFormat('yyyy-MM-dd HH:mm:ss');
// Configuración CORRECTA del cliente
const apiInstance = new TransactionalSMSApi();
// ESTA es la forma que actualmente funciona con el SDK:
apiInstance.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;


function getHoraGuatemalaNumerica() {
    const ahora = new Date();

    // Convertir a hora UTC-6 manualmente
    const offsetGuatemala = -6 * 60; // en minutos
    const utc = ahora.getTime() + ahora.getTimezoneOffset() * 60000;
    const fechaGT = new Date(utc + offsetGuatemala * 60000);

    const horaGT = fechaGT.getHours().toString().padStart(2, '0') +
        fechaGT.getMinutes().toString().padStart(2, '0') +
        fechaGT.getSeconds().toString().padStart(2, '0');

    return horaGT;
}

const sendSMS = async (to, message, sender) => {

   // const cleanNumber = to.replace(/\D/g, '');
    //const formattedNumber = cleanNumber.startsWith('502') ? cleanNumber : `502${cleanNumber}`;
    try {
        const resultadoToken = await regController.obtenerTokenOnesignal(to);

        const token = Array.isArray(resultadoToken) && resultadoToken[0]?.token;

        if (token) {

            console.log("eSATE ES EL TOKEM ", token)
            // Envía notificación si tiene token válido
            await OneSignal.sendNotification(
                token,
                'vacio',           // sonido
                '📩 Código de Verificación', // título
                message,            // cuerpo
                new Date().toISOString().slice(0, 19).replace('T', ' '), // fecha
                null,               // userId, si no tienes uno
                'campania'          // tipo
            );
            console.log('🔔 Notificación enviada por OneSignal');
        } else {
            console.log('ℹ️ Usuario sin token, se omite notificación OneSignal');
        }
    } catch (error) {
        console.warn('⚠️ Error al verificar o enviar token OneSignal, pero se continúa:', error.message);
    }

    const puede = await userController.puedeEnviarSMS(to);
    if (!puede) {
        throw new Error('🚫 Límite de SMS alcanzado para este número.');
    }


    const payload = {
        sender: 'UnRay',
        recipient: to,
        content: `${message} | ${getHoraGuatemalaNumerica()}`,
        type: 'transactional',
        unicodeEnabled: true
    };

    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/transactionalSMS/sms',
            payload,
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('📩 Enviado:', to);
        await userController.insertEnvioSMS(to, ahoraGT);
        return response.data;
    } catch (error) {
        console.error('❌ Error en envío SMS manual:', error.response?.data || error.message);
        throw error;
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
        const cleanNumber = numeroDestino.replace(/\D/g, '');
        const formattedNumber = cleanNumber.startsWith('502') ? cleanNumber : `502${cleanNumber}`;

        if (formattedNumber.length !== 11) {
            throw new Error('📵 Número inválido. Debe tener formato 502XXXXXXXX (11 dígitos)');
        }

        const headers = {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json'
        };

        let contactoId = null;
        // Paso 1: Buscar si existe el contacto por teléfono
        const searchResp = await axios.get(`https://api.brevo.com/v3/contacts?limit=1&sms=${formattedNumber}`, {
            headers
        });

        if (searchResp.data.contacts && searchResp.data.contacts.length > 0) {
            contactoId = searchResp.data.contacts[0].id;
        } else {
            // Paso 2: Crear contacto si no existe
            const emailFalso = `user${formattedNumber}@fake.com`;
            const createResp = await axios.post(
                'https://api.brevo.com/v3/contacts',
                {
                    email: emailFalso,
                    sms: formattedNumber,
                    codigo: String(sms),
                    attributes: {
                        CODIGO: String(sms)
                    }
                },
                { headers }
            );
            contactoId = createResp.data.id;
        }

        // Paso 3: Actualizar el atributo SMS (por ID real)
        await axios.put(
            `https://api.brevo.com/v3/contacts/${contactoId}`,
            {
                attributes: {
                    CODIGO: String(sms)
                }
            },
            { headers }
        );
        // Paso 4: Enviar mensaje WhatsApp
        const sendResp = await axios.post(
            'https://api.brevo.com/v3/whatsapp/sendMessage',
            {
                senderNumber: '50254355617',
                contactNumbers: [formattedNumber],
                templateId: 44,

            },
            {
                headers: {
                    accept: 'application/json',
                    ...headers
                }
            }
        );
        console.log('📲 Mensaje enviado con éxito:', sendResp.data);
    } catch (err) {
        console.error('❌ Error en enviarWhatBrevo:', err.response?.data || err.message);
        throw new Error('No se pudo procesar el contacto o enviar el mensaje');
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

module.exports = { sendSMS, enviarSMSBrevo, enviarWhatBrevo };