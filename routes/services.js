const express = require('express');

const servicesRouter = express.Router();

const servController = require('../controller/services');

servicesRouter.get('/list', async (req, res) => {
    const services = await servController.getServices()
    if (services === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: services
        });
    }
})

servicesRouter.get('/costokm/:km', async (req, res) => {
    const services = await servController.getCosSerKm(req.params.km)
    if (services === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: services.precio
        });
    }
})

servicesRouter.get('/getDriverActive', async (req, res) => {

        const driver = await servController.getDriver()
        if (driver === undefined) {
            res.json({
                error: 'Error, Datos no encontrados'
            })
        } else {
            return res.status(200).send({
                msg: 'SUCCESSFULLY',
                result: driver
            });
        }
})


servicesRouter.get('/getDriverService/:id/:lat/:lng', async (req, res) => {

    const getPoint = await servController.getPoint(req.params.lat, req.params.lng)
    if (getPoint === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: getPoint
        });
    }
  /*  const driver = await servController.getDriverService(req.params.id, req.params.lat, req.params.lng)
    if (driver === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: driver
        });
    }*/
})

servicesRouter.get('/api/carga/:id', (req, res) => {
    return res.status(200).send({ message: `Mensaje de respuesta User ${req.params.id}` })
})

module.exports = servicesRouter;