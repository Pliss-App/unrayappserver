const express = require('express');

const travelRouter = express.Router();

const travelController = require('../controller//travel');


travelRouter.post('/create_travel', async (req, res) => {

    const create = await travelController.createTravel(req.body.travel);
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

module.exports = travelRouter;