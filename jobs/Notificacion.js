const cron = require('node-cron');
const db = require('../config/conexion');
const OneSignal = require('../models/onesignalModel');
const condController = require('../models/conductor');
const isNoti = require('../models/administracion/notificador');
const { DateTime } = require('luxon');

cron.schedule('* * * * *', async () => {
  const ahora = DateTime.now().setZone('America/Guatemala');

   const notificaciones = await isNoti.getNotificaciones('conductor');
  for (const noti of notificaciones) {
    const {
      id,
      titulo,
      cuerpo,
      hora_inicio,
      intervalo_tipo,
      intervalo_valor,
      veces,
      veces_enviadas
    } = noti;

    const [h, m, s] = hora_inicio.split(':');

    // Construir fecha de inicio hoy con la hora_inicio
    let inicio = ahora.set({
      hour: parseInt(h),
      minute: parseInt(m),
      second: parseInt(s || 0),
      millisecond: 0
    });

    // Si la hora de inicio aún no ha llegado hoy, retrocede a ayer
    if (ahora < inicio) {
      inicio = inicio.minus({ days: 1 });
    }

    // Convertir el intervalo a milisegundos
    const intervaloMs = intervalo_tipo === 'horas'
      ? intervalo_valor * 60 * 60 * 1000
      : intervalo_valor * 24 * 60 * 60 * 1000;

    // Calcular el próximo envío con base en veces_enviadas
    const proximoEnvio = inicio.plus({
      milliseconds: intervaloMs * veces_enviadas
    });

    const diferencia = ahora.toMillis() - proximoEnvio.toMillis();
    const margen = 90 * 1000; // 90 segundos

  //  console.log(`[🔎] Noti ID Conductor ${id} | ahora: ${ahora.toFormat('HH:mm:ss')} | próximo: ${proximoEnvio.toFormat('HH:mm:ss')} | diferencia: ${diferencia}`);

    // Enviar si la diferencia absoluta está dentro del margen
    if (Math.abs(diferencia) < margen) {
      try {
const usuarios = await condController.conductoresUsarApp();

        for (const user of usuarios) {
          const token = await condController.getTokenOnesignal(user.id);
          if (token) {
            await OneSignal.sendNotification(
              token,
              'vacio',
              titulo,
              cuerpo,
              ahora.toFormat('yyyy-MM-dd HH:mm:ss'),
              user.id,
              'recurrente'
            );
          }
        }

        await db.query(`
          UPDATE notificaciones_recurrentes 
          SET veces_enviadas = veces_enviadas + 1,
              estado = IF(veces_enviadas + 1 >= ?, 'finalizado', 'activo')
          WHERE rol = 'conductor' AND id = ?
        `, [veces, id]);

        console.log(`[✅] Notificación enviada: ${titulo}`);
      } catch (error) {
        console.error(`❌ Error al enviar notificación ID ${id}:`, error);
      }
    }
  }
}, {
  timezone: 'America/Guatemala'
});
