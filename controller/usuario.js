const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { uploadImage, uploadDocumentacion } = require('../firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { sendSMS } = require('../utils/sendSMS');
const usuarioRouter = express.Router();
const OneSignal = require('../models/onesignalModel')
const userController = require('../models/usuario');
const condController = require('../models/conductor')
const connection = require('../config/conexion');
const { enviarCorreoRegistroUsuario } = require('../utils/emailService')
const multer = require('multer')


// Middleware para manejar Base64
const handleBase64Image = (req, res, next) => {
    if (req.body.image) {
        // Si la imagen es Base64, crear un archivo temporal
        const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, ''); // Limpiar Base64
        const buffer = Buffer.from(base64Data, 'base64');

        // Crear un archivo temporal para cargarlo a Firebase
        const tempFilePath = './tempImage.jpg';  // Archivo temporal
        fs.writeFileSync(tempFilePath, buffer);

        // Asignar el archivo a req.file para que el siguiente middleware lo maneje
        req.file = {
            path: tempFilePath,
            originalname: 'tempImage.jpg', // Nombre temporal
            mimetype: 'image/jpeg', // Tipo de imagen, ajusta según el formato
        };
        next();
    } else {
        next(); // Si no es Base64, pasamos a multer para manejar la carga de archivos
    }
};

const mul = multer({
    storage: multer.memoryStorage(),
    limits: 1024 * 1024
})


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

usuarioRouter.post('/upload_profile', uploadImage, async (req, res) => {


    const url = {
        url: req.file.firebaseUrl,
        id: req.body.id_photo,
    }

    res.status(200).json({
        success: true,
        message: 'IMAGE UPLOADED SUCCESSFULLY',
        data: url
    })
})


usuarioRouter.post('/upload_documentacion', uploadDocumentacion, async (req, res) => {
    const url = {
        url: req.file.firebaseUrl,
        id: req.body.id_photo,
    }

    res.status(200).json({
        success: true,
        message: 'IMAGE UPLOADED SUCCESSFULLY',
        data: url
    })
})


usuarioRouter.post('/registro', async (req, res) => {
    const {
        nombre, apellido, telefono, correo, codigoPais,
        password, tieneCodigoReferido, codigo, fecha, aceptaTerminos
    } = req.body;

    const idService = 5;
    const codigoVer = generateTemporaryPassword();
    const message = `Tu código de verificación es: ${codigoVer}. No lo compartas con nadie.`;

    try {
        const userExists = await userController.getUserTelfonoEmail(telefono);

        if (userExists) {
            return res.status(200).json({
                success: false,
                msg: 'Teléfono o correo ya están registrados.',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const nuevoUsuario = {
            nombre,
            apellido,
            telefono,
            correo,
            password: hashedPassword,
            codigoVer,
            codigo: codigo ? codigo : null,
            fecha: fecha,
            aceptaTerminos: aceptaTerminos ? 1 : 0
        };

        const result = await userController.createUser(nuevoUsuario);

        if (result === undefined) {
            return res.status(200).json({
                success: false,
                msg: 'No se pudo registrar el usuario',
            });
        }

        // Enviar SM
        try {
            await sendSMS(`${codigoPais}${telefono}`, message, 'Un Ray');
        } catch (smsError) {
            console.error('Error al enviar SMS:', smsError);
            return res.status(200).json({
                success: false,
                msg: 'No se pudo enviar el SMS de verificación. Intenta más tarde.',
            });
        }

        // Si hay código de referido válido
        if (tieneCodigoReferido && codigo) {
            await userController.insertDetalleReferido(codigo, result.insertId, fecha);
        }

        await userController.agregarRolUser(result.insertId, idService);
        await userController.registerLocationUser(result.insertId);

        return res.status(200).json({
            success: true,
            msg: 'Usuario registrado exitosamente. Código de verificación enviado.',
        });

    } catch (error) {
        console.error('Error durante el registro:', error);

        let msg = 'Error desconocido.';
        if (error.code) {
            switch (error.code) {
                case 'ER_NO_SUCH_TABLE': msg = 'Tabla no encontrada.'; break;
                case 'ER_DUP_ENTRY': msg = 'Correo o teléfono ya existen.'; break;
                case 'ER_BAD_FIELD_ERROR': msg = 'Campo inválido en la consulta.'; break;
                case 'ER_NO_REFERENCED_ROW':
                case 'ER_ROW_IS_REFERENCED': msg = 'Violación de llave foránea.'; break;
                case 'ER_DATA_TOO_LONG': msg = 'Uno de los campos supera la longitud permitida.'; break;
                default: msg = error.sqlMessage || error.message;
            }
        }

        return res.status(200).json({
            success: false,
            error: msg,
            msg,
        });
    }
});


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


usuarioRouter.put('/verificar-cuenta', async (req, res) => {
    const { id, verificationCode } = req.body;
    const result = await userController.verificarCuenta(id, verificationCode)
    if (result === undefined || result == null) {
        return res.status(200).send({
            success: false,
            msg: 'Código no valido.',

        });
    } else {

        const verifi = await userController.actualizarVerificacionCuenta(id);
        if (verifi === undefined) {
        } else {
            const existingUser = await userController.refreshLogin(id);
            var _user = {
                foto: existingUser.foto, marker: existingUser.marker, idUser: existingUser.idUser, idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre, apellido: existingUser.apellido, correo: existingUser.correo, telefono: existingUser.telefono, verificacion: existingUser.verificacion, codigo: existingUser.codigo
            }

            const token = jwt.sign({
                foto: existingUser.foto, marker: existingUser.marker, idUser: existingUser.idUser, idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre, apellido: existingUser.apellido, correo: existingUser.correo, telefono: existingUser.telefono, verificacion: existingUser.verificacion, codigo: existingUser.codigo
            },
                process.env.JWT_SECRET, {
            }
            );
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                token,
                result: true,
                user: _user
            });
        }

    }
})

usuarioRouter.get('/linkapp', async (req, res) => {
    const result = await userController.linkDescargaApp()
    if (result === undefined) {
        return res.status(200).send({
            success: false,
            msg: 'Error: No se pudo obtener el link de descarga',

        });
    } else {
        return res.status(200).send({
            success: true,
            msg: 'Satisfactorio',
            result: result[0]
        });
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

usuarioRouter.put('/eliminar-cuenta', async (req, res) => {
    const { id } = req.body;
    try {
        const result = await userController.eliminarCuenta(id);

        if (!result) {
            return res.status(400).json({  // Código 400 = Solicitud incorrecta
                success: false,
                msg: 'No se pudo eliminar la cuenta. Verifique el ID.',
            });
        }

        return res.status(200).json({
            success: true,
            msg: 'Cuenta eliminada correctamente',
        });
    } catch (error) {
        console.error('Error en la base de datos:', error);

        // Verifica si el error es de MySQL
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({
                success: false,
                msg: 'Error interno: La tabla no existe.',
                error: error.message
            });
        } else if (error.code === 'ER_BAD_FIELD_ERROR') {
            return res.status(500).json({
                success: false,
                msg: 'Error en la consulta: Campo desconocido.',
                error: error.message
            });
        } else if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                msg: 'Error: Registro duplicado.',
                error: error.message
            });
        } else {
            return res.status(500).json({
                success: false,
                msg: 'Error en el servidor.',
                error: error.message
            });
        }
    }
});


usuarioRouter.post('/insertnotasoporteusuario', async (req, res) => {
    const { idUser, titulo, mensaje } = req.body;

    try {
        const result = await userController.insertNotaSoporte(idUser, titulo, mensaje)
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'falled',

            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
            });
        }
    } catch (error) {
        return res.status(200).send({
            success: false,
            msg: 'Error',
            error: error

        });
    }

})

usuarioRouter.get('/rating/:id', async (req, res) => {
    const result = await userController.getRating(req.params.id)
    if (result === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: result
        });
    }
})


usuarioRouter.get('/estado/:id', async (req, res) => {
    const getUserby = await userController.getEstado(req.params.id)
    if (getUserby === undefined) {
        res.json({
            error: 'Error, Datos no encontrados'
        })
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: getUserby
        });
    }
})

usuarioRouter.put('/update-estado/:id', async (req, res) => {
    const { id, estado } = req.body;
    const result = await userController.updateEstado(id, estado)
    if (result === undefined) {
        return res.status(200).send({
            msg: 'Error al actualizar',
            result: false
        });
    } else {
        return res.status(200).send({
            msg: 'SUCCESSFULLY',
            result: result
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
                foto: existingUser.foto, marker: existingUser.marker, idUser: existingUser.idUser, idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre, apellido: existingUser.apellido, correo: existingUser.correo, telefono: existingUser.telefono, verificacion: existingUser.verificacion, codigo: existingUser.codigo
            }

            const token = jwt.sign({
                foto: existingUser.foto, marker: existingUser.marker, idUser: existingUser.idUser, idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre, apellido: existingUser.apellido, correo: existingUser.correo, telefono: existingUser.telefono, verificacion: existingUser.verificacion, codigo: existingUser.codigo
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
            foto: existingUser.foto, marker: existingUser.marker, idUser: existingUser.idUser, idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre, apellido: existingUser.apellido, correo: existingUser.correo, telefono: existingUser.telefono, verificacion: existingUser.verificacion, codigo: existingUser.codigo
        }

        const token = jwt.sign({
            foto: existingUser.foto, marker: existingUser.marker, idUser: existingUser.idUser, idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre, apellido: existingUser.apellido, correo: existingUser.correo, telefono: existingUser.telefono, verificacion: existingUser.verificacion, codigo: existingUser.codigo
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

usuarioRouter.get('/preguntasfrecuentes/:rol', async (req, res) => {
    const result = await userController.preguntasFrecuentes(req.params.rol)
    if (result === undefined) {
        return res.status(200).send({
            success: false,
            msg: 'Error, al recuperar datos.',
        });
    } else {
        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
            result: result
        });
    }
})

usuarioRouter.post('/insert-problema-sugerencia', async (req, res) => {
    const { idUser, tipo, descripcion, imagen } = req.body;
    try {
        const user = await userController.insertProblemasSugerencia(idUser, tipo, descripcion, imagen);
        if (user === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Error, no se pudo insertar',
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
            });
        }
    } catch (error) {
        return res.status(200).send({
            success: false,
            msg: error
        });
    }
})


usuarioRouter.post('/recover', async (req, res) => {
    const { user } = req.body;
    try {

        const results = await userController.getRecuperarPassword(user);
        if (results === undefined || results === null) {
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
                    user: process.env.GMAIL_DRIVER, // Tu correo
                    pass: process.env.GMAIL_APP_PASSWORD, // La contraseña específica de la aplicación
                },
            });

            // Enviar correo
            const resetUrl = `https://unraylatinoamerica.com/reset-password?token=${token}`;
            const mailOptions = {
                from: process.env.GMAIL_DRIVER,
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

usuarioRouter.get('/notificaciones/:id', async (req, res) => {
    try {

        // Llamar al controlador para obtener los datos de la billetera
        const result = await OneSignal.getNotificacionesUser(req.params.id)

        // Verificar si se encontró el usuario o devolver saldo 0
        if (!result || Object.keys(result).length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'No existen registros',
            });
        }

        // Si existe el registro, devolverlo
        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
            result: result
        });
    } catch (error) {
        console.error(error);
        // Manejar errores
        return res.status(500).send({
            error: 'Internal Server Error'
        });
    }
})

usuarioRouter.put('/update-notificaciones', async (req, res) => {
    try {
        const { id, idVista, fecha } = req.body;

        console.log("DTO  ", id, idVista, fecha)
        // Llamar al controlador para obtener los datos de la billetera
        const result = await OneSignal.updateNotificacionesUser(id, idVista, fecha)
        // Verificar si se encontró el usuario o devolver saldo 0
        if (!result || Object.keys(result).length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'No existen registros',
            });
        }

        // Si existe el registro, devolverlo
        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
        });
    } catch (error) {
        console.error(error);
        // Manejar errores
        return res.status(500).send({
            error: 'Internal Server Error'
        });
    }
})



usuarioRouter.delete('/delete-mensaje/:id', async (req, res) => {
    try {

        const usDet = await userController.deleteMensaje(req.params.id)
        if (usDet === undefined) {
            res.json({
                error: 'Error, Datos no encontrados'
            })
        } else {
            return res.status(200).send({
                msg: 'DELETE SUCCESSFULLY',
            });
        }
    } catch (error) {
        console.error(error);

    }
})


usuarioRouter.post('/verificacion-cuenta', async (req, res) => {
    const { telefono, codigoIngreso } = req.body;

    try {
        const usuario = await userController.verificacion(telefono);
        if (usuario === undefined) {

            return res.status(200).send({
                success: false,
                msg: 'Teléfono no registrado.'
            });
        } else {

            /*const tiempoExpirado = Date.now() - new Date(usuario[0].codigoVerTimestamp).getTime() > 9 * 60 * 1000;
            if (tiempoExpirado) {
                //  return res.status(400).json({ success: false, msg: 'El código ha expirado.' });

                return res.status(200).send({
                    success: false,
                    msg: 'El código ha expirado.'
                });
            }*/
            let codigo = codigoIngreso;

            if (usuario[0].codigo_verificacion === codigo) {
                await userController.verificacionCuentaTelefono(telefono);

                const existingUser = await userController.refreshLoginTelefono(telefono);
                var _user = {
                    foto: existingUser.foto, marker: existingUser.marker, idUser: existingUser.idUser, idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre, apellido: existingUser.apellido, correo: existingUser.correo, telefono: existingUser.telefono, verificacion: existingUser.verificacion, codigo: existingUser.codigo
                }

                const token = jwt.sign({
                    foto: existingUser.foto, marker: existingUser.marker, idUser: existingUser.idUser, idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre, apellido: existingUser.apellido, correo: existingUser.correo, telefono: existingUser.telefono, verificacion: existingUser.verificacion, codigo: existingUser.codigo
                },
                    process.env.JWT_SECRET, {
                });


                await userController.estadoVerificacion(telefono);
                
                return res.status(200).send({
                    success: true,
                    msg: 'Cuenta verificada correctamente.',
                    token,
                    result: true,
                    user: _user
                });
            } else {

                return res.status(200).send({
                    success: false,
                    msg: 'Código incorrecto.'
                });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(200).send({
            success: false,
            msg: error,
        });
    }
})

usuarioRouter.put('/update-codigo-verificacion', async (req, res) => {
    const { telefono, fecha } = req.body;
    try {

        const codigo = generateTemporaryPassword();
        const message = `Tu código de verificación es: ${codigo}. No lo compartas con nadie.`;

        const usDet = await userController.updateCodigoVerificacion(telefono, fecha, codigo)
        if (usDet === undefined) {
            //  return res.status(400).json({ success: false, msg: 'No se ha podido enviar el código.' })
            return res.status(200).send({
                success: false,
                msg: 'No se ha podido enviar el código.'
            });;
        } else {

            try {
                await sendSMS(`502${telefono}`, message, 'Un Ray');
                return res.status(200).send({
                    success: true,
                    msg: 'Código enviado satisfactoriamente.',
                });
            } catch (smsError) {
                console.error('Error al enviar SMS:', smsError);
                return res.status(200).json({
                    success: false,
                    msg: 'No se pudo enviar el SMS de verificación. Intenta más tarde.',
                });
            }

        }
    } catch (error) {
        console.error(error);

    }
})


usuarioRouter.put('/logout', async (req, res) => {
    try {
        const { telefono } = req.body;
        // Llamar al controlador para obtener los datos de la billetera
        const result = await userController.estadoVerificacion(telefono);
        // Verificar si se encontró el usuario o devolver saldo 0
        if (!result || Object.keys(result).length === 0) {
            return res.status(200).send({
                success: false,
                msg: 'No existen registros',
            });
        }

        // Si existe el registro, devolverlo
        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
        });
    } catch (error) {
        console.error(error);
        // Manejar errores
        return res.status(500).send({
            error: 'Internal Server Error'
        });
    }
})


usuarioRouter.put('/update-nombre-apellido', async (req, res) => {
    const { id, telefono, nombre, apellido } = req.body;

    try {
        const usuario = await userController.updateNombreApellido(id, telefono, nombre, apellido);
        if (usuario === undefined) {

            return res.status(200).send({
                success: false,
                msg: 'Teléfono no registrado.'
            });
        } else {
            const existingUser = await userController.refreshLoginTelefono(telefono);
            var _user = {
                foto: existingUser.foto, marker: existingUser.marker, idUser: existingUser.idUser, idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre, apellido: existingUser.apellido, correo: existingUser.correo, telefono: existingUser.telefono, verificacion: existingUser.verificacion, codigo: existingUser.codigo
            }

            const token = jwt.sign({
                foto: existingUser.foto, marker: existingUser.marker, idUser: existingUser.idUser, idrol: existingUser.idRol, rol: existingUser.rol, nombre: existingUser.nombre, apellido: existingUser.apellido, correo: existingUser.correo, telefono: existingUser.telefono, verificacion: existingUser.verificacion, codigo: existingUser.codigo
            },
                process.env.JWT_SECRET, {
            });
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                token,
                result: true,
                user: _user
            });

        }
    } catch (error) {
        console.error(error);
        return res.status(200).send({
            success: false,
            msg: error,
        });
    }
})


usuarioRouter.post('/insertar-referido', async (req, res) => {
    const { codigo, idUser, fecha, hora, razonreferencia } = req.body;

    try {
        const result = await userController.getValidarExistenciaCodigo(codigo);
        if (!result || result.length === 0) {
            return res.status(200).send({
                msg: 'El código de referido ingresado no existe.',
                success: false
            });
        }

        const user = await userController.insertDetalleReferido(codigo, idUser, fecha, hora, razonreferencia);
        if (user === undefined) {
            return res.status(200).send({
                msg: 'No se pudo agregar el código de referido. Intenta más tarde.',
                success: false
            });
        }
        return res.status(200).send({
            msg: '¡Felicidades, hemos agregado el código de referido.',
            success: true
        });
        // res.send('Contraseña actualizada correctamente');
    } catch (err) {
        console.error(err);
        return res.status(200).send({
            msg: 'Error, ocurrio un error en el servidor. Intenta más tarde.',
            success: false
        });
    }
});



usuarioRouter.get('/get-referido/:id', async (req, res) => {

    try {
        const user = await userController.getDetalleReferido(req.params.id);
        if (!user || user.length === 0) {
            return res.status(200).send({
                msg: 'Usuario no ha referido',
                success: false
            });
        }
        return res.status(200).send({
            msg: 'Usuario ya refirio.',
            success: true,
            result: user[0]
        });
        // res.send('Contraseña actualizada correctamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error interno del servidor');
    }
});

usuarioRouter.post('/insert-afiliacion', async (req, res) => {
    const { idUser, documentacion, fecha, idservicio } = req.body;
    console.log("ID USER ", idUser, documentacion, fecha)
    // Validar los datos requeridos
    if (!idUser || !documentacion || !fecha) {
        return res.status(400).json({
            success: false,
            message: 'Faltan datos obligatorios (idUser, documentacion o fecha).'
        });
    }

    try {
        const result = await condController.insertAfiliacion(idUser, documentacion, fecha, idservicio)
        if (!result || result.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                message: 'No se pudo insertar la afiliación. Intenta de nuevo.'
            });
        }

        // const usDire = await userController.insertDireccion(result.insertId);
        // const usBillerea = await userController.insertBilletera(result.insertId);
        //  const usVechiculo = await userController.insertVehiculo(result.insertId);

        const create = await condController.recargarBilletera(idUser, 'BONO01BI', '50', 'https://firebasestorage.googleapis.com/v0/b/un-ray-app-a606c/o/BONOS%2FBONOBIENVENIDA.jpg?alt=media&token=a5a68dd5-9f25-493e-aff5-82fef5586d4d');
        if (create === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Error'
            });
        } else {
            const insert = await condController.insertMoviBilletera(idUser, '50', 'Bono de Bienvenida.', 'crédito');
            if (insert === undefined) {
                return res.status(200).send({
                    success: false,
                    msg: 'Error'
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: 'Afiliación insertada correctamente',
                    result
                });
            }

        }


        /*      res.status(201).json({
                  success: true,
                  message: 'Afiliación insertada correctamente',
                  result
              }); */
    } catch (error) {
        console.error('Error al insertar afiliación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al insertar afiliación',
            error: error.message
        });
    }

})


usuarioRouter.get('/servicios', async (req, res) => {
    try {
        const result = await userController.getServices();
        if (result === undefined) {
            return res.status(400).json({
                success: false,
                message: 'No existen registros.'
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result
            });
        }
    } catch (error) {
        console.log("ERROR DURANTE LA OPERACIÓN")
    }
})


usuarioRouter.put('/update-rol', async (req, res) => {
    const { idUser, rol, idService } = req.body;

    if (!idUser || !rol || !idService) {
        return res.status(400).json({
            success: false,
            message: 'No se ha brindado correctamente los parametros necesarios.'
        });
    }

    try {
        const result = await userController.updateRol(idUser, rol, idService);
        if (result === undefined) {
            return res.status(400).json({
                success: false,
                message: 'No existen registros.'
            });
        }

        return res.status(200).send({
            success: true,
            msg: 'Actualizado Correctamente',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        });
    }
})


usuarioRouter.post('/login-modo-conductor', async (req, res) => {
    const { idUser, telefono } = req.body;
    console.log("Modoc ", idUser, telefono)

    if (!telefono || !idUser) {
        return res.status(400).json({
            success: false,
            message: 'No se ha brindado correctamente los parámetros necesarios.'
        });
    }


    try {
        const result = await userController.getDocumentacionAfiliacion(idUser);

        if (result.length == 0 || result == undefined) {
            return res.status(400).json({
                success: false,
                message: 'No se encuentra afiliado a este servicio. Crea tu cuenta primero para poder disfrutar de los beneficios como conductor.'
            });
        }


        return res.status(200).send({
            success: true,
            msg: 'Actualizado Correctamente',
            result: result[0]
        });



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        });
    }
})


module.exports = usuarioRouter;