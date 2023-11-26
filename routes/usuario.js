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

usuarioRouter.post('/create_account', async (req, res) => {
    const register = await userController.register(req.body.uid, req.body.name, req.body.email, req.body.pass, req.body.date_created, req.body.id_type)
    if (register === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: register
        });
    }
})  

module.exports = usuarioRouter;