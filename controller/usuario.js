const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const usuarioRouter = express.Router();

const userController = require('../models/usuario');
const connection = require('../config/conexion');


usuarioRouter.post('/registro', async (req, res) => {

    try {
        const { nombre, apellido, telefono, correo, password } = req.body;

        const results = await userController.getUserTelfonoEmail(telefono);
        if (results === undefined) {

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await userController.createUser({
                nombre, apellido, telefono, correo,
                password: hashedPassword
            });
            const idService = 0;
            const permission = await userController.agregarRol(result.insertId, idService);
            return res.status(200).json({ msg: 'Cuenta Creada', status: 200 });
        } else {
            return res.status(200).json({
                msg: 'Teléfono o correo, vinculados a otra cuenta existente.',
            });
        }

    } catch (error) {
        console.error('Error durante el registro:', error);  // Verificamos el código de error
        switch (error.code) {
            case 'ER_NO_SUCH_TABLE':

                return res.status(400).json({
                    error: error.sqlMessage
                });
            case 'ER_DUP_ENTRY':
                // Error de entrada duplicada (ej. DPI o email ya existen en la base de datos)
                console.error('Correo o teléfono ya existe.');
                return res.status(400).json({
                    error: error.sqlMessage
                });

            case 'ER_BAD_FIELD_ERROR':
                // Error de campo incorrecto (cuando un campo de la consulta no existe en la base de datos)
                console.error('Campo no válido en la consulta.');
                return res.status(400).json({
                    error: error.sqlMessage
                });

            case 'ER_NO_REFERENCED_ROW':
            case 'ER_ROW_IS_REFERENCED':
                // Error de violación de llave foránea (cuando estás eliminando o insertando un valor que tiene dependencias)
                console.error('Violación de llave foránea.');
                return res.status(409).json({
                    error: error.sqlMessage
                });

            case 'ER_DATA_TOO_LONG':
                // Error de longitud de dato (cuando intentas insertar un valor que excede la longitud permitida)
                console.error('Dato demasiado largo para uno de los campos.');
                return res.status(400).json({
                    error: 'Uno de los campos supera la longitud permitida.'
                });

            default:
                // Cualquier otro error no manejado específicamente
                console.error('Error inesperado:', error);
                return res.status(500).json({
                    error: 'Ocurrió un error inesperado al crear tu cuenta.'
                });
        }
    }
})

usuarioRouter.post('/login', async (req, res) => {
    try {
        if (!req.timedout) {
            const { user, password } = req.body;

            const existingUser = await userController.getLogin(user);

            if (existingUser === undefined) {
                res.json('Error, Correo o telefono no registrados.')
            } else {
                const equals = bcrypt.compareSync(password, existingUser.password);

                if (equals) {
                    var _user = {
                        estado: existingUser.estado, marker: existingUser.marker,
                        foto: existingUser.foto, idUser: existingUser.idUser, idrol: existingUser.idRol,
                        rol: existingUser.rol, nombre: existingUser.nombre,
                        apellido: existingUser.apellido, correo: existingUser.correo,
                        telefono: existingUser.telefono
                    }
                    const token = jwt.sign({
                        estado: existingUser.estado, marker: existingUser.marker,
                        foto: existingUser.foto, idUser: existingUser.idUser,
                        idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre,
                        apellido: existingUser.apellido, correo: existingUser.correo,
                        telefono: existingUser.telefono
                    },
                        process.env.JWT_SECRET, {
                        expiresIn: '5h'
                    }
                    );
                    return res.status(200).send({
                        msg: 'Logged in!',
                        token,
                        result: true,
                        user: _user
                    });
                } else {
                    res.json('Error, Contrasenia Incorrecta')
                }
            }
        } else {
            res.status(503).json({ error: 'La solicitud ha caducado' });
        }
    } catch (error) {
        console.error('Error durante el logeo:', error);  // Verificamos el código de error

        // Manejo de errores según el código
        switch (error.code) {
            case 'ER_NO_SUCH_TABLE':

                return res.status(400).json({
                    error: error.sqlMessage
                });
            case 'ER_DUP_ENTRY':
                // Error de entrada duplicada (ej. DPI o email ya existen en la base de datos)
                console.error('DPI o correo electrónico ya existe.');
                return res.status(400).json({
                    error: error.sqlMessage
                });

            case 'ER_BAD_FIELD_ERROR':
                // Error de campo incorrecto (cuando un campo de la consulta no existe en la base de datos)
                console.error('Campo no válido en la consulta.');
                return res.status(400).json({
                    error: 'Error en la solicitud: el campo proporcionado no es válido.'
                });

            case 'ER_NO_REFERENCED_ROW':
            case 'ER_ROW_IS_REFERENCED':
                // Error de violación de llave foránea (cuando estás eliminando o insertando un valor que tiene dependencias)
                console.error('Violación de llave foránea.');
                return res.status(409).json({
                    error: 'No puedes realizar esta acción porque hay registros relacionados en otra tabla.'
                });

            case 'ER_DATA_TOO_LONG':
                // Error de longitud de dato (cuando intentas insertar un valor que excede la longitud permitida)
                console.error('Dato demasiado largo para uno de los campos.');
                return res.status(400).json({
                    error: 'Uno de los campos supera la longitud permitida.'
                });

            default:
                // Cualquier otro error no manejado específicamente
                console.error('Error inesperado:', error);
                return res.status(500).json({
                    error: 'Ocurrió un error inesperado al actualizar la cuenta.'
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

usuarioRouter.get('/documentacion/:id', async (req, res) => {
    try {
        const getUserby = await userController.getDocumentacionUser(req.params.id);

        // Verificar si se encontraron registros
        if (!getUserby || getUserby.length === 0) {
            return res.status(200).json({
                success: false,
                result: false,
                msg: 'No se encontraron registros'
            });
        }

        // Si se encontraron registros
        return res.status(200).json({
            success: true,
            result: true,
            data: getUserby,
            msg: 'Registros encontrados'
        });
    } catch (error) {
        console.error('Error en el servidor:', error);
        return res.status(500).json({
            success: false,
            msg: 'Error en el servidor',
            result: false
        });
    }
})

usuarioRouter.get('/getPhotoPin/:uid', async (req, res) => {
    const getPhoto = await userController.getPhotoProfile(req.params.uid)
    if (getPhoto === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: getPhoto.base64photo
        });
    }
})

usuarioRouter.post('/addDetailUser', async (req, res) => {
    const usDet = await userController.insertUserDetail(req.body.idUser, req.body.uid, req.body.name, req.body.last_name, req.body.gender, req.body.base64photo, req.body.photoURL, req.body.idphotoURL, req.body.phoneNumber, req.body.email, req.body.emailVerified, req.body.providerId, req.body.createdAt, req.body.creationTime, req.body.lastLoginAt, req.body.lastSignInTime)
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


usuarioRouter.post('/update-location', async (req, res) => {
    try {
        var { iduser, lat, lon, angle } = req.body;
        const usDet = await userController.updateLocationConductor(iduser, lat, lon, angle)
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
    } catch (error) {
        console.error(error)
    }
})


usuarioRouter.post('/insert-location', async (req, res) => {
    try {
        const data = req.body;
        const usDet = await userController.insertLocation(data)
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
    } catch (error) {
        console.error(error)
    }
})

//
usuarioRouter.put('/updateUser/:id', async (req, res) => {
    try {
        var user = req.body
        const update = await userController.updateUser(user.nombre, user.apellido, user.telefono, user.correo, req.params.id)
        if (update === undefined) {
            res.json({
                error: 'Error, Usuario no encontrado'
            })
        } else {

            const existingUser = await userController.refreshLogin(req.params.id);
            var _user = {
                foto: existingUser.foto, marker: existingUser.marker, idUser: existingUser.idUser, idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre, apellido: existingUser.apellido, correo: existingUser.correo, telefono: existingUser.telefono
            }

            const token = jwt.sign({
                foto: existingUser.foto, marker: existingUser.marker, idUser: existingUser.idUser, idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre, apellido: existingUser.apellido, correo: existingUser.correo, telefono: existingUser.telefono
            },
                process.env.JWT_SECRET, {
            }
            );
            return res.status(200).send({
                msg: 'SUCCESSFULLY',
                token,
                result: true,
                user: _user
            });

        }
    } catch (error) {
        console.error(error)
    }
})

usuarioRouter.put('/updateFoto', async (req, res) => {
    var user = req.body;
    const update = await userController.updateFoto(user.id, user.foto)
    if (update === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        const existingUser = await userController.refreshLogin(user.id);
        var _user = {
            foto: existingUser.foto, marker: existingUser.marker, idUser: existingUser.idUser, idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre, apellido: existingUser.apellido, correo: existingUser.correo, telefono: existingUser.telefono
        }

        const token = jwt.sign({
            foto: existingUser.foto, marker: existingUser.marker, idUser: existingUser.idUser, idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre, apellido: existingUser.apellido, correo: existingUser.correo, telefono: existingUser.telefono
        },
            process.env.JWT_SECRET, {
        }
        );
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: update,
            token,
            user: _user
        });
    }
})

usuarioRouter.get('/foto/:id', async (req, res) => {
    const user = await userController.getFoto(req.params.id)
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

usuarioRouter.get('/icon-driver/:id', async (req, res) => {
    const user = await userController.iconMarker(req.params.id)
    if (user === undefined) {
        res.json({
            error: 'Error, Datos no encontrados',
            result: 'editar'
        })
    } else {

        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: user.nombre
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


usuarioRouter.get('/usercalificacion/:uid', async (req, res) => {
    const user = await userController.perfilCalificacion(req.params.uid)
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



usuarioRouter.post('/recover', async (req, res) => {
    const { user } = req.body;
    try {

        const results = await userController.getUserTelfonoEmail(user);
        if (results === undefined) {
            return res.status(404).send('Usuario no encontrado');
        } else {
            // Generar token único
            const token = crypto.randomBytes(20).toString('hex');
            const expiration = new Date();
            expiration.setHours(expiration.getHours() + 1); // 1 hora de validez

            // Guardar token en la base de datos
            userController.updateUsuarioPass(token, expiration, user)

            // Configurar transporte de nodemailer
            const transporter = nodemailer.createTransport({
                host: 'smtp.hostinger.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.GMAIL_USER, // Tu correo
                    pass: process.env.GMAIL_APP_PASSWORD, // La contraseña específica de la aplicación
                },
            });

            // Enviar correo
            const resetUrl = `https://unraylatinoamerica.com/reset-password?token=${token}`;
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: user,
                subject: 'Recuperación de Contraseña',
                text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetUrl}`,
            };

            await transporter.sendMail(mailOptions);
            //res.send('Correo de recuperación enviado');
            return res.status(200).send({
                msg: 'SUCCESSFULLY',
                result: 'Correo de recuperación enviado'
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error interno del servidor');
    }
});

usuarioRouter.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    try {
        const user = await userController.getPassword(token);

        if (user === undefined) {
            return res.status(400).send('Token inválido o expirado');
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualizar la contraseña en la base de datos
        const result = await userController.updatePasswordNew(hashedPassword, user.id);
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: 'Contraseña actualizada correctamente'
        });
        // res.send('Contraseña actualizada correctamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error interno del servidor');
    }
});

usuarioRouter.put('/update-socket-io', async (req, res) => {
    const { id, iduser } = req.body;
    const user = await userController.updateSocketIO(iduser, id)
    if (user === undefined) {
        res.json({
            error: 'Error, registro no encontrado',
            result: 'update error'
        })
    } else {

        return res.status(200).send({
            msg: 'SUCCESSFULLY UPDATE'
        });
    }
})

module.exports = usuarioRouter;