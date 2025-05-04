const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../firebase');

const comercioRouter = express.Router();

const upload = multer({
    dest: './upload'
})

const mul = multer({
    storage: multer.memoryStorage(),
    limits: 1024 * 1024
})

const comercioController = require('../models/comercio');

//AREA DE CARGA DE IMAGENES
comercioRouter.post('/upload_profile', mul.single('image'), uploadImage, async (req, res) => {
    const url = {
        url: req.file.firebaseUrl,
        id_photo: req.body.id_photo
    }

    res.status(200).json({
        message: 'IMAGE UPLOADED SUCCESSFULLY',
        result: url
    })
})

comercioRouter.post('/add', async (req, res, ) => {
    var comercio =  req.body.comercio;
    const comerCode = await comercioController.comparaCode(comercio.code)
    if (comerCode === undefined) {
        const addComer = await comercioController.insertComercio( comercio.code, comercio.nombre, comercio.categoria)
        if (addComer === undefined) {
            res.json({
                error: 'Error,en le guardado'
            })
        } else {
            return res.status(200).send({
                msg: 'SUCCESSFULLY',
                user: addComer
            });
        }
    } else {
        let result = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwxyz0123456789'
        for (let i = 0; i < 6; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const addComer = await comercioController.insertComercio( result, comercio.nombre, comercio.categoria)
        if (addComer === undefined) {
            res.json({
                error: 'Error, en la busqueda'
            })
        } else {
            return res.status(200).send({
                msg: 'SUCCESSFULLY',
                user: addComer
            });
        }
    }
})


module.exports = comercioRouter;