const express = require('express');
const haversine = require('haversine-distance'); // Para calcular distancias entre coordenadas.
const { getIo } = require('../socket');
const { findNearestDriver } = require("../utils/solicitud");
const OneSignal = require('../models/onesignalModel')
const userController = require('../models/usuario')
const cobro = require('../models/cobro')
const connection = require('../config/conexion');
const tokeOne = require('../models/conductor')
//const io = socketIo(server);
const { respuestasSolicitudes, connectedUsers, connectedDrivers, getIO } = require('../socketOr');
const isRouter = express.Router();

const isController = require('../models/solicitud');
const solicitudesActivas = new Map(); // Almacena solicitudes activas con su tiempo restante

isRouter.post('/solicitudes/:idConductor/accion', async (req, res) => {
    console.log(req.body)
    const { conductorId, solicitudId, accion } = req.body;

    try {
        const conductor = await isController.obtenerEstadoConductor(conductorId);
        console.log(conductor.estado_usuario)
        if (!conductor || conductor.estado_usuario !== 'libre') {
            return res.status(200).json({
                success: false,
                message: 'No puedes aceptar la solicitud porque no estás en estado ocupado.',
            });
        }

        if (accion === 'Aceptado') {
            solicitudesActivas.delete(conductorId);
            console.log("SE ACEPTO")
            await isController.updateEstadoSolicitud(solicitudId, 'Aceptada');
            await isController.updateEstadoUser(conductorId, 'ocupado');
            //   io.emit('solicitud_aceptada', { solicitudId, conductorId });
            return res.status(200).json({
                success: true,
                message: 'Solicitud aceptada exitosamente.',
            });
        } else if (accion === 'Rechazada') {
            await isController.updateEstadoUser(conductorId, 'libre');
            //  io.emit('solicitud_rechazada', { solicitudId, conductorId });
            return res.status(200).json({
                success: true,
                message: 'Solicitud rechazada.',
            });
        } else {
            return res.status(200).json({
                success: false,
                message: 'Acción no válida.',
            });
        }
    } catch (error) {
        console.error(`Error al procesar solicitud del conductor ${conductorId}:`, error);
        res.status(500).json({ success: false, message: 'Error al procesar solicitud.' });
    }
});


isRouter.post('/create_travelDetail', async (req, res) => {

    const create = await isController.createTravelDetail(req.body);
    if (create === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: create
        });
    }
})


isRouter.delete('/delete_solicitud/:id', async (req, res) => {
    try {
        const solicitudId = req.params.id;
        if (!solicitudId) {
            return res.status(400).json({
                success: false,
                message: 'ID de solicitud no proporcionado.',
            });
        }

        const resultado = await isController.deleteSolicitud(solicitudId);

        if (!resultado) {
            return res.status(200).json({
                success: false,
                message: 'Solicitud no encontrada.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Solicitud eliminada con éxito.',
            result: resultado,
        });
    } catch (error) {
        console.error('Error al eliminar la solicitud:', error);

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor. No se pudo eliminar la solicitud.',
            error: error.message,
        });
    }
});


isRouter.get('/solicitudes/:idConductor', async (req, res) => {
    const { idConductor } = req.params;

    try {

        // Buscar solicitud activa en memoria
        if (solicitudesActivas.has(idConductor)) {
            const solicitud = solicitudesActivas.get(idConductor);

            // Verificar si el tiempo restante expiró
            if (solicitud.tiempoRestante <= 0) {
                //  console.log("TIEM PO", solicitud.tiempoRestante )
                solicitudesActivas.delete(idConductor); // Remover solicitud expirada
                return res.status(200).json({
                    success: false,
                    message: 'La solicitud ha expirado.',
                });
            }

            // Decrementar tiempo restante y devolver solicitud
            solicitud.tiempoRestante -= 1;
            return res.status(200).json({
                success: true,
                message: 'Solicitud obtenida con éxito.',
                solicitud: solicitud.datos,
                tiempoRestante: solicitud.tiempoRestante,
            });
        }

        // Obtener nueva solicitud del controlador si no está en memoria
        solicitudesActivas.delete(idConductor);
        const solicitudPendiente = await isController.obtenerSolicitudesConductor(idConductor);
        if (!solicitudPendiente || solicitudPendiente.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No hay solicitudes pendientes para este conductor.',
            });
        }

        // Agregar solicitud a la memoria con tiempo restante
        solicitudesActivas.set(idConductor, {
            datos: solicitudPendiente,
            tiempoRestante: 30, // 30 segundos
        });

        //   console.log(solicitudPendiente )
        /* if (solicitudPendiente.estado != 'Pendiente'  ) {
             console.log("SOLICIUTD ACEPTADA YA gggg");
             solicitudesActivas.delete(idConductor);
             return res.status(200).json({
                 success: true,
                 message: 'Solicitud Aceptada!.',
             });
             // Remover solicitud de memoria después de procesarla
 
         } */

        return res.status(200).json({
            success: true,
            message: 'Solicitud obtenida con éxito.',
            solicitud: solicitudPendiente,
            tiempoRestante: 30,
        });

    } catch (error) {
        console.error('Error obteniendo solicitudes:', error);
        return res.status(500).json({
            success: false,
            message: 'Ocurrió un error al obtener la solicitud.',
        });
    }
});

// Endpoint para aceptar o rechazar solicitud
isRouter.post('/soli/accion', async (req, res) => {
    console.log(" - condfd", req.body)
    //  const { idConductor } = req.params;

    //const { accion, idsoli } = req.body; // 'aceptar' o 'rechazar'
    try {
        if (!solicitudesActivas.has(idConductor)) {
            return res.status(200).json({
                success: false,
                message: 'La solicitud ya no está disponible.',
            });
        }

        // Remover solicitud de memoria después de procesarla
        solicitudesActivas.delete(idConductor);

        // Procesar la acción (aceptar/rechazar)
        await isController.procesarSolicitud(idsoli, idConductor, accion);

        if (accion == 'Aceptado') {
            await isController.updateEstadoUser(idConductor, 'ocupado');
        }

        return res.status(200).json({
            success: true,
            message: `La solicitud fue ${accion === 'Aceptado' ? 'aceptada' : 'rechazada'} con éxito.`,
        });
    } catch (error) {
        console.error('Error procesando solicitud:', error);
        return res.status(500).json({
            success: false,
            message: 'Ocurrió un error al procesar la solicitud.',
        });
    }
});

isRouter.post('/crearviaje', async (req, res) => {
    const io = getIO();
    let solicitudId = null;
    const {
        idUser,
        idService,
        start_lat,
        start_lng,
        start_direction,
        end_lat,
        end_lng,
        end_direction,
        distance,
        distance_unit,
        duration_unit,
        duration,
        costo,
        fecha_hora,
    } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "El cuerpo de la solicitud está vacío" });
    }
})


isRouter.post('/crear_viaje', async (req, res) => {
    const io = getIO();

    const {
        idUser,
        idService,
        start_lat,
        start_lng,
        start_direction,
        end_lat,
        end_lng,
        end_direction,
        distance,
        distance_unit,
        duration_unit,
        duration,
        costo,
        fecha_hora,
    } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "El cuerpo de la solicitud está vacío" });
    }

    let solicitudId = null;
    let conductoresIntentados = [];
    let contadorTotal = 180; // 3 minutos máximo

    console.log("LISTADO DE CONDUCTORES CON SOCKET ", connectedDrivers)

    while (contadorTotal > 0) {
        // Buscar conductores cercanos que no hayan sido intentados antes
        const drivers = await findNearestDriver(start_lat, start_lng, idService);
        const driver = drivers.find(d => !conductoresIntentados.includes(d.id));

        if (!driver) {
            // Si ya no hay conductores disponibles
            if (solicitudId) {
                await isController.deleteSolicitud(solicitudId);
            }
            return res.status(200).json({
                success: false,
                message: 'No hay conductores disponibles.',
            });
        }

        conductoresIntentados.push(driver.id); // Registrar intento

        // Crear solicitud si no existe
        if (!solicitudId) {
            const solicitud = await isController.createSolicitud(
                idUser,
                driver.id,
                idService,
                start_lat,
                start_lng,
                start_direction,
                end_lat,
                end_lng,
                end_direction,
                distance,
                distance_unit,
                duration_unit,
                duration,
                costo,
                fecha_hora
            );
            solicitudId = solicitud.insertId;
        } else {
            await isController.updateSolicitudConductor(solicitudId, driver.id);
        }

        if (!driver.socket_id || !connectedDrivers[driver.id]) {
            console.error('Conductor no tiene socket_id registrado o no está conectado');
            continue; // Intenta con otro conductor
        }

        // **Notificar al conductor**
        io.to(connectedDrivers[driver.id]).emit('nueva_solicitud', {
            solicitudId,
            idUser,
            idService,
            start_lat,
            start_lng,
            start_direction,
            end_lat,
            end_lng,
            end_direction,
            distance,
            distance_unit,
            duration_unit,
            duration,
            costo,
            fecha_hora
        });

        // **Esperar respuesta del conductor**
        const solicitudAceptada = await new Promise(resolve => {
            let contador = 0;
            const intervalo = setInterval(() => {
                if (respuestasSolicitudes[solicitudId]) {
                    const data = respuestasSolicitudes[solicitudId];
                    delete respuestasSolicitudes[solicitudId]; // Eliminar respuesta usada

                    if (data.estado === 'Aceptado') {
                        io.to(connectedUsers[idUser]).emit('solicitud_iniciar', { solicitudId, estado: 'Aceptado' });
                        clearInterval(intervalo);
                        resolve(true);
                    } else {
                        // Si el conductor rechaza, liberarlo y seguir con otro
                        isController.updateEstadoUser(driver.id, 'libre');
                        io.to(connectedDrivers[driver.id]).emit('solicitud_rechazada', { solicitudId });
                        clearInterval(intervalo);
                        resolve(false);
                    }
                }
                contador += 1;
                if (contador >= 30) {
                    // Si el conductor no responde en 30s, liberarlo y continuar
                    isController.updateEstadoUser(driver.id, 'libre');
                    io.to(connectedDrivers[driver.id]).emit('solicitud_expirada', { solicitudId });
                    clearInterval(intervalo);
                    resolve(false);
                }
            }, 1000);
        });

        if (solicitudAceptada) {
            return res.status(200).json({
                success: true,
                message: 'Solicitud Aceptada.',
                solicitudId,
            });
        } else {
            console.log(`RESPUESTA REACAHZADA POR CONDCUTOR ${driver.id}`)
        }

        // **Reducir tiempo total y continuar con otro conductor**
        contadorTotal -= 30;
    }

    // Si el tiempo total se agotó sin éxito
    return res.status(200).json({
        success: false,
        message: 'No se pudo asignar un conductor en el tiempo límite.',
    });
});

/*
isRouter.post('/crear_viaje', async (req, res) => {
    const io = getIO();
    const {
        idUser,
        idService,
        start_lat,
        start_lng,
        start_direction,
        end_lat,
        end_lng,
        end_direction,
        distance,
        distance_unit,
        duration_unit,
        duration,
        costo,
        fecha_hora,
    } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "El cuerpo de la solicitud está vacío" });
    }

    let solicitudId = null;
    let conductoresIntentados = [];
    let contadorTotal = 180; // 3 minutos máximo para asignar un conductor

    while (contadorTotal > 0) {
        // Buscar conductores cercanos que no hayan sido intentados antes
        const drivers = await findNearestDriver(start_lat, start_lng, idService);
        const driver = drivers.find(d => !conductoresIntentados.includes(d.id));

        if (!driver) {
            isController.deleteSolicitud(solicitudId);
            return res.status(200).json({
                success: false,
                message: 'No hay conductores disponibles.',
            });
        }

        // Marcar conductor como intentado
        conductoresIntentados.push(driver.id);

        // Crear solicitud si no existe
        if (!solicitudId) {
            const solicitud = await isController.createSolicitud(
                idUser,
                driver.id,
                idService,
                start_lat,
                start_lng,
                start_direction,
                end_lat,
                end_lng,
                end_direction,
                distance,
                distance_unit,
                duration_unit,
                duration,
                costo,
                fecha_hora
            );
            solicitudId = solicitud.insertId;
        } else {
            await isController.updateSolicitudConductor(solicitudId, driver.id);
        }

        if (!driver || !driver.socket_id || !connectedDrivers[driver.id]) {
            console.error('Conductor no tiene socket_id registrado o no está conectado');
            continue; // Intenta con el siguiente conductor
        }

        // **Notificar al conductor sobre la solicitud**
        io.to(connectedDrivers[driver.id]).emit('nueva_solicitud', {
            solicitudId,
            idUser,
            idService,
            start_lat,
            start_lng,
            start_direction,
            end_lat,
            end_lng,
            end_direction,
            distance,
            distance_unit,
            duration_unit,
            duration,
            costo,
            fecha_hora
        });

        // Esperar respuesta del conductor (30s)
        let solicitudAceptada = false;
        let tiempoDeEspera = 30000; // 30 segundos
        const eventName = `respuesta_solicitud_${solicitudId}`;
        console.log(`🔹 Esperando respuesta en evento: ${eventName}`);
        await new Promise(resolve => {
               io.once(eventName, (data) => {
                    console.log("✅ Datos recibidos:", data);
                    if (data.estado === 'Aceptado') {
                        solicitudAceptada = true;
                        resolve();
                    }
                });

             setTimeout(() => {

                console.log("SE DEBE ELIMINAR ")
                // Si el conductor no responde, emitir un evento para eliminar la solicitud en el frontend
                io.to(connectedDrivers[driver.id]).emit('solicitud_expirada', { solicitudId });
                resolve();
            }, tiempoDeEspera);

      
        });

        if (solicitudAceptada) {
            return res.status(200).json({
                success: true,
                message: 'Solicitud Aceptada.',
                solicitudId,
            });
        }

        // Si el tiempo se agotó para este conductor, intentamos con otro
        contadorTotal -= 30;

        if (contadorTotal <= 0) {
            return res.status(200).json({
                success: false,
                message: 'No se pudo asignar un conductor en el tiempo límite.',
            });
        }
    }
});
*/

isRouter.post('/aceptar_solicitud', async (req, res) => {
    const io = getIO();
    const { solicitudId, conductorId, idUser } = req.body;

    if (!solicitudId || !conductorId) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    try {
        // Actualizar solicitud en la base de datos  idsoli, idConductor, accion
        await isController.procesarSolicitud(solicitudId, conductorId, 'Aceptado');
        await isController.updateEstadoUser(conductorId, 'ocupado');
        // Notificar al pasajero que la solicitud fue aceptada
        const solicitud = await isController.obtenerSolicitud(solicitudId);
        if (solicitud) {
            io.to(connectedUsers[solicitud.idUser]).emit('solicitud_aceptada', {
                solicitudId,
                conductorId,
                message: "Un conductor ha aceptado tu solicitud.",
            });
        }

        const token = await tokeOne.getTokenOnesignal(idUser);
        if (!token) {
            return;
        }

        const now = new Date();
        now.getFullYear() + "-" +
            String(now.getMonth() + 1).padStart(2, "0") + "-" +
            String(now.getDate()).padStart(2, "0") + " " +
            String(now.getHours()).padStart(2, "0") + ":" +
            String(now.getMinutes()).padStart(2, "0") + ":" +
            String(now.getSeconds()).padStart(2, "0");
        const result = await OneSignal.sendNotification(token, 'vacio', 'Viaje Un Ray', 'Tu solicitud de viaje a sido aceptada.', now, idUser)

        return res.status(200).json({
            success: true,
            message: "Solicitud aceptada.",
            solicitudId
        });
    } catch (error) {
        console.error("Error al aceptar la solicitud:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

isRouter.post('/rechazar_solicitud', async (req, res) => {
    const io = getIO();
    const { solicitudId, conductorId } = req.body;

    if (!solicitudId || !conductorId) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    try {
        // Registrar que el conductor rechazó la solicitud
        await isController.registrarRechazoConductor(solicitudId, conductorId);

        // Notificar al sistema que este conductor no está disponible
        io.emit(`rechazo_solicitud_${solicitudId}`, { conductorId });

        return res.status(200).json({
            success: true,
            message: "Solicitud rechazada. Buscando otro conductor...",
            solicitudId
        });
    } catch (error) {
        console.error("Error al rechazar la solicitud:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

isRouter.get('/soli_user/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { timestamp } = req.query; // Esto es opcional, solo evita el cache.
        const viaje = await isController.obtenerSolicitudesUsuario(id);
        if (!viaje || viaje.length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'No existe viaje activo',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Existe viaje activo',
                result: viaje[0]
            });
        }
    } catch (error) {

    }
})

isRouter.get('/location_driver/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const location = await isController.obtLocationDriver(id);
        if (location === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No Location',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Success Location',
                result: location
            });
        }
    } catch (error) {

    }
})

isRouter.get('/soli/user/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const viaje = await isController.viajeUser(id);
        if (viaje === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No usuario',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Existe usuario',
                result: viaje
            });
        }
    } catch (error) {

    }
})

isRouter.get('/soli/driver/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const viaje = await isController.viajeDriver(id);
        if (viaje === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No usuario',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Existe usuario',
                result: viaje
            });
        }
    } catch (error) {

    }
})

// Endpoint para enviar un mensaje desde el frontend
isRouter.post("/send/mensajes", async (req, res) => {
    try {
        const { idViaje, emisor_id, receptor_id, mensaje } = req.body;

        if (!emisor_id || !receptor_id || !mensaje) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const mensajes = await isController.saveMessage(idViaje, emisor_id, receptor_id, mensaje);
        if (mensajes === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Error enviado',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Envio Exitoso',
                result: 'OK'
            });
        }
    } catch (error) {

    }
});

isRouter.post("/get/mensajesNoLeidos", async (req, res) => {
  try {
    const { idViaje, emisor_id, receptor_id } = req.body;
    // Validación de campos requeridos
    if (!idViaje || !emisor_id || !receptor_id) {
      return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios' });
    }

    const hayNoLeidos = await isController.obtMessageNoLeidos(idViaje, emisor_id, receptor_id);

    return res.status(200).json({
      success: true,
      result: hayNoLeidos  // true o false
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});


isRouter.post("/updateMensajesNoLeidos", async (req, res) => {
  try {
    const { idViaje,  receptor_id } = req.body;
    // Validación de campos requeridos
    if (!idViaje || !receptor_id) {
      return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios' });
    }

    const hayNoLeidos = await isController.updateMessageNoLeidos(idViaje, receptor_id);

    return res.status(200).json({
      success: true,
      result: hayNoLeidos  // true o false
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});


isRouter.get("/obtener-sms-definido/:rol", async (req, res) => {
    try {

        const mensajes = await isController.obtSMSDefinido(req.params.rol);
        if (mensajes === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Sin Mensajes',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Consulta Exitosa',
                result: mensajes
            });
        }
    } catch (error) {

    }
});


isRouter.get("/obtener/mensajes", async (req, res) => {
    try {
        const { idViaje, emisor_id, receptor_id } = req.query;
        if (!emisor_id || !receptor_id) {
            return res.status(400).json({ error: 'emisor_id y receptor_id son obligatorios' });
        }

        const mensajes = await isController.obtMessage(idViaje, emisor_id, receptor_id);
        if (mensajes === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Sin Mensajes',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Consulta Exitosa',
                result: mensajes
            });
        }
    } catch (error) {

    }
});


isRouter.get('/estado_viaje/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const estado = await isController.obtEstadoViajeDriver(id);
        if (estado === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No Location',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Success Location',
                result: estado
            });
        }
    } catch (error) {

    }
})


isRouter.get('/motivos_cancelacion/:rol', async (req, res) => {
    try {
        const result = await isController.obtMotCancelar(req.params.rol);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontrarón registros',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Success',
                result: result
            });
        }
    } catch (error) {

    }
})


isRouter.put('/cancelar-viaje', async (req, res) => {
    try {
        const { id, option, comentario } = req.body;
        const cond = await isController.buscarConductorViaje(id);
        const update = await isController.updateEstadoUser(cond[0].idConductor, 'libre');
        const result = await isController.cancelarViaje(id, option, comentario);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Sin Registro',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Success',
                result: result
            });
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            msg: 'Ocurrio un error en el servidor. Intenta más tarde.',
        });
    }
})


isRouter.put('/update-estado-viaje', async (req, res) => {
    try {
        const io = getIO();
        const { id, estado, idUser, solicitudId } = req.body;
        if (estado == 'Conductor Llego a Salida') {
            io.to(connectedUsers[idUser]).emit('alerta_llegada', { solicitudId: solicitudId, estado: 'Conductor Llego a Salida' });
        }

        const result = await isController.updateEstadoViaje(id, estado);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Sin Registro',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Success',
                result: result
            });
        }
    } catch (error) {

    }
})


// Endpoint para enviar un mensaje desde el frontend
isRouter.post("/send-notification", async (req, res) => {
    const { userId, sonido, title, message, fecha, idUser } = req.body;
    if (!userId || !message) {
        return res.status(400).json({ error: 'Faltan parámetros: userId y message' });
    }

    try {
        const result = await OneSignal.sendNotification(userId, sonido, title, message, fecha, idUser);
        if (result.id === undefined || result.id == '') {
            return res.status(200).json({
                success: false,
                message: 'Notificación Error',
                result
            });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Notificación enviada correctamente',
                result
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Error enviando la notificación',
            details: error.message,
        });
    }
})


isRouter.put('/update-onesignal', async (req, res) => {
    try {
        const { id, token } = req.body;
        if (!id || !token) {
            return res.status(400).json({ error: 'Faltan parámetros' });
        }

        const result = await OneSignal.updateOnesignalToken(id, token);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Error al actualizar',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Success',
                result: result
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Error  al actualizar',
            details: error.message,
        });
    }
})

isRouter.get('/get-token/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await OneSignal.getTokenId(id);
        if (!result || result.length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontrarón registros',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Success',
                result: result[0]
            });
        }
    } catch (error) {

    }
})

// Endpoint para enviar un mensaje desde el frontend
isRouter.post("/calificar", async (req, res) => {

    const { id_viaje, evaluador_id, evaluado_id, calificacion, comentario } = req.body;

    if (!id_viaje || !evaluador_id || !evaluado_id || !calificacion) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    const califico = await isController.obtenerSiCalifico(evaluador_id, id_viaje);
    if (!califico?.length) { // Si no hay registros
        return res.status(200).json({
            success: true,
            message: 'Ya calificó'
        });
    } else {
        const respuesta = await isController.consultarCalificacion({ id_viaje, evaluador_id, evaluado_id });

        if (respuesta?.length > 0) {

            console.log("EXISTe : ", respuesta)
            const update = await isController.updateCali_viaje(evaluador_id, id_viaje);
            if (!update || update.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: 'Calificación  Update Error',
                    mos: result,
                });
            }
            else {
                const repromedio = await isController.getCalificacion(evaluado_id);
                if (!repromedio?.length) {
                    return res.status(200).json({
                        success: false,
                        message: 'Calificación  Error'
                    });
                } else {
                    const promedio = parseFloat(repromedio[0].promedio).toFixed(1);
                    const totalViajes = repromedio[0].total_viajes;
                    const resp = await isController.updateRanting(evaluado_id, promedio, totalViajes);
                    if (!resp) {

                        return res.status(200).json({
                            success: false,
                            message: 'Calificación  Error'
                        });
                    } else {
                        return res.status(200).json({
                            success: true,
                            message: 'Calificación enviada correctamente'
                        });
                    }
                }
            }

        }

        const result = await isController.guardarCalificacion({ id_viaje, evaluador_id, evaluado_id, calificacion, comentario });
        if (!result || result.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'Calificación  Error',
                mos: result,
            });
        } else {
            const update = await isController.updateCali_viaje(evaluador_id, id_viaje);
            if (!update || update.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: 'Calificación  Update Error',
                    mos: result,
                });
            }
            else {
                const repromedio = await isController.getCalificacion(evaluado_id);
                if (!repromedio?.length) {
                    return res.status(200).json({
                        success: false,
                        message: 'Calificación  Error'
                    });
                } else {
                    const promedio = parseFloat(repromedio[0].promedio).toFixed(1);
                    const totalViajes = repromedio[0].total_viajes;
                    const resp = await isController.updateRanting(evaluado_id, promedio, totalViajes);
                    if (!resp) {

                        return res.status(200).json({
                            success: false,
                            message: 'Calificación  Error'
                        });
                    } else {
                        return res.status(200).json({
                            success: true,
                            message: 'Calificación enviada correctamente'
                        });
                    }
                }
            }

        }
    }
}
)

/*
// Endpoint para enviar un mensaje desde el frontend
isRouter.post("/calificar", async (req, res) => {
    const { idViaje, idUser, punteo, comentario } = req.body;
    if (!idUser || !idViaje) {
        return res.status(400).json({ error: 'Faltan parámetros' });
    }

    try {
        const result = await isController.guardarCalificacion(idViaje, idUser, punteo, comentario);
        if (!result || result.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'Calificación  Error'
            });
        } else {
            const repromedio = await isController.getCalificacion(idUser);
            if (!repromedio || repromedio.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: 'Calificación  Error'
                });
            } else {

                const promedio = parseFloat(repromedio[0].promedio).toFixed(1);
                const totalViajes = repromedio[0].total_viajes;
                const resp = await isController.updateRanting(idUser, promedio, totalViajes);
                if (!resp) {
                    return res.status(200).json({
                        success: false,
                        message: 'Calificación  Error'
                    });
                } else {
                    return res.status(200).json({
                        success: true,
                        message: 'Calificación enviada correctamente'
                    });
                }
            }
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Error enviando la calificación',
            details: error.message,
        });
    }
})
*/
isRouter.put('/finalizar-viaje', async (req, res) => {
    const io = getIO();
    try {
        const { idViaje, idUser, idUserViaje, idDriver, costo, fecha, hora } = req.body;

        if (!idViaje || !idUser || !costo) {
            return res.status(400).json({ success: false, message: 'Faltan parámetros' });
        }
        // Finalizar viaje
        const result = await isController.finalizarViaje(idViaje);
        if (!result) {
            return res.status(200).json({
                success: false,
                message: 'Sin Registro'
            });
        }
        // CREAMOS LAS CALIFICACIONES 
        await isController.guardarCali_previa(idDriver, idViaje);
        await isController.guardarCali_previa(idUserViaje, idViaje);
        await userController.deleteMensaje(idViaje);

        // Obtener porcentaje de cobro de la app
        const cobroResult = await cobro.cobroApp();
        if (!cobroResult) {
            return res.status(200).json({
                success: false,
                message: 'Error al obtener porcentaje de cobro'
            });
        }

        const porcentaje = cobroResult.porApp / 100;
        const totalDebitar = Math.round(costo * porcentaje);
        const ganancia = costo - totalDebitar;

        // Obtener saldo actual del conductor
        const saldo = await cobro.saldoBilletera(idUser);
        if (!saldo) {
            return res.status(200).json({
                success: false,
                message: 'Usuario no existe'
            });
        }

        // Actualizar saldo de la billetera
        const nuevoSaldo = saldo.saldo - totalDebitar;
        const updateSaldo = await cobro.actualizarBilletera(idUser, nuevoSaldo);
        if (!updateSaldo) {
            return res.status(200).json({
                success: false,
                message: 'Error al actualizar la billetera del Conductor'
            });
        }

        // Cambiar el estado del usuario a 'libre'
        const estado = await isController.updateEstadoUser(idUser, 'libre');
        if (!estado) {
            return res.status(200).json({
                success: false,
                message: 'Error al actualizar el estado del usuario'
            });
        }
        const histpa = await cobro.agregarHistorialPagos(idViaje, totalDebitar);
        const histdeb = await cobro.agregarHistorialdebitos(idUser, idViaje, costo, totalDebitar, saldo.saldo, nuevoSaldo);
        const insetGanDriver = await cobro.insertGanaDriver(idUser, idViaje, ganancia, fecha, hora)
        if (!histpa && !histdeb) {
            return res.status(200).json({
                success: false,
                message: 'Error al actualizar el estado del usuario'
            });
        }
        io.to(connectedUsers[idUser]).emit('calificar', { estado: true, idViaje: idViaje, idDriver: idDriver });
        const insert = await isController.insertMoviBilletera(idUser, totalDebitar, `Viaje Id ${idViaje} - Q${costo}`, 'débito');
        if (insert === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Error'
            });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Viaje finalizado y débito realizado con éxito'
            });

        }



    } catch (error) {
        console.error("Error en finalizar viaje:", error);
        return res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
});


isRouter.get('/soli_no_calificacion/:id', async (req, res) => {
    try {
        const id = req.params.id;
        //result = await isController.obtenerSoliSinCalificacionUsuario(id);
        const result = await isController.obtLisCali(id);    //obtenerSoliSinCalificacion(id);
        if (!result || result.length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontrarón registros',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Success',
                result: result
            });
        }
    } catch (error) {

    }
})


isRouter.get('/soli_calificacion_usuario/:id/:rol', async (req, res) => {
    try {

        const id = req.params.id;

        const result = await isController.obtenerSoliSinCalificacionUsuario(id);



        if (!result || result.length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontrarón registros',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Success',
                result: result
            });
        }
    } catch (error) {

    }
})


isRouter.get("/historial", async (req, res) => {
    try {
        const { userId, role, offset = 0 } = req.query; // Parámetros desde el frontend

        const result = await isController.historial(userId, role, offset);
        if (!result || result.length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontrarón registros',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Success',
                result: result
            });
        }
    } catch (error) {
        console.error("Error al obtener viajes:", error);
        res.status(500).json({ error: "Error al obtener viajes" });
    }
});


isRouter.put('/update-estado-solicitud-id', async (req, res) => {
    const { estado, estado_cancelacion, estado_viaje, id } = req.body;
    try {

        console.log("df ", estado, estado_cancelacion, estado_viaje, id)
        if (!id) {
            return res.status(400).json({ error: 'Faltan parámetros' });
        }



        const result = await isController.updateEstado(estado, estado_cancelacion, estado_viaje, id);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Error al actualizar',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'Success',
                result: result
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Error  al actualizar',
            details: error.message,
        });
    }
})

module.exports = isRouter;