const express = require('express');
const bcrypt = require('bcryptjs');
const isRouter = express.Router();

const isController = require('../models/web_user');
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

isRouter.post('/registro_conductor', async (req, res) => {

    try {
        const { nombre, apellido, telefono, correo, password } = req.body;

        const results = await isUserController.getUserTelfonoEmail(telefono);
        if (results === undefined) {

            const temporaryPassword = generateTemporaryPassword();
            const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

            const result = await isUserController.createUserDriver({
                nombre, apellido, telefono, correo,
                password: hashedPassword
            });

            const permission = await isUserController.agregarRol(result.insertId);

            const transporter = nodemailer.createTransport({
                service: 'smtp.hostinger.com ',
                port: 465, // Puerto seguro (SSL)
                secure: true, // Usar SSL
                auth: {
                    user: process.env.GMAIL_USER, // Tu correo
                    pass: process.env.GMAIL_APP_PASSWORD, // La contraseña específica de la aplicación

                    /* user: 'conductor@unraylatinoamerica.com',
                     pass: 'Ub!3!8!kkPgp',*/
                },
            });

              // Enviar el correo con el enlace de restablecimiento
       // const resetUrl = `https://darkcyan-gazelle-270531.hostingersite.com/reset-password/${_resetToken}`;
        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: email,
          subject: 'Credenciales de Usuario',
          html: `<p>Te enviamos tus datos para que puedas logearte como conductor:</p>
            <ul>
             <li>Contraseña Temporal: ${temporaryPassword} </li>
            </ul>`,
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