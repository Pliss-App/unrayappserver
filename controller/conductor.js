const express = require('express');

const isRouter = express.Router();

const isController = require('../models/conductor');


isRouter.post('/create_travel', async (req, res) => {

 const create = await isController.createTravel(req.body.id_user_driver, req.body.id_user_passenger, req.body.id_service, req.body.descripcion, req.body.ayudante, req.body.tipo_vehiculo, req.body.address_initial, req.body.address_final, req.body.lat_initial, req.body.lng_initial, req.body.lat_final, req.body.lng_final, req.body.date_init, req.body.date_final, req.body.distance, req.body.total, req.body.status, req.body.status_travel
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


isRouter.get('/saldo-billetera/:id', async (req, res) => {
    try {
        // Llamar al controlador para obtener los datos de la billetera
        const user = await isController.saldoBilletera(req.params.id);

        // Verificar si se encontró el usuario o devolver saldo 0
        if (!user) {
            return res.status(200).send({
                msg: 'SUCCESSFULLY',
                result: { saldo: 0 } // Devolver saldo 0 si no hay registro
            });
        }

        // Si existe el registro, devolverlo
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: user
        });
    } catch (error) {
        console.error(error);
        // Manejar errores
        return res.status(500).send({
            error: 'Internal Server Error'
        });
    }
})

module.exports = isRouter;