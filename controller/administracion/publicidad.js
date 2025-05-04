const express = require('express');
const isRouter = express.Router();
const { uploadImagePublicidad } = require('../../firebase');
const isController = require('../../models/administracion/publicidad');


isRouter.post('/upload_publicidad', uploadImagePublicidad, async (req, res) => {
    const url = {
        url: req.file.firebaseUrl,
        id: req.body.id_photo,
    }

    res.status(200).json({
        success: true,
        message: 'IMAGE UPLOADED SUCCESSFULLY',
        result: url
    })
})

// GET todas las publicidades
isRouter.get('/', async (req, res) => {
    try {
        const result = await isController.getPublicidades();
        if (!result || result.length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontró data',
                result: []
            });
        }
        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
            result :  result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error en el servidor',
            error
        });
    }
});

// GET por ID
isRouter.get('/:id', async (req, res) => {
    try {
        const result = await isController.getPublicidadById(req.params.id);
        if (!result) {
            return res.status(200).send({
                success: false,
                msg: 'No se encontró publicidad',
                result: null
            });
        }
        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
            result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error en el servidor',
            error
        });
    }
});

// POST - insertar nueva publicidad
isRouter.post('/', async (req, res) => {
    try {
        const body = req.body;
        const result = await isController.insertPublicidad(
            body.titulo,
            body.subtitulo,
            body.descripcion,
            body.url,
            body.ubicationurl,
            body.tipopublicidad,
            body.href
        );

        return res.status(201).send({
            success: true,
            msg: 'Insertado correctamente',
            result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error al insertar',
            error
        });
    }
});

// PUT - actualizar publicidad por ID
isRouter.put('/:id', async (req, res) => {
    try {
        console.log("DID ",req.params.id, req.body )
        const id = req.params.id;
        const result = await isController.updatePublicidad(id, req.body);
        return res.status(200).send({
            success: true,
            msg: 'Actualizado correctamente',
            result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error al actualizar',
            error
        });
    }
});

// DELETE - eliminar publicidad por ID
isRouter.delete('/:id', async (req, res) => {
    try {
        const result = await isController.deletePublicidad(req.params.id);
        return res.status(200).send({
            success: true,
            msg: 'Eliminado correctamente',
            result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            msg: 'Error al eliminar',
            error
        });
    }
});

module.exports = isRouter;
