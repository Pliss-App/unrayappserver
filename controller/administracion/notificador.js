const express = require('express');
const OneSignal = require('../../models/onesignalModel')
const travelRouter = express.Router();

const travelController = require('../../models/administracion/notificador');


travelRouter.post('/enviar-campania', async (req, res) => {
    const {userId, sonido, title, message, fecha, idUser} = req.body;
    try {
       const result = await OneSignal.sendNotification(userId, sonido, title, message, fecha, idUser, 'campania');
       if (result.id === undefined || result.id == '') {
            return res.status(200).send({
                success: false,
                msg: 'Error, no se pudo enviar',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: create
            });
        }
    } catch (error) {
        console.log("EERROR ", error)
    }
})

travelRouter.get('/list-usuarios', async (req, res) => {
    try {
        const result = await travelController.getUsuarios()
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result
            });
        }

    } catch (error) {
        console.error(error)
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

module.exports = travelRouter;