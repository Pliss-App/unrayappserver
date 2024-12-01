const express = require('express');
const { getIo } = require('../socket');
const haversine = require('haversine-distance'); // Para calcular distancias entre coordenadas.
const app = express()
//const io = socketIo(server);
const isRouter = express.Router();

const isController = require('../models/solicitud');

isRouter.post('/solicitudes', async (req, res) => {
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
        fecha_hora
    } = req.body;

    try {
        // Obtener el objeto `io` desde `app`
        const io = req.app.get('socketio');
        // Paso 1: Obtener conductores disponibles
        const conductores = await isController.conductores(idService);

        if (conductores.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No hay conductores disponibles.'
            });
        }

        const origen = { lat: parseFloat(start_lat), lng: parseFloat(start_lng) };

        // Paso 2: Ordenar conductores por cercanía
        const conductoresOrdenados = conductores
            .map(conductor => {
                const destino = { lat: parseFloat(conductor.lat), lng: parseFloat(conductor.lon) };
                const distancia = haversine(origen, destino); // Distancia en metros
                return { ...conductor, distancia };
            })
            .sort((a, b) => a.distancia - b.distancia); // Ordenar por distancia ascendente

        // Paso 3: Asignar solicitud en secuencia
        let intento = 0;

        const asignarConductor = async () => {
            if (intento >= conductoresOrdenados.length) {
                intento = 0; // Reiniciar a la primera posición si no quedan más conductores
            }

            const conductorActual = conductoresOrdenados[intento];
            intento++;

            console.log(`Intentando asignar a: ${conductorActual.nombre}`);

            try {
                // Crear solicitud en la base de datos
                const solicitud = await isController.createSolicitud(
                    idUser,
                    conductorActual.id,
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

                // Cambiar estado del conductor a ocupado
                await isController.updateEstadoUser(conductorActual.id, 'ocupado');

                io.emit('solicitud_pendiente', {
                    conductorId: conductorActual.id,
                    solicitudId: solicitud.insertId,
                    start_lat,
                    start_lng,
                    start_direction,
                    end_lat,
                    end_lng,
                    end_direction
                });

                

                // Notificación al conductor (aquí se debe usar WebSocket o push notifications)
                console.log(`Notificando a conductor ${conductorActual.nombre}...`);

                // Paso 4: Esperar 30 segundos para respuesta del conductor
                setTimeout(async () => {
                    const estadoConductor = await isController.obtenerEstadoConductor(conductorActual.id);

                    if (estadoConductor === 'ocupado') {
                        // El conductor aceptó la solicitud
                        return res.status(201).json({
                            success: true,
                            message: 'Solicitud aceptada.',
                            solicitudId: solicitud.insertId,
                            conductor: conductorActual,
                        });
                    } if (estadoConductor === 'cancelado') {
                        return res.status(201).json({
                            success: true,
                            message: 'Solicitud cancelada.'
                        });
                    } else {
                        // Conductor rechazó o tiempo excedido
                        console.log(`Conductor ${conductorActual.nombre} rechazó o no respondió.`);
                        await isController.updateEstadoUser(conductorActual.id, 'libre'); // Restaurar su estado
                        asignarConductor(); // Reasignar a otro conductor
                    }
                }, 30000);
            } catch (error) {
                console.error(`Error al asignar conductor ${conductorActual.nombre}:`, error);
                asignarConductor(); // Reintentar con otro conductor en caso de fallo
            }
        };

        asignarConductor(); // Inicia el proceso de asignación
    } catch (error) {
        console.error("Error general en la creación de solicitud:", error);
        res.status(500).json({ success: false, message: 'Error al crear la solicitud.' });
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

module.exports = isRouter;