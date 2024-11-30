const express = require('express');

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
        duration,
        costo,
        fecha_hora,
    } = req.body;

    try {

        const [conductores] = await isController.conductores(idUser,
            idService,
            start_lat,
            start_lng,
            start_direction,
            end_lat,
            end_lng,
            end_direction,
            distance,
            duration,
            costo,
            fecha_hora);

        if (conductores.length === 0) {
            return res.status(404).json({ message: 'No hay conductores disponibles.' });
        }

        // Paso 2: Calcular el conductor más cercano
        const origen = { lat: parseFloat(start_lat), lng: parseFloat(start_lng) };
        let conductorCercano = null;
        let menorDistancia = Infinity;


        conductores.forEach((conductor) => {
            const destino = {
                lat: parseFloat(conductor.ubicacion_lat),
                lng: parseFloat(conductor.ubicacion_lng),
            };

            const distancia = haversine(origen, destino); // Calcula distancia en metros
            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                conductorCercano = conductor;
            }
        });

        if (!conductorCercano) {
            return res.status(404).json({ message: 'No se encontró un conductor cercano.' });
        }

        const [result] = await isController.createSolicitud(conductorCercano.id);

        await isController.updateEstadoUser(conductorCercano.id);
        res.status(201).json({
            message: 'Solicitud creada con éxito.',
            solicitudId: result.insertId,
            conductor: conductorCercano,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear la solicitud.' });
    }

})


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