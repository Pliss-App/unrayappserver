const express = require('express');
const bcrypt = require('bcryptjs');
const isRouter = express.Router();
const nodemailer = require('nodemailer');
const isController = require('../models/web_user');
const isUserController = require('../models/usuario');

const generateTemporaryPassword = () => {
    const length = 8; // Longitud de la contraseña
    const characters = '0123456789'; // Solo números
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
            user: process.env.GMAIL_DRIVER, // Tu correo
            pass: process.env.GMAIL_APP_PASSWORD, // La contraseña específica de la aplicación
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_DRIVER,
        to: 'perezlib49@gmail.com',
        subject: 'Credenciales de Usuario',
        html: `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 500px; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin: auto;">
            <h2 style="color: #333;">🔑 Credenciales de Usuario</h2>
            <p style="color: #555; font-size: 16px;">Te enviamos tus datos para que puedas logearte como conductor:</p>
            
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 15px 0; font-size: 18px; font-weight: bold; color: #333;">
                Contraseña Temporal: <span style="color: #007bff;">123232323</span>
            </div>

            <p style="color: #777; font-size: 14px;">Por razones de seguridad, te recomendamos cambiar esta contraseña después de iniciar sesión.</p>

            <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">

            <p style="color: #555; font-size: 14px;">Atentamente,</p>
            <p style="font-size: 16px; font-weight: bold; color: #333;">Equipo de Soporte</p>
            <p style="color: #777; font-size: 13px;">📧 soporteconductor@unraylatinoamerica.com</p>
        </div>
    </div>`,
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
            const usDet = await isUserController.insertLocation(result.insertId);
            const usBillerea = await isUserController.insertBilletera(result.insertId);
            const usVechiculo = await isUserController.insertVehiculo(result.insertId);

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
                subject: 'Credenciales de Usuario | Conductor',
                html: `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 500px; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin: auto;">
            <h2 style="color: #333;">🔑 Credenciales de Usuario</h2>
            <p style="color: #555; font-size: 16px;">Te enviamos tus datos para que puedas logearte como conductor:</p>
            
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 15px 0; font-size: 18px; font-weight: bold; color: #333;">
                Contraseña Temporal: <span style="color: #007bff;">${temporaryPassword}</span>
            </div>

            <p style="color: #777; font-size: 14px;">Por razones de seguridad, te recomendamos cambiar esta contraseña después de iniciar sesión.</p>

            <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">

            <p style="color: #555; font-size: 14px;">Atentamente,</p>
            <p style="font-size: 16px; font-weight: bold; color: #333;">Equipo de Soporte</p>
            <p style="color: #777; font-size: 13px;">📧 soporteconductor@unraylatinoamerica.com</p>
        </div>
    </div>`,
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

isRouter.get('/beneficios/:modulo', async (req, res) => {

    const result = await isController.beneficios(req.params.modulo);
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
})

module.exports = isRouter;