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
                result: usDetUpdate
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