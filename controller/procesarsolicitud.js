const express = require('express');
const haversine = require('haversine-distance'); // Para calcular distancias entre coordenadas.
const { getIo } = require('../socket');
const { findNearestDriver } = require("../utils/solicitud");
const OneSignal = require('../models/onesignalModel')
const tokeOne = require ('../models/conductor')
const cobro = require('../models/cobro')
const connection = require('../config/conexion');
//const io = socketIo(server);
const { respuestasSolicitudes, connectedUsers, connectedDrivers, getIO } = require('../socketOr');
const isRouter = express.Router();

const isController = require('../models/solicitud');
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


// Función para asignar un conductor y actualizar la solicitud
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
        } = soli

        if (index >= conductores.length) {
            await isController.deleteSolicitud(solicitudId);
            return resolve({
                success: false,
                message: 'No hay conductores disponibles.',
            });
        }

        const conductor = conductores[index];
        // Actualizar el idCONDUCTOR en la base de datos
    /*    const token=  await tokeOne.getTokenOnesignal(conductor.id);
        if (!token) {
            return;
            // return res.json({ success: false, message: "Token no encontrado" });
        }else {
            OneSignal.sendNotification(token, null, 'Nueva solicitud', 'Tienes una nueva solicitud de viaje. Tienes 30seg para aceptar.')
        }*/
          
        isController.updateEstadoUser(conductor.id, 'ocupado');
        const tiempoExpiracion = Date.now() + 30000;
        await isController.updateSolicitudConductor(solicitudId, tiempoExpiracion, conductor.id);
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
            fecha_hora
        });

        let timeout = setTimeout(async () => {
            isController.updateEstadoUser(conductor.id, 'libre');
            // console.log(`Tiempo agotado para el conductor ${conductor.nombre}, reasignando...`);
            resolve(await asignarConductor(solicitudId, conductores, index + 1, idUser));
        }, 32000);

        const intervalo = setInterval(async () => {
            if (respuestasSolicitudes[solicitudId]) {

                clearTimeout(timeout);
                const data = respuestasSolicitudes[solicitudId];
                delete respuestasSolicitudes[solicitudId]; // Eliminar respuesta usada

                if (data.estado === 'Aceptado') {
                    //   console.log(`Solicitud ${solicitudId} aceptada por ${conductor.nombre}`);
                    isController.updateEstadoUser(conductor.id, 'ocupado');
                    await connection.query("UPDATE solicitudes SET estado = 'Aceptado' WHERE id = ?", [solicitudId]);
                    io.to(connectedUsers[idUser]).emit('solicitud_iniciar', { solicitudId, estado: 'Aceptado' });
                    soli = {};

                    return resolve({
                        success: true,
                        message: 'Solicitud aceptada.',
                        solicitudId,
                    });
                } else if (data.estado == 'Rechazado') {
                    isController.updateEstadoUser(conductor.id, 'libre');
                    //console.log(`Solicitud ${solicitudId} rechazada por ${conductor.nombre}, reasignando...`);
                    //  asignarConductor(solicitudId, conductores, index + 1, idUser);
                    resolve(await asignarConductor(solicitudId, conductores, index + 1, idUser));
                } else if (data.estado == 'Cancelado') {
                    console.log("Aqui hacer que la solicitud actual a conductor se le elimine ");
                    clearTimeout(timeout);

                    await isController.updateEstadoUser(conductor.id, 'libre');
                    await isController.deleteSolicitud(solicitudId);
                    // Emitir una notificación al usuario
                    io.to(connectedUsers[idUser]).emit('solicitud_cancelada', { solicitudId, estado, estado_actual });

                    // Emitir una notificación al conductor
                    var estado_actual = 'Cancelado';
                    var estado = true;
                    io.to(connectedDrivers[conductor.id]).emit('solicitud_cancelada', { solicitudId, estado, estado_actual });

                    return resolve({
                        success: false,
                        message: 'Se ha cancelado el viaje.',
                    });
                }
            }
        }, 1000);
    });
}

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
        } = req.body;

        const conductores = await findNearestDriver(start_lat, start_lng, idService);

        if (conductores.length === 0) {
            //return res.status(400).json({ mensaje: "No hay conductores disponibles" });
            return res.status(200).json({
                success: false,
                message: 'No hay conductores disponibles.',

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
            fecha_hora
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