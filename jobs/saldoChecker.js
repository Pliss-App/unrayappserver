const cron = require('node-cron');
const userController = require('../models/conductor'); // ajusta si tu archivo se llama distinto

const verificarSaldos = async () => {
    try {
        const saldo = await userController.getSaldoMinimoConductores();
        const usuarios = await userController.verificacionBilleteraConductores(saldo.saldo);
        for (const user of usuarios) {
            await userController.bloqueo(user.id);
            console.log(`✅ Usuario ${user.id} bloqueado por saldo insuficiente.`);
        }
    } catch (error) {
        console.error('❌ Error en job verificarSaldos:', error.message);
    }
};

// Ejecutar cada 30 minutos
cron.schedule('*/5 * * * *', () => {
    console.log('🔁 Ejecutando job: Verificar saldos mínimos...');
    verificarSaldos();
});