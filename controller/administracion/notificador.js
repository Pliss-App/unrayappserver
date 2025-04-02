const express = require('express');
const OneSignal = require('../../models/onesignalModel')
const travelRouter = express.Router();

const travelController = require('../../models/travel');


travelRouter.post('/enviar-campania', async (req, res) => {
    const {userId, sonido, title, message, fecha, idUser} = req.body;
    try {
       const result = await OneSignal.sendNotification(userId, sonido, title, message, fecha, idUser);
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