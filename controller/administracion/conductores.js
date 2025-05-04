const express = require('express');

const isRouter = express.Router();

const isController = require('../../models/administracion/conductores');


isRouter.get('/conductores/activos', async (req, res) => {

    try {
        const result = await isController.getActivos();
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontro data',
                result: result
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


module.exports = isRouter;