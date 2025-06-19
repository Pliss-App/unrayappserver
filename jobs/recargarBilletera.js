const cron = require('node-cron');
const condController = require('../models/conductor'); // ajusta si tu archivo se llama distinto
const OneSignal = require('../models/onesignalModel');


const recargarBilletera = async () => {
    try {
        const saldo = await condController.getSaldoMinimoConductores();
        const usuarios = await condController.verificacionBilleteraConductoresNoti(saldo.saldo);
        for (const user of usuarios) {
            await condController.bloqueo(user.id);
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
                        '📲Recarga tu billetera',
                        '💰 Sigue reciendo más viajes y aumentando tus ingresos 🤑. Recarga tu billetera hoy .',
                        fechaHora,
                        user.id,
                        'bloqueo'
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


cron.schedule('0 8,14 * * *', () => {
  console.log('🔁 Ejecutando job: Recargar billetera...');
  recargarBilletera();
}, {
  timezone: 'America/Guatemala'
});