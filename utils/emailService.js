const nodemailer = require("nodemailer");

// Configurar el transporter fuera de la función para reutilizarlo
const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_DRIVER, // Tu correo
        pass: process.env.GMAIL_APP_PASSWORD, // La contraseña específica de la aplicación
    },
});

/**
 * Función para enviar un correo con credenciales de usuario.
 * @param {string} correo - Correo del destinatario.
 * @param {string} temporaryPassword - Contraseña temporal.
 * @returns {Promise} Promesa que resuelve si el correo fue enviado correctamente.
 */
const enviarCorreoCredenciales = async (correo, temporaryPassword) => {
    const mailOptions = {
        from: process.env.GMAIL_DRIVER,
        to: correo,
        subject: "Credenciales de Usuario | Conductor",
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

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error al enviar correo:", error);
                reject(error);
            } else {
                console.log("Correo enviado:", info.response);
                resolve(info);
            }
        });
    });
};

// ### CORREO PARA ACTIVACIÓN DE CUENTA CONDUCTOR 
const enviarCorreoActivacion = async (correo, nombre) => {
    const mailOptions = {
        from: process.env.GMAIL_DRIVER,
        to: correo,
        subject: "ACTIVACIÓN CUENTA",
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 500px; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin: auto;">
                    <h2 style="color: #333;">🔓 Activación de Cuenta Conductor</h2>
                         <p style="color: #555; font-size: 16px;">Hola ${nombre},</p>

                    <p style="color: #555; font-size: 16px;">Queremos notificarte que tu cuenta Conductor como Un Ray ha sido activada satisfacroriamente. Puedes empezar a recibir viajes y generar ganancias</p>

                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 15px 0; font-size: 18px; font-weight: bold; color: #333;">
                        <span style="color: #007bff;">¡BIENVENIDO A LA FAMILIA UN RAY CONDUCTOR!</span>
                    </div>

                    <p style="color: #777; font-size: 14px;">Por seguridad no respondas a este correo ya que fue enviado de manera automática.</p>

                    <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">

                    <p style="color: #555; font-size: 14px;">Atentamente,</p>
                    <p style="font-size: 16px; font-weight: bold; color: #333;">Equipo de Soporte</p>
                    <p style="color: #777; font-size: 13px;">📧 soporteconductor@unraylatinoamerica.com</p>
                </div>
            </div>`,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error al enviar correo:", error);
                reject(error);
            } else {
                console.log("Correo enviado:", info.response);
                resolve(info);
            }
        });
    });
};

module.exports = { enviarCorreoCredenciales , enviarCorreoActivacion};
