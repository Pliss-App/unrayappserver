const express = require('express');
const haversine = require('haversine-distance'); // Para calcular distancias entre coordenadas.
const { getIo } = require('../socket');
const { findNearestDriver } = require("../utils/solicitud");
const OneSignal = require('../models/onesignalModel')
//const io = socketIo(server);
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
        console.log("IDID ", req.params.id)
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
        if (solicitudPendiente.estado != 'Pendiente') {
            console.log("SOLICIUTD ACEPTADA YA ");
            solicitudesActivas.delete(idConductor);
            return res.status(200).json({
                success: true,
                message: 'Solicitud Aceptada!.',
            });
            // Remover solicitud de memoria después de procesarla

        }

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

isRouter.post('/crear_viaje', async (req, res) => {
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
    let contadorTotal = 180; // Tiempo total límite de espera en segundos

    while (contadorTotal > 0) {
        // Buscar conductores disponibles que no hayan sido intentados previamente
        const drivers = await findNearestDriver(start_lat, start_lng, idService);
        const driver = drivers.find(d => !conductoresIntentados.includes(d.id));

        if (!driver) {
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

        // Esperar respuesta del conductor
        let contador = 30; // Tiempo para esperar respuesta del conductor actual
        let solicitudAceptada = false;

        const intervalId = setInterval(async () => {
            contador--;
            contadorTotal--;

            try {
                const estadoConductor = await isController.respDriver(driver.id);

                if (estadoConductor.estado_usuario === 'ocupado' && estadoConductor.estado === 'Aceptada') {
                    clearInterval(intervalId);
                    solicitudAceptada = true;

                }

                if (contador <= 0) {
                    clearInterval(intervalId);
                    if (!solicitudAceptada) {
                        return res.status(408).json({ // Por ejemplo, si el tiempo se agota
                            success: false,
                            message: 'Tiempo de espera agotado.',
                        });
                    }
                }
            } catch (error) {
                console.error('Error al verificar el estado del conductor:', error);
                clearInterval(intervalId);
            }
        }, 1000);

        // Esperar a que termine el intervalo o que se acepte la solicitud
        await new Promise(resolve => setTimeout(resolve, contador * 1000));

        if (solicitudAceptada) {

            return res.status(200).json({
                success: true,
                message: 'Solicitud Aceptada.',
                solicitudId,
            });
        }

        // Si se agotó el tiempo para este conductor, intentar con otro
        if (contadorTotal <= 0) {
            return res.status(200).json({
                success: false,
                message: 'No se pudo asignar un conductor en el tiempo límite.',
            });
        }
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
        const { emisor_id, receptor_id, mensaje } = req.body;

        if (!emisor_id || !receptor_id || !mensaje) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const mensajes = await isController.saveMessage(emisor_id, receptor_id, mensaje);
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



isRouter.get("/obtener/mensajes", async (req, res) => {
    try {
        const { emisor_id, receptor_id } = req.query;
        if (!emisor_id || !receptor_id) {
            return res.status(400).json({ error: 'emisor_id y receptor_id son obligatorios' });
        }

        const mensajes = await isController.obtMessage(emisor_id, receptor_id);
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


isRouter.get('/motivos_cancelacion', async (req, res) => {
    try {
        const result = await isController.obtMotCancelar();
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
        const { id, option } = req.body;
        const result = await isController.cancelarViaje(id, option);
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


isRouter.put('/update-estado-viaje', async (req, res) => {
    try {
        const { id, estado } = req.body;
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

isRouter.put('/finalizar-viaje', async (req, res) => {
    try {
        const { id } = req.body;
        const result = await isController.finalizarViaje(id);
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
    const { userId, sonido,title, message } = req.body;

    if (!userId || !message) {
        return res.status(400).json({ error: 'Faltan parámetros: userId y message' });
    }

    try {
        const result = await OneSignal.sendNotification(userId, sonido, title, message);
        if (result.id === undefined || result.id == '') {
            return res.status(200).json({
                success: false,
                message: 'Notificación Error',
                 result
            });
    }else {
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




module.exports = isRouter;