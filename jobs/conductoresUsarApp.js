const cron = require('node-cron');
const condController = require('../models/conductor'); // ajusta si tu archivo se llama distinto
const OneSignal = require('../models/onesignalModel');


const conductoresUsarApp = async () => {
    try {
        const usuarios = await condController.conductoresUsarApp();
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
                        '🔔 ¡Sigue conectado con Un Ray!',
                        '📲 Mantente en línea y recibe más viajes 🚗💰 ¡Cada viaje es una oportunidad de generar ingresos extra! 💵✨',
                        fechaHora,
                        user.id,
                        'principal'
                    );

                     console.log(`✅ Notificacion ${user.id} enviada.`);
                }
            } catch (notiError) {
                console.warn('Error al enviar la notificación:', notiError.message || notiError);
                // No hacer nada, solo registrar el error
            }

            console.log(`✅ Usuario ${user.id} bloqueado por saldo insuficiente.`);
        }
    } catch (error) {
        console.error('❌ Error en job verificarSaldos:', error.message);
    }
};

// 7:00 AM
cron.schedule('0 7 * * *', () => {
  console.log('🔁 Ejecutando job 7:00 AM: Notificar Usar App conductor...');
  conductoresUsarApp();
}, {
  timezone: 'America/Guatemala'
});

// 10:00 AM
cron.schedule('0 10 * * *', () => {
  console.log('🔁 Ejecutando job 10:00 AM: Notificar Usar App conductor...');
  conductoresUsarApp();
}, {
  timezone: 'America/Guatemala'
});

// 12:00 PM
cron.schedule('0 12 * * *', () => {
  console.log('🔁 Ejecutando job 12:00 PM: Notificar Usar App conductor...');
  conductoresUsarApp();
}, {
  timezone: 'America/Guatemala'
});

// 4:00 PM
cron.schedule('0 16 * * *', () => {
  console.log('🔁 Ejecutando job 4:00 PM: Notificar Usar App conductor...');
  conductoresUsarApp();
}, {
  timezone: 'America/Guatemala'
});

// 11:15 PM
cron.schedule('45 23 * * *', () => {
  console.log('🔁 Ejecutando job 11:45 PM: Notificar Usar App conductor...');
  conductoresUsarApp();
}, {
  timezone: 'America/Guatemala'
});