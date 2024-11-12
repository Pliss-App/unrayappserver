const express = require('express');

const isRouter = express.Router();

const isController = require('../models/carousel');




isRouter.get('/modulo/:modulo', async (req, res) => {

    try {
        const result = await isController.getCarousel(req.params.modulo);
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

    } catch (error) {
        console.error(error)
    }

})


module.exports = isRouter;