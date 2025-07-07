const express = require('express');
const haversine = require('haversine-distance'); // Para calcular distancias entre coordenadas.
const { getIo } = require('../socket');
const { findNearestDriver } = require("../utils/solicitud");
const OneSignal = require('../models/onesignalModel')
const tokeOne = require('../models/conductor')
const cobro = require('../models/cobro')
const connection = require('../config/conexion');
const { enviarNotificacionFCM } = require("../firebase")
//const io = socketIo(server);
const { respuestasSolicitudes, connectedUsers, connectedDrivers, getIO } = require('../socketOr');
const isRouter = express.Router();

const isController = require('../models/solicitud');
const isUserController = require('../models/usuario')
const solicitudesActivas = new Map(); // Almacena solicitudes activas con su tiempo restante

const io = getIO();
var soli = {};
let res = null

// Función para calcular la distancia entre dos coordenadas (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Obtener los conductores ordenados por distancia
async function obtenerConductores(lat, lon, idService) {
    const [rows] = await connection.query(
        `SELECT u.id, u.nombre, u.apellido, 
       u.telefono, u.foto, r.nombre as rol, u.estado,
       u.estado_usuario, l.lat, l.lon, u.socket_id FROM usuario u 
       inner join usuario_rol  ur
       on u.id = ur.iduser
       inner join roles r
       ON r.id = ur.idrol
       INNER JOIN location l
       ON u.id = l.iduser
       WHERE estado = 1 and estado_usuario = 'libre' AND idservice = ?`, [idService]);
    return rows
        .map((c) => ({
            ...c,
            distancia: calcularDistancia(lat, lon, c.lat, c.lon),
        }))
        .sort((a, b) => a.distancia - b.distancia);
}

async function asignarConductor(solicitudId, conductores, index, idUser) {
    return new Promise(async (resolve) => {
        const {
            idService,
            start_lat,
            start_lng,
            start_direction,
            end_lat,
            end_lng,
            end_direction,
            distance,
            distance_unit,
            duration,
            duration_unit,
            costo,
            fecha_hora,
            fecha,
            hora
        } = soli

        if (index >= conductores.length) {

            delete respuestasSolicitudes[solicitudId];
            await isController.deleteSolicitud(solicitudId);
            return resolve({
                success: false,
                message: 'No hay conductores disponibles. Intenta más tarde.',
            });
        }

        const conductor = conductores[index];
        const token = await tokeOne.getTokenFCM(conductor.id);
        if (!token) {
            return;
        } else {
            const user = await isUserController.getUsuario(idUser);
            const result = await enviarNotificacionFCM(token.tokenfcm, solicitudId, start_direction, end_direction, costo, user[0].nombre + " " + user[0].apellido, user[0].foto, idUser, conductor.id)
        }

        const updateEsta = await isController.updateEstadoUser(conductor.id, 'ocupado');

        if (updateEsta === undefined) {
            return resolve({
                success: false,
                message: 'Error al solicitar Viaje.',
            });
        } else {
            const tiempoExpiracion = Date.now() + 30000;
            const udSolCon = await isController.updateSolicitudConductor(solicitudId, tiempoExpiracion, conductor.id);
            const foto = await isUserController.getFoto(idUser);

            io.to(connectedDrivers[conductor.id]).emit('nueva_solicitud', {
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
                fecha_hora,
                tiempoExpiracion,
                foto
            });
        }

        var contador = 0;
        const intervalo = setInterval(async () => {
            contador = contador + 1;

            if (contador <= 30) {
                if (respuestasSolicitudes[solicitudId]) {
                    const data = respuestasSolicitudes[solicitudId];
                    delete respuestasSolicitudes[solicitudId];

                    if (data.estado === 'Aceptado') {
                        contador = 0
                        clearInterval(intervalo);
                        const upEU = await isController.updateEstadoUser(conductor.id, 'ocupado');
                        const atendio = await connection.query("UPDATE solicitudes SET estado = 'Aceptado' WHERE id = ?", [solicitudId]);
                        soli = {};
                        delete respuestasSolicitudes[solicitudId];
                        io.to(connectedDrivers[conductor.id]).emit('solicitud_iniciar_viaje', { solicitudId, estado: 'Aceptado' });
                        io.to(connectedUsers[idUser]).emit('solicitud_iniciar', { solicitudId, estado: 'Aceptado' });
                        return resolve({
                            success: true,
                            message: 'Solicitud aceptada.',
                            solicitudId
                        });
                    } else if (data.estado == 'Rechazado') {
                        contador = 0;
                        clearInterval(intervalo);
                        delete respuestasSolicitudes[solicitudId];
                        const upEsU = await isController.updateEstadoUser(conductor.id, 'libre');
                        resolve(await asignarConductor(solicitudId, conductores, index + 1, idUser));
                    } else if (data.estado == 'Cancelado') {
                        delete respuestasSolicitudes[solicitudId];
                        await isController.updateEstadoUser(conductor.id, 'libre');
                        await isController.deleteSolicitud(solicitudId);
                        io.to(connectedUsers[idUser]).emit('solicitud_cancelada', { solicitudId, estado, estado_actual });
                        var estado_actual = 'Cancelado';
                        var estado = true;
                        io.to(connectedDrivers[conductor.id]).emit('solicitud_cancelada', { solicitudId, estado, estado_actual });
                        return resolve({
                            success: false,
                            message: 'Se ha cancelado el viaje.',
                        });
                    }
                }
            } else {
                clearInterval(intervalo);
                contador = 0;
                await isController.updateEstadoUser(conductor.id, 'libre');
                resolve(await asignarConductor(solicitudId, conductores, index + 1, idUser));
            }
        }, 1000);
    });
}


isRouter.put("/update-estado-usuario", async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return 0;
    } else {
        const result = await isController.updateEstadoUser(id, 'libre');
        if (result === undefined) {
            return res.status(200).json({
                success: false,
                message: 'ERROR AL ACTUALIZAR',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'UPDATE SUCCESSFULLY',
            });
        }
    }
})

isRouter.post("/prueba_onesignal", async (req, res) => {
    const token = await tokeOne.getTokenOnesignal(3);
    if (!token) {
        return;
        // return res.json({ success: false, message: "Token no encontrado" });
    } else {

        const now = new Date();
        now.getFullYear() + "-" +
            String(now.getMonth() + 1).padStart(2, "0") + "-" +
            String(now.getDate()).padStart(2, "0") + " " +
            String(now.getHours()).padStart(2, "0") + ":" +
            String(now.getMinutes()).padStart(2, "0") + ":" +
            String(now.getSeconds()).padStart(2, "0");
        const result = await OneSignal.sendNotificationPruebas(token, null, 'Promoción', 'Descuento del 50% en tu viaje hoy 23 de Marzo.', now, 3)
        if (result === undefined) {
            //return res.status(400).json({ mensaje: "No hay conductores disponibles" });
            return res.status(200).json({
                success: false,
                message: 'ERROR AL ENVIAR',

            });
        } else {
            return res.status(200).send({
                msg: 'SUCCESSFULLY',
                result: result
            });
        }

    }
})

// Endpoint para solicitar un viaje
isRouter.post("/crear", async (req, res) => {
    res = res;
    try {
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
            duration,
            duration_unit,
            costo,
            fecha_hora,
            fecha,
            hora
        } = req.body;

        const conductores = await findNearestDriver(start_lat, start_lng, idService);
        if (conductores.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No hay conductores disponibles. Intenta más tarde.',
            });
        }

        soli = {
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
            fecha,
            hora
        }
        const result = await isController.createSolicitud(
            idUser,
            null,
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
        const solicitudId = result.insertId;
        io.to(connectedUsers[idUser]).emit('solicitud_creada', { solicitudId, estado: true });
        // Esperar la respuesta de asignarConductor antes de continuar
        const asignacion = await asignarConductor(solicitudId, conductores, 0, idUser);

        return res.status(200).json(asignacion);
    } catch (error) {
        console.error("Error en la solicitud de viaje:", error);
        return res.status(500).json({ success: false, message: "Error en el servidor" });
    }

});

module.exports = isRouter;