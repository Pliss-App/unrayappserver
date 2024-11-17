const express = require('express');

const isRouter = express.Router();

const isController = require('../models/web_user');


isRouter.get('/beneficios/:modulo', async (req, res) => {

 const result = await isController.beneficios(req.params.modulo);
    if (result === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: result
        });
    }
})


isRouter.get('/requisitos', async (req, res) => {

    const result = await isController.requisitos();
    if ( result === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result:  result
        });
    }
})

module.exports = isRouter;