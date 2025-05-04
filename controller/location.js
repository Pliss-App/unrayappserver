const express = require('express');

const travelRouter = express.Router();

const travelController = require('../models/travel');
const locationController = require('../models/location');


travelRouter.post('/create_travel', async (req, res) => {

    const create = await travelController.createTravel(req.body.id_user_driver, req.body.id_user_passenger, req.body.id_service, req.body.descripcion, req.body.ayudante, req.body.tipo_vehiculo, req.body.address_initial, req.body.address_final, req.body.lat_initial, req.body.lng_initial, req.body.lat_final, req.body.lng_final, req.body.date_init, req.body.date_final, req.body.distance, req.body.total, req.body.status, req.body.status_travel
    );
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


travelRouter.post('/create_travelDetail', async (req, res) => {

    const create = await travelController.createTravelDetail(req.body);
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


travelRouter.get('/obtenerLocation/:id', async (req, res) => {
    try {
        const response = await locationController.obtenerLocationUser(req.params.id);

        if (response === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Sin registros',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: response
            });
        }
    } catch (error) {
        console.log(error)
    }

})

travelRouter.get('/ubicacion', async (req, res) => {
    try {
        const id = req.query.id;

        const response = await locationController.obtenerLocationUserIsSharing(id);
        if (response === undefined || response.length == 0) {
            return res.status(200).send({
                success: false,
                msg: 'Sin registros',
                result: 'Al parecer no podemos compartir la ubicación en este momento.'
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: response[0]
            });
        }
    } catch (error) {
        console.log(error)
    }

})


travelRouter.put('/update-Location', async (req, res) => {
    const { id, lat, lng, angle } = req.body;
    try {
        if (!id || !lat || !lng) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        const update = await locationController.updateLocationUser(id, lat, lng, angle);

        if (update === undefined) {
            res.json({
                error: 'Error, Datos no encontrados'
            })
        } else {
            return res.status(200).send({
                msg: 'SUCCESSFULLY',
                result: update
            });
        }
    } catch (error) {
        console.log(error)
    }

})


travelRouter.put('/update-sharedLocation', async (req, res) => {
    const { id, isShared } = req.body;
    try {
        if (!id) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        const update = await locationController.updateSharedLocationUser(id, isShared);

        if (update === undefined) {
            res.json({
                error: 'Error, Datos no encontrados'
            })
        } else {
            return res.status(200).send({
                msg: 'SUCCESSFULLY',

            });
        }
    } catch (error) {
        console.log(error)
    }

})
module.exports = travelRouter;