const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require("multer");
const connection = require('../config/conexion');
const isRouter = express.Router();
const nodemailer = require('nodemailer');
const isServicio = require('../models/services')
const isController = require('../models/web_user');
const isUserController = require('../models/usuario');
const isConductorController = require('../models/administracion/conductores')
const { saveBase64File } = require("../utils/saveBase64File");
const storage = require("../config/cloudinaryStorage");
const rateLimit = require('express-rate-limit');
const CryptoJS = require('crypto-js');  // Instalar crypto-js

const SECRET_KEY = process.env.WEB_USER_API_KEY;
// Configuración de rate limiting
const publicLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 minuto
    max: 550,  // máximo 10 peticiones por IP
    message: 'Demasiadas peticiones, inténtalo más tarde.'
});

// Middleware para proteger la ruta con rate limiting
isRouter.use(publicLimiter);

// Middleware de seguridad "oculta"
isRouter.use((req, res, next) => {
    const token = process.env.WEB_USER_API_KEY;
    if (!token) {
        return res.status(500).json({ error: 'Token no encontrado' });
    }
    req.apiKey = token;  // Almacenar la clave en la request
    next();

});


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

const upload = multer({ storage: storage });

isRouter.post("/upload", upload.single("archivo"), async (req, res) => {
    try {
        if (!req.file || !req.file.path) {
            console.error("No se recibió el archivo o no tiene path");
            return res.status(400).json({
                success: false,
                message: "No se subió ningún archivo"
            });
        }


        return res.status(200).json({
            success: true,
            message: "Archivo subido correctamente",
            url: req.file.path, // URL pública (Cloudinary, S3, etc.)
            nombre: req.file.originalname,
            public_id: req.file.filename,
        });

    } catch (error) {
        console.error("Error al subir archivo:", error);

        return res.status(500).json({
            success: false,
            message: "Ocurrió un error al subir el archivo",
            error: error.message, // Esto te mostrará el mensaje específico
        });
    }
});


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
        subject: '✅ Afiliación Iniciada',
        html: `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
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
        const { idservicio, nombre, apellido, telefono, correo, placas, modelo, color } = req.body;

        const idService = 1;

        const results = await isUserController.getUserTelefono(telefono, correo);

        if (results.length > 0 || results === undefined) {

            const conflicto = [];

            results.forEach((row) => {
                if (row.telefono === telefono) conflicto.push('Teléfono');
                if (row.correo === correo.toUpperCase()) conflicto.push('Correo');
            });

            return res.status(200).send({
                success: false,
                msg: `Ya existe un usuario con el mismo ${conflicto.join(' y ')}`
            });
        }

        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        const result = await isUserController.createUserDriver({
            nombre, apellido, telefono, correo,
            password: hashedPassword
        });


        if (result.length > 0 || result === undefined || result === null) {
            return res.status(200).send({
                success: false,
                msg: `No se pudo aplicar la afiliciación, intenta más tarde.`
            });
        }

        const usVechiculo = await isUserController.insertVehiculo(result.insertId);
        const permission = await isUserController.agregarRol(result.insertId, idservicio);
        const usDet = await isUserController.insertLocation(result.insertId);
        const usDire = await isUserController.insertDireccion(result.insertId);
        const usBillerea = await isUserController.insertBilletera(result.insertId);


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
            subject: '✅ Afiliación Completada',
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
        const veh = {
            placas: placas,
            modelo: modelo,
            color: color,
        }

        setTimeout(async () => {
            const vehi = await isConductorController.updateVehiculoId(veh, result.insertId);
        }, 1500)


        return res.status(200).json({ success: true, msg: 'Cuenta Creada', status: 200 });

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
        // Encriptar los datos usando AES (simétrico)
        //const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(result), SECRET_KEY).toString();

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


isRouter.get('/banners', async (req, res) => {

    const result = await isController.banners();
    if (result === undefined) {
        return res.status(200).send({
            success: false,
            msg: 'Erro, durante la operación'
        });
    } else {
        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
            result: result
        });
    }
})

isRouter.get('/banners-identificador=:id', async (req, res) => {

    const result = await isController.bannersId(req.params.id);
    if (result === undefined) {
        return res.status(200).send({
            success: false,
            msg: 'Erro, durante la operación'
        });
    } else {
        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
            result: result
        });
    }
})


isRouter.put('/banners-update', async (req, res) => {
    try {
        //
        const userData = req.body;
        const { id, datos } = userData;

        const result = await isController.actualizarBanner(id, datos);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result
            });
        }
    } catch (error) {
        console.log("ERROR EN ACTUALIZACIÓN")
    }
})

isRouter.post('/insert-pasosrequisitosafiliacion', async (req, res) => {
    const { paso, titulo, descripcion } = req.body;
    console.log(paso, titulo, descripcion)
    try {

        const result = await isController.insertPasosAfiliacion(paso, titulo, descripcion);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result
            });
        }
    } catch (error) {
        console.log("ERROR EN ACTUALIZACIÓN")
    }
})

isRouter.put('/update-pasosrequisitosafiliacion', async (req, res) => {
    const { paso, titulo, descripcion, id } = req.body;
    console.log("DAF ", paso, titulo, descripcion, id)
    try {
        const result = await isController.updatePasosAfiliacion(paso, titulo, descripcion, id);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result
            });
        }
    } catch (error) {
        console.log("ERROR DURANTE LA GESTIÓN")
    }
})

isRouter.get('/obtener-pasosrequisitosafiliacion', async (req, res) => {
    try {

        const result = await isController.getPasosAfiliacion();
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
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

isRouter.get('/servicios', async (req, res) => {
    try {
        const result = await isController.getServices();
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
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

isRouter.put('/update-servicios', async (req, res) => {

    const { descuento, estado, foto, id, nombre, precio, total_costo } = req.body;

    try {
        const result = await isController.updateServicios(nombre, precio, foto, descuento, total_costo, estado, id);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result
            });
        }
    } catch (error) {
        console.log("ERROR DURANTE LA GESTIÓN")
    }
})


isRouter.get('/crearcuenta', async (req, res) => {
    try {
        const result = await isController.getCrearCuenta();
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
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

isRouter.post('/insert-indicacionescuenta', async (req, res) => {
    const { titulo, descripcion, indicaciones, src } = req.body;
    try {
        console.log("E ", titulo, descripcion, indicaciones, src);

        const result = await isController.insertIndicaCuenta(titulo, descripcion, indicaciones, src);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Error, durante la operación'
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

isRouter.get('/obtenerIndicacionesCuenta', async (req, res) => {
    try {
        const result = await isController.getIndicacionesCuenta();
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result[0]
            });
        }
    } catch (error) {
        console.log("ERROR DURANTE LA OPERACIÓN")
    }
})



isRouter.put('/update-indicacionescuenta', async (req, res) => {

    const { titulo, descripcion, indicaciones, src, id } = req.body;

    try {
        const result = await isController.updateIndicacionesCuenta(titulo, descripcion, indicaciones, src, id)
            ;
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
            });
        } else {
            return res.status(200).send({
                success: true,
                msg: 'SUCCESSFULLY',
                result: result
            });
        }
    } catch (error) {
        console.log("ERROR DURANTE LA GESTIÓN")
    }
})

isRouter.get('/obtenerBeneficios/:modulo', async (req, res) => {

    try {
        const result = await isController.getBeneficios(req.params.modulo);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
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

isRouter.put('/updateBeneficios', async (req, res) => {
    const { titulo, descripcion, url, tamanio_columna, id, modulo } = req.body;
    try {
        const result = await isController.updateBeneficios(titulo, descripcion, url, tamanio_columna, id, modulo);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
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

isRouter.post('/insertBeneficios', async (req, res) => {
    const { modulo, titulo, descripcion, url, tamanio_columna } = req.body;
    try {
        const result = await isController.insertBeneficios(modulo, titulo, descripcion, url, tamanio_columna);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
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


isRouter.get('/obtenerSeguridad/:modulo', async (req, res) => {

    try {
        const result = await isController.getSeguridad(req.params.modulo);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
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

isRouter.post('/insertSeguridad', async (req, res) => {
    const { id, modulo, titulo, descripcion, icon, img } = req.body;
    try {
        const result = await isController.insertSeguridad(modulo, titulo, descripcion, icon, img);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
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

isRouter.put('/updateSeguridad', async (req, res) => {
    const { modulo, titulo, descripcion, icon, img, id } = req.body;
    try {
        const result = await isController.updateSeguridad(modulo, titulo, descripcion, icon, img, id);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
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


isRouter.post('/insertInquietud', async (req, res) => {


    const { nombre, correo, telefono, mensaje, fecha, hora } = req.body;
    try {
        const result = await isController.insertInquietud(nombre, correo, telefono, mensaje, fecha, hora);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
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

isRouter.get('/nosotros', async (req, res) => {

    try {
        const result = await isController.getNosotros();
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
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

isRouter.post('/nosotros', async (req, res) => {


    const { titulo, descripcion, url, text_column, url_column } = req.body;
    try {
        const result = await isController.insertNosotros(titulo, descripcion, url, text_column, url_column);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
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

isRouter.put('/updateNosotros', async (req, res) => {
    const { titulo, descripcion, url, text_column, url_column, id } = req.body;
    try {
        const result = await isController.updateNosotros(titulo, descripcion, url, text_column, url_column, id);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
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

isRouter.post('/visitas', async (req, res) => {
    const { session_id,
        ip_address,
        latitud,
        longitud,
        user_agent,
        sistema_operativo,
        navegador,
        dispositivo,
        ultima_visita } = req.body;

    try {
        const existing = await isController.checkExistingVisit(ip_address, user_agent, sistema_operativo, navegador, dispositivo);


        if (existing.length > 0) {
            const cantidad = Number(existing[0].visitas);
            const total = cantidad + 1;
            // Puedes solo registrar una nueva visita vinculada al ID del visitante
            await connection.query("update visitas_web set visitas= ?, latitud=?, longitud=?,  ultima_visita= ? where ip_address = ? and id = ?", [total, latitud,
                longitud, ultima_visita, ip_address, existing[0].id]);
            return res.status(200).send({ msg: "Visitante recurrente registrado" });
        } else {

            // Nuevo visitante
            await isController.insertVisitas(session_id,
                ip_address,
                latitud,
                longitud,
                user_agent,
                sistema_operativo,
                navegador,
                dispositivo,
                ultima_visita);
            res.status(201).send({ msg: "Nuevo visitante registrado" });
        }
    } catch (error) {
        console.error("Error registrando visita:", error);
        res.status(500).send({ error: "Error al registrar la visita" });
    }
});


isRouter.get('/listado-afiliados-conductor', async (req, res) => {

    const result = await isController.getListadoAfiliado();
    if (result === undefined) {

        return res.status(200).send({
            success: false,
            msg: 'Error, no se pudo obtener registros',
        });
    } else {
        // Encriptar los datos usando AES (simétrico)
        //const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(result), SECRET_KEY).toString();

        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
            result: result
        });
    }
})


isRouter.post('/insertInquietud', async (req, res) => {


    const { nombre, correo, telefono, mensaje, fecha, hora } = req.body;
    try {
        const result = await isController.insertInquietud(nombre, correo, telefono, mensaje, fecha, hora);
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
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

isRouter.get('/nosotros', async (req, res) => {

    try {
        const result = await isController.getNosotros();
        if (result === undefined) {
            return res.status(200).send({
                success: false,
                msg: 'Erro, durante la operación'
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


isRouter.post('/add-comunity', async (req, res) => {
    const { correo, telefono, modulo, terminos, fecha } = req.body;
    // Validaciones básicas
    if (!correo || typeof correo !== 'string' || !/.+@.+\..+/.test(correo)) {
        return res.status(400).json({
            success: false,
            msg: 'Correo electrónico inválido o no proporcionado.',
        });
    }

    if (!telefono || typeof telefono !== 'string' || !/^\d{8}$/.test(telefono)) {
        return res.status(400).json({
            success: false,
            msg: 'Teléfono inválido o no proporcionado.',
        });
    }

    try {
        // Validar si ya existe correo o teléfono
        const existing = await isController.getValidaComunity(correo, telefono);

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                msg: 'Ya existe un registro con ese correo o teléfono.',
            });
        }

        // Insertar solo si no existe
        const result = await isController.addComunity(correo, telefono, modulo, terminos, fecha);

        if (!result) {
            return res.status(500).send({
                success: false,
                msg: 'Error, no pudimos guardar tu registro. Intenta más tarde.',
            });
        }

        return res.status(200).send({
            success: true,
            msg: 'SUCCESSFULLY',
        });
    } catch (error) {
        console.error('ERROR DURANTE LA OPERACIÓN', error);
        return res.status(500).send({
            success: false,
            msg: 'Error interno del servidor.',
        });
    }
});

module.exports = isRouter;