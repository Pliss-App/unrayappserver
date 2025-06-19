const cron = require('node-cron');
const condController = require('../models/conductor'); // ajusta si tu archivo se llama distinto
const OneSignal = require('../models/onesignalModel');


const usarAppuser= async () => {
    try {

        const usuarios = await condController.usarAppUserNoti();
        for (const user of usuarios) {

            try {
                const token = await condController.getTokenOnesignal(user.id);
                if (token) {
                    const now = new Date();
                    const fechaHora =
                        now.getFullYear() + "-" +
                        String(now.getMonth() + 1).padStart(2, "0") + "-" +
                        String(now.getDate()).padStart(2, "0") + " " +
                        String(now.getHours()).padStart(2, "0") + ":" +
                        String(now.getMinutes()).padStart(2, "0") + ":" +
                        String(now.getSeconds()).padStart(2, "0");

                    await OneSignal.sendNotification(
                        token,
                        'vacio',
                        '👉 ¡Muévete con Un Ray!',
                        'No esperes más 🕒 ubicación, solicita tu viaje 🧭 y déjanos llevarte a tu destino 🏁',
                        fechaHora,
                        user.id,
                        'principal'
                    );

                }
            } catch (notiError) {
                console.warn('Error al enviar la notificación:', notiError.message || notiError);
                // No hacer nada, solo registrar el error
            }
        }
    } catch (error) {
        console.error('❌ Error en job verificarSaldos:', error.message);
    }
};


// 7:00 AM, 12:00 PM, 6:00 PM
cron.schedule('0 7,12,18 * * *', () => {
  console.log('🔁 Ejecutando job: Notificar usuarios...');
  usarAppuser();
}, {
  timezone: 'America/Guatemala'
});

// 11:30 PM
cron.schedule('30 23 * * *', () => {
  console.log('🔁 Ejecutando job: Notificar usuarios...');
  usarAppuser();
}, {
  timezone: 'America/Guatemala'
});