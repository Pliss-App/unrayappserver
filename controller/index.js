const express = require('express');

const indexRouter = express.Router();

//const contactusController = require('../controllers/contactus.controller');

indexRouter.get('/', (req, res) => {
    return res.status(200).send({ message: 'Mensaje de respuesta' })
})  

indexRouter.get('/carga/:id', (req, res) => {
    return res.status(200).send({ message:  `Mensaje de respuesta ${req.params.id}` })
})  

module.exports = indexRouter;