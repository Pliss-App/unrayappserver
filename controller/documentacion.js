const express = require('express');
const bcrypt = require('bcryptjs');
const isRouter = express.Router();
const nodemailer = require('nodemailer');
const isController = require('../models/documentacion');
const isUserController = require('../models/usuario');

const generateTemporaryPassword = () => {
    const length = 8; // Longitud de la contraseña
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }
    return password;
};

isRouter.post('/pruebas', async (req, res) => {

    const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL_USER, // Tu correo
            pass: process.env.GMAIL_APP_PASSWORD, // La contraseña específica de la aplicación
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: 'perezlib49@gmail.com',
        subject: 'Credenciales de Usuario',
        html: `<p>Te enviamos tus datos para que puedas logearte como conductor:</p>
    <ul>
     <li>Contraseña Temporal: 123232323</li>
    </ul>`,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("EERO ", error)
            return res.status(500).send(error.toString());
        }

        res.status(200).send('Correo enviado: ' + info.response);
    });

    // return res.status(200).json({ msg: 'Cuenta Creada', status: 200 });

}
)

isRouter.post('/registro_conductor', async (req, res) => {

    try {
        const { idservicio, nombre, apellido, telefono, correo } = req.body;
        const idService = 1;

        const results = await isUserController.getUserTelfonoEmail(telefono);
        if (results === undefined) {

            const temporaryPassword = generateTemporaryPassword();
            const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

            const result = await isUserController.createUserDriver({
                nombre, apellido, telefono, correo,
                password: hashedPassword
            });

            const permission = await isUserController.agregarRol(result.insertId, idservicio);

            const transporter = nodemailer.createTransport({
                host: 'smtp.hostinger.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.GMAIL_USER, // Tu correo
                    pass: process.env.GMAIL_APP_PASSWORD, // La contraseña específica de la aplicación
                },
            });

            // Enviar el correo con el enlace de restablecimiento
            // const resetUrl = `https://darkcyan-gazelle-270531.hostingersite.com/reset-password/${_resetToken}`;
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: correo,
                subject: 'Credenciales de Usuario',
                html: `<p>Te enviamos tus datos para que puedas logearte como conductor:</p>
            <ul>
             <li>Contraseña Temporal: <b> ${temporaryPassword} </b> </li>
            </ul>
            <p></p>
            `,
            };

            await transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("EERO ", error)
                    return res.status(500).send(error.toString());
                }

                res.status(200).send('Correo enviado: ' + info.response);
            });

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

isRouter.get('/requisitos', async (req, res) => {

    const result = await isController.documentacion();
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

isRouter.post('/insert', async (req, res) => {
    try {
        //
        const userData = req.body;
        const { idUser } = userData;
        const {
            dpi_frontal,
            dpi_inverso,
            permiso_conducir,
            licencia_frontal,
            licencia_inverso,
            tarjeta_frontal,
            tarjeta_inverso,
            penales,
            policiales,
            nombrereferencia1,
            parentescoreferencia1,
            contactoreferencia1,
            nombrereferencia2,
            parentescoreferencia2,
            contactoreferencia2,
            servicio,
            rostrodpi,
            perfil,
            vehiculo_frontal,
            vehiculo_atras } = userData.documentacion;
        //console.log(" data ", dpi_frontal, req.body)
        const result = await isController.insert(
            idUser,
            dpi_frontal,
            dpi_inverso,
            permiso_conducir,
            licencia_frontal,
            licencia_inverso,
            tarjeta_frontal,
            tarjeta_inverso,
            penales,
            policiales,
            nombrereferencia1,
            parentescoreferencia1,
            contactoreferencia1,
            nombrereferencia2,
            parentescoreferencia2,
            contactoreferencia2,
            servicio,
            rostrodpi,
            perfil,
            vehiculo_frontal,
            vehiculo_atras);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Error, No se pudo guardar el documento.',
                message: 'Error, No se pudo guardar el documento.'
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                message: 'Documentación enviada correctamente.',
                result: result
            });
        }

    } catch (error) {
        console.error(error)
    }
})

isRouter.get('/nosotros', async (req, res) => {

    const result = await isController.nosotros();
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

/*
isRouter.get('/requisitos', async (req, res) => {

    const result = await isController.requisitos();
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
}) */

module.exports = isRouter;