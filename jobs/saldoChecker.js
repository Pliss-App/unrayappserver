const cron = require('node-cron');
const condController = require('../models/conductor'); // ajusta si tu archivo se llama distinto
const OneSignal = require('../models/onesignalModel');


const bloquearTemporalmenteFaltaSaldo = async () => {
    try {
        const saldo = await condController.getSaldoMinimoConductores();
        const usuarios = await condController.verificacionBilleteraConductores(saldo.saldo);
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
                        'Un Ray - Saldo insuficiente',
                        'Tu cuenta fue suspendida temporalmente por saldo bajo. Recarga para activarla.',
                        fechaHora,
                        user.id,
                        'bloqueo'
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

// Ejecutar cada 30 minutos
cron.schedule('*/5 * * * *', () => {
    console.log('🔁 Ejecutando job: Verificar saldos mínimos...');
   bloquearTemporalmenteFaltaSaldo();
});