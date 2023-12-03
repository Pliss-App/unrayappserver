const express = require('express');

const usuarioRouter = express.Router();

const userController = require('../controller/usuario');

usuarioRouter.get('/user/:uid', async (req, res) => {
    const user= await userController.getUser(req.params.uid)
    if (user === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {

        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: user
        });
    }
})

usuarioRouter.post('/insert_addressFavorite', async (req, res) => {

    const insert = await userController.insertAddressFavorite(req.body.idUser,req.body.uid,  req.body.address, req.body.lat, req.body.lng, req.body.idtAddres );
    if (insert === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: insert
        });
    }
})

usuarioRouter.post('/create_account', async (req, res) => {
    var user = req.body.user;
    var userDetail = req.body.userDetail;
    const getUser = await userController.getUser(user.uid)
    if (getUser === undefined) {

        const register = await userController.register(user.uid, user.name, user.email, user.pass, user.date_created, user.id_type)
        if (register === undefined) {
            res.json({
                error: 'Error, Datos no encontrados'
            })
        } else {
            const getUser = await userController.getUser(user.uid)
            if (getUser === undefined) {
                res.json({
                    error: 'Error, Datos no encontrados'
                })
            } else {
                userDetail.idUser = getUser.id;
                const usDet = await userController.insertUserDetail(userDetail)
                if (usDet === undefined) {
                    res.json({
                        error: 'Error, Datos no encontrados'
                    })
                } else {
                    return res.status(200).send({
                        msg: 'SUCCESSFULLY',
                        result: usDet
                    });
                }
            }
        }
    } else {
        const usDetUpdate = await userController.updateLogin(userDetail.lastLoginAt, userDetail.lastSignInTime, user.uid)
        if (usDetUpdate === undefined) {
            res.json({
                error: 'Error, Datos no encontrados'
            })
        } else {
            return res.status(200).send({
                msg: 'SUCCESSFULLY',
                result: 'Existente'
            });
        }
    }
})

usuarioRouter.put('/updateUser/:uid', async (req, res) => {
    var user = req.body
    const update = await userController.updateUser(user.name, user.last_name, user.gender, user.email, req.params.uid)
    if (update === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        var tableUser = await userController.updateTableUser(req.params.uid)

        if (tableUser === undefined) {
            res.json({
                error: 'Error, Datos no encontrados'
            })
        } else {
            return res.status(200).send({
                msg: 'SUCCESSFULLY',
                result: update
            });
        }

    }
})

usuarioRouter.put('/updatePhotoUser/:uid', async (req, res) => {
    var user = req.body
    const update = await userController.updatePhotoUser(user.photoURL, user.idphotoURL, req.params.uid)
    if (update === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: update
        });
    }
})

usuarioRouter.get('/userDetail/:uid', async (req, res) => {
    const user = await userController.getUserDetail(req.params.uid)
    if (user === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {

        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: user
        });
    }
})

module.exports = usuarioRouter;