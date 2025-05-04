const express = require('express');

const travelRouter = express.Router();

const travelController = require('../models/travel');


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


travelRouter.get('/get-solicitudes/:id', async (req, res) => {
    try {

    
        const response = await travelController.getSolicitudId(req.params.id);
        if (response === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro registro',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: response[0]
            });
        }
    } catch (error) {
        console.log("ERROR: ", error)
    }
})

module.exports = travelRouter;