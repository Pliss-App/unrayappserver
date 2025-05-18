const express = require('express');
const bcrypt = require('bcryptjs');
const isRouter = express.Router();
const { sendSMS } = require('../utils/sendSMS');
const isController = require('../models/registro');
const userController = require('../models/usuario');
const jwt = require('jsonwebtoken');

const generateTemporaryPassword = () => {
    const length = 4; // Longitud de la contraseña
    const characters = '0123456789'; // Solo números
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }
    return password;
};

isRouter.post('/login-register', async (req, res) => {

    const {
        telefono,
        codigo,
        fecha
    } = req.body;

    // Validar que el teléfono tenga exactamente 8 dígitos numéricos
    if (!/^\d{8}$/.test(telefono)) {
        return res.status(400).json({
            success: false,
            msg: 'Número de teléfono inválido. Debe contener exactamente 8 dígitos (solo números).'
        });
    }



    const idService = 5;
    const codigoVer = generateTemporaryPassword();
    const message = `Tu código de verificación es: ${codigoVer}. No lo compartas con nadie.`;

    try {
        const userExists = await isController.getTelefono(telefono);
        if (userExists == undefined || userExists.length > 0) {
            // const codigo = generateTemporaryPassword();
            const usDet = await userController.updateCodigoVerificacion(telefono, fecha, codigoVer)
            if (usDet === undefined) {
                //  return res.status(400).json({ success: false, msg: 'No se ha podido enviar el código.' })
                return res.status(200).send({
                    success: false,
                    msg: 'No se ha podido enviar el código.'
                });;
            } else {

                try {
                    await sendSMS(`502${telefono}`, message, 'Un Ray');
                    const existingUser = await userController.getLoginTelefono(telefono);

                    if (existingUser === undefined) {
                        res.json('Error, Teléfono no registrados.')
                    } else {

                        var _user = {
                            estado: existingUser.estado, marker: existingUser.marker,
                            foto: existingUser.foto, idUser: existingUser.idUser, idrol: existingUser.idRol,
                            rol: existingUser.rol, nombre: existingUser.nombre,
                            apellido: existingUser.apellido, correo: existingUser.correo,
                            telefono: existingUser.telefono,
                            verificacion: existingUser.verificacion,
                            codigo: existingUser.codigo
                        }
                        const token = jwt.sign({
                            estado: existingUser.estado, marker: existingUser.marker,
                            foto: existingUser.foto, idUser: existingUser.idUser,
                            idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre,
                            apellido: existingUser.apellido, correo: existingUser.correo,
                            telefono: existingUser.telefono,
                            verificacion: existingUser.verificacion,
                            codigo: existingUser.codigo
                        },
                            process.env.JWT_SECRET
                        );




                        return res.status(200).send({
                            msg: 'Logged in!',
                            token,
                            result: true,
                            user: _user
                        });

                    }
                } catch (smsError) {
                    console.error('Error al enviar SMS:', smsError);
                    return res.status(200).json({
                        success: false,
                        msg: 'No se pudo enviar el SMS de verificación. Intenta más tarde.',
                    });
                }
            }
        }

        // Crear usuario
        const nuevoUsuario = {
            nombre: '',
            apellido: '',
            telefono: telefono,
            correo: '',
            password: '',
            codigoVer: codigoVer,
            codigo: null,
            fecha: fecha,
            aceptaTerminos: 1
        };

        const result = await userController.createUser(nuevoUsuario);
        if (result === undefined) {
            return res.status(200).json({
                success: false,
                msg: 'No se pudo registrar el usuario',
            });
        }

        try {
            await sendSMS(`${codigo}${telefono}`, message, 'Un Ray');
        } catch (smsError) {
            console.error('Error al enviar SMS:', smsError);
            return res.status(200).json({
                success: false,
                msg: 'No se pudo enviar el SMS de verificación. Intenta más tarde.',
            });
        }


        await userController.agregarRolUser(result.insertId, idService);
        await userController.registerLocationUser(result.insertId);

        const existingUser = await userController.getLoginTelefono(telefono);

        if (existingUser === undefined) {
            res.json('Error, Correo o telefono no registrados.')
        } else {

            var _user = {
                estado: existingUser.estado, marker: existingUser.marker,
                foto: existingUser.foto, idUser: existingUser.idUser, idrol: existingUser.idRol,
                rol: existingUser.rol, nombre: existingUser.nombre,
                apellido: existingUser.apellido, correo: existingUser.correo,
                telefono: existingUser.telefono,
                verificacion: existingUser.verificacion,
                codigo: existingUser.codigo
            }
            const token = jwt.sign({
                estado: existingUser.estado, marker: existingUser.marker,
                foto: existingUser.foto, idUser: existingUser.idUser,
                idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre,
                apellido: existingUser.apellido, correo: existingUser.correo,
                telefono: existingUser.telefono,
                verificacion: existingUser.verificacion,
                codigo: existingUser.codigo
            },
                process.env.JWT_SECRET
            );


            
            return res.status(200).send({
                msg: 'Logged in!',
                token,
                result: true,
                user: _user
            });

        }

        /*  return res.status(200).json({
              success: true,
              msg: 'Usuario registrado exitosamente. Código de verificación enviado.',
          }); */



    } catch (error) {
        console.error(error);

        return res.status(200).json({
            success: false,
            msg: '',
            error: error
        });

    }

})


isRouter.post('/login-modo', async (req, res) => {
    const { telefono } = req.body;
    if (!telefono) {
        return res.status(400).json({
            success: false,
            message: 'Faltan datos obligatorios Telefono'
        });
    }
    try {

        console.log("USER ", telefono)

        const existingUser = await userController.getLoginTelefono(telefono);

        if (existingUser === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Error, Teléfono no registrados.'
            });
        }

        var _user = {
            estado: existingUser.estado, marker: existingUser.marker,
            foto: existingUser.foto, idUser: existingUser.idUser, idrol: existingUser.idRol,
            rol: existingUser.rol, nombre: existingUser.nombre,
            apellido: existingUser.apellido, correo: existingUser.correo,
            telefono: existingUser.telefono,
            verificacion: existingUser.verificacion,
            codigo: existingUser.codigo
        }
        const token = jwt.sign({
            estado: existingUser.estado, marker: existingUser.marker,
            foto: existingUser.foto, idUser: existingUser.idUser,
            idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre,
            apellido: existingUser.apellido, correo: existingUser.correo,
            telefono: existingUser.telefono,
            verificacion: existingUser.verificacion,
            codigo: existingUser.codigo
        },
            process.env.JWT_SECRET
        );

        return res.status(200).send({
            msg: 'Logged in!',
            token,
            result: true,
            user: _user
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error
        });
    }
})


module.exports = isRouter;