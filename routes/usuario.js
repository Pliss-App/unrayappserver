const express = require('express');
var base64Img = require('base64-img');

const usuarioRouter = express.Router();

const userController = require('../controller/usuario');



usuarioRouter.get('/user/:uid', async (req, res) => {
    const user = await userController.getUser(req.params.uid)
    if (user === undefined) {
        res.json({
            error: 'Error, Datos no encontrados',
            result: '/edit'
        })
    } else {

        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: user
        });
    }
})

usuarioRouter.get('/userDetailBy/:uid', async (req, res) => {
    const user = await userController.getUserDet(req.params.uid)
    if (user === undefined) {
        res.json({
            error: 'Error, Datos no encontrados',
            result: '/edit'
        })
    } else {

        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: user
        });
    }
})

usuarioRouter.post('/insert_addressFavorite', async (req, res) => {

    const insert = await userController.insertAddressFavorite(req.body.idUser, req.body.uid, req.body.address, req.body.lat, req.body.lng, req.body.idtAddres);
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

usuarioRouter.post('/insert_location', async (req, res) => {
    const getIn = await userController.getLocationUser(req.body.uid);
    if (getIn === undefined) {
        const insert = await userController.registerLocation(req.body);
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
    } else {
        const upd = await userController.updateLocation(req.body.uid, req.body.lat, req.body.lng);
        if (upd === undefined) {
            res.json({
                error: 'Error, Datos no encontrados'
            })
        } else {
            return res.status(200).send({
                msg: 'SUCCESSFULLY',
                result: upd
            });
        }
    }
})

usuarioRouter.post('/create_account', async (req, res) => {
    var user = req.body.user;
    var userDetail = req.body.userDetail;
    const getUser = await userController.getUser(user.uid)
    if (getUser === undefined) {

        const register = await userController.register(user.uid, user.name, user.email, user.pass, user.id_status, user.idStatus_travel, user.date_created, user.id_type.user.idService)
        if (register === undefined) {
            res.json({
                error: 'Error, Datos no encontrados'
            })
        } else {
            const getUserby = await userController.getUserBy(user.uid)
            if (getUserby === undefined) {
                res.json({
                    error: 'Error, Datos no encontrados'
                })
            } else {
                return res.status(200).send({
                    msg: 'SUCCESSFULLY',
                    result: getUserby.id
                });
                /*  var detail = {
                       idUser: getUserby.id,
                       uid: userDetail.uid,
                       name: userDetail.name,
                       last_name: userDetail.last_name,
                       gender: userDetail.gender,
                       photoURL: userDetail.userDetail.photoURL,
                       idphotoURL: userDetail.idphotoURL,
                       phoneNumber: userDetail.phoneNumber,
                       email: userDetail.email,
                       emailVerified: userDetail.emailVerified,
                       providerId: userDetail.providerId,
                       createdAt: userDetail.createdAt,
                       creationTime: userDetail.creationTime,
                       lastLoginAt: userDetail.lastLoginAt,
                       lastSignInTime: userDetail.lastSignInTime,
                   }
                   const usDet = await userController.insertUserDetail(detail)
                   if (usDet === undefined) {
                       res.json({
                           error: 'Error, Datos no encontrados'
                       })
                   } else {
                       return res.status(200).send({
                           msg: 'SUCCESSFULLY',
                           result: usDet
                       });
                   }*/
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


usuarioRouter.get('/userId/:id', async (req, res) => {
    const getUserby = await userController.getUserBy(user.uid)
    if (getUserby === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: getUserby.id
        });
    }
})

usuarioRouter.post('/addDetailUser', async (req, res) => {
    const usDet = await userController.insertUserDetail(req.body.idUser, req.body.uid, req.body.name, req.body.last_name, req.body.gender, req.body.photoURL, req.body.idphotoURL, req.body.phoneNumber, req.body.email, req.body.emailVerified, req.body.providerId, req.body.createdAt, req.body.creationTime, req.body.lastLoginAt, req.body.lastSignInTime)
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
})

//
usuarioRouter.put('/updateUser/:uid', async (req, res) => {
    var user = req.body
    const update = await userController.updateUser(user.name, user.last_name, user.gender, user.email, req.params.uid)
    if (update === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        var tableUser = await userController.updateTableUser(user.name, user.last_name, user.email, req.params.uid)

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
            error: 'Error, Datos no encontrados',
            result: 'editar'
        })
    } else {

        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: user
        });
    }
})


usuarioRouter.post('/base64', async (req, res) => {

    const data = await fetch("https://www.copahost.com/blog/wp-content/uploads/2019/07/imgsize2.png");
    res.send(Buffer.from(await data.arrayBuffer()));

})

module.exports = usuarioRouter;