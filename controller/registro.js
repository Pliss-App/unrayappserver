const express = require('express');
const bcrypt = require('bcryptjs');
const isRouter = express.Router();
const { sendSMS, enviarSMSBrevo, enviarWhatBrevo } = require('../utils/sendSMS');
const isController = require('../models/registro');
const OneSignal = require('../models/onesignalModel')
const isAdmin = require('../models/administracion/usuarios')
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
    const message = `UNRAY: Tu codigo es ${codigoVer} No lo compartas con nadie`;

    try {
        const userExists = await isController.getTelefono(telefono);
        if (userExists.length > 0) {
            // const codigo = generateTemporaryPassword();
            const usDet = await userController.updateCodigoVerificacion(telefono, fecha, codigoVer);

            // Si no se pudo actualizar el código, salir inmediatamente
            if (!usDet || usDet === undefined) {
                return res.status(200).send({
                    success: false,
                    msg: 'No se ha podido enviar el código.'
                });
            }

            try {
              //  sendSMS(`502${telefono}`, message, 'UnRay');
                const existingUser = await userController.getLoginTelefono(telefono);
                console.log("DATOS DEL USUARIO ", existingUser)
                if (existingUser === undefined) {
                    res.json('Error, Teléfono no registrados.')
                } else {

                    var _user = {
                        estado: existingUser.estado, marker: existingUser.marker,
                        foto: existingUser.foto, idUser: existingUser.idUser, idrol: existingUser.idRol,
                        rol: existingUser.rol, nombre: existingUser.nombre,
                        apellido: existingUser.apellido, correo: existingUser.correo,
                        telefono: existingUser.telefono,
                        verificacion: 1,
                        codigo: existingUser.codigo
                    }
                    const token = jwt.sign({
                        estado: existingUser.estado, marker: existingUser.marker,
                        foto: existingUser.foto, idUser: existingUser.idUser,
                        idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre,
                        apellido: existingUser.apellido, correo: existingUser.correo,
                        telefono: existingUser.telefono,
                        verificacion: 1,
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

    /*    try {
            sendSMS(`${codigo}${telefono}`, message, 'UnRay');
            //   await enviarWhatBrevo(`502${telefono}`, codigoVer);
        } catch (smsError) {
            console.error('Error al enviar SMS:', smsError);
            return res.status(200).json({
                success: false,
                msg: 'No se pudo enviar el SMS de verificación. Intenta más tarde.',
            });
        }

   */
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
                verificacion: 1,
                codigo: existingUser.codigo
            }
            const token = jwt.sign({
                estado: existingUser.estado, marker: existingUser.marker,
                foto: existingUser.foto, idUser: existingUser.idUser,
                idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre,
                apellido: existingUser.apellido, correo: existingUser.correo,
                telefono: existingUser.telefono,
                verificacion: 1,
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


isRouter.post('/login-modo-conductor', async (req, res) => {
    const { telefono, idUser, placas, modelo, color, servicio, correo, fecha, tipo } = req.body;
    if (!idUser || !placas || !servicio || !telefono || !tipo) {
        return res.status(400).json({
            success: false,
            message: 'Faltan datos obligatorios'
        });
    }

    if (tipo == "serconductor") {
        try {
            const vehiculos = await userController.getVehiculo(idUser);

            if (vehiculos.length > 0) {
                return res.status(200).json({
                    success: false,
                    mensaje: 'Ya se encuentra un registro con este usuario. Inicia sesión en la opción anterior.',
                    //  data: vehiculos
                });
            } else {

                const resultado = await userController.ejecutarTransicionConductor(idUser, fecha, placas, modelo, color, servicio, correo);
                if (!resultado || resultado.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'No se obtuvo respuesta del procedimiento',
                    });
                }

                const transporter = nodemailer.createTransport({
                    host: 'smtp.hostinger.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.GMAIL_DRIVER, // Tu correo
                        pass: process.env.GMAIL_APP_PASSWORD, // La contraseña específica de la aplicación
                    },
                });
                // Enviar el correo con el enlace de restablecimiento
                // const resetUrl = `https://darkcyan-gazelle-270531.hostingersite.com/reset-password/${_resetToken}`;
                const mailOptions = {
                    from: process.env.GMAIL_DRIVER,
                    to: correo,
                    subject: '✅ Afiliación Iniciada',
                    html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 500px; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin: auto;">
            <h2 style="color: #333;">👋 ¡Bienvenido a bordo!</h2>
            <p style="text-align: left; color: #555; font-size: 16px;">Nos alegra tenerte como nuevo afiliado conductor. Has dado el primer paso al crear tu cuenta, y eso ya te acerca a nuevas oportunidades de crecimiento e ingresos.</p>
        

            <p style=" text-align: left; color: #555; font-size: 16px;">✅ Muy pronto, nuestro equipo se estará comunicando contigo para completar el proceso de afiliación y brindarte toda la información que necesitas para comenzar a conducir con nosotros.</p>
   <p style=" text-align: left; color: #555; font-size: 16px;">Gracias por confiar en nosotros. Estamos emocionados de que formes parte de esta comunidad comprometida con el servicio, la seguridad y la excelencia.</p>


       <p style="text-align: left;  color: #555; font-size: 16px;">¡Nos vemos en el camino!</p>
         
            <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">

            <p style="color: #555; font-size: 14px;">Atentamente,</p>
            <p style="font-size: 16px; font-weight: bold; color: #333;">Equipo de Soporte</p>
            <p style="color: #777; font-size: 13px;">📧 soporteconductor@unraylatinoamerica.com</p>
        </div>
    </div>`,
                };

                await transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return res.status(500).send(error.toString());
                    }

                    res.status(200).send('Correo enviado: ' + info.response);
                });

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
                        message: 'Logged in!',
                        token,
                        success: true,
                        user: _user
                    });

                }
            }
        } catch (error) {
            console.error('Error al verificar o registrar vehículo:', error);
            return res.status(500).json({
                success: false,
                mensaje: '❌ Error interno al procesar el vehículo.'
            });
        }
    }
})


isRouter.post('/login-modo-user-conductor', async (req, res) => {

    const {idservicio, telefono, idUser } = req.body;
    if (!idUser || !telefono) {
        return res.status(400).json({
            success: false,
            message: 'Faltan datos obligatorios'
        });
    }

    try {
        const vehiculos = await userController.getVehiculoModo(idUser, idservicio);

        if (vehiculos.length > 0) {
            const servicioExiste = await userController.verificarServicioExiste(vehiculos[0].idservicio);

            if (!servicioExiste) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'El servicio proporcionado no existe.'
                });
            }

            const update = await userController.updateRolTransicion(idUser, vehiculos[0].idservicio);
            if (update.affectedRows === 0) {
                // ⚠️ No hubo actualización (quizás idUser no existe)
                return res.status(404).json({
                    success: false,
                    mensaje: 'No se actualizó ningún registro.'
                });
            }

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
                    verificacion: 1,
                    codigo: existingUser.codigo
                }
                const token = jwt.sign({
                    estado: existingUser.estado, marker: existingUser.marker,
                    foto: existingUser.foto, idUser: existingUser.idUser,
                    idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre,
                    apellido: existingUser.apellido, correo: existingUser.correo,
                    telefono: existingUser.telefono,
                    verificacion: 1,
                    codigo: existingUser.codigo
                },
                    process.env.JWT_SECRET
                );

                return res.status(200).send({
                    message: 'Logged in!',
                    token,
                    success: true,
                    user: _user
                });
            }

        } else {
            return res.status(200).json({
                success: false,
                mensaje: 'Aún no formas parte de la comunidad de conductores.',
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            mensaje: 'Error interno en el servidor. Intenta más tarde.',
        });

    }

})

module.exports = isRouter;