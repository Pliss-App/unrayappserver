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
    const { id, idViaje, isSharing } = req.body;
    try {
        if (!id) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        const update = await locationController.updateUserIsSharingUbication(id, idViaje, isSharing);

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


travelRouter.post('/insert_isSharing', async (req, res) => {
    const { idUser,
        idDriver,
        idViaje,
        isSharing,
        fecha } = req.body;
    try {
        const data = req.body;


        // Buscar si ya existe viaje
        const exists = await locationController.getUserIsSharingUbication(data.idUser, data.idViaje);
        // -------------------------------------------------------
        // SI EXISTE → UPDATE issharing = true
        // -------------------------------------------------------
        if (exists) {
            await locationController.updateUserIsSharingUbication(data.idUser, data.idViaje, data.isSharing);

            return res.status(200).send({
                msg: 'UPDATED - SHARING ACTIVATED',
                updated: true,
                travel: { ...exists, issharing: true }
            });
        }

        // -------------------------------------------------------
        // SI NO EXISTE → CREAR NUEVO REGISTRO
        // -------------------------------------------------------
        const create = await locationController.createIsSharing(idUser,
            idDriver,
            idViaje,
            isSharing,
            fecha);

        if (!create) {
            return res.status(500).send({ error: 'Error creating travel' });
        }

        return res.status(200).send({
            msg: 'TRAVEL CREATED SUCCESSFULLY',
            created: true,
            result: create
        });

    } catch (error) {
        console.error("Error in /create_travel:", error);
        return res.status(500).send({ error: 'Internal server error' });
    }
});


travelRouter.get('/permissiongetLocation/:id', async (req, res) => {
    const idViaje = req.query.idViaje; // viene como query param
    try {
        const exists = await locationController.getUserIsSharingUbication(req.params.id, idViaje);
        if (exists) {
            return res.status(200).send({
                success: true,
                msg: 'Permission TRUE',
                result: exists.isSharing
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: 'No tienes permiso',
            });
        }
    } catch (error) {
        console.log(error)
    }

})



travelRouter.get('/getLocation/:id', async (req, res) => {
    const idViaje = req.query.idViaje; // viene como query param
    try {
        const response = await locationController.obtenerLocationUser(req.params.id,);

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


module.exports = travelRouter;