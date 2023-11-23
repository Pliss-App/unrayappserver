const express = require('express');

const usuarioRouter = express.Router();

const userController = require('../controller/usuario');

usuarioRouter.get('/services', async (req, res) => {
    const services = await userController.getServices()
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

usuarioRouter.get('/carga/:id', (req, res) => {
    return res.status(200).send({ message:  `Mensaje de respuesta User ${req.params.id}` })
})  

module.exports = usuarioRouter;