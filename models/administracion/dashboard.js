const connection = require('../../config/conexion');

const totalViajes = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT count(1) as total FROM solicitudes WHERE estado NOT IN ('Finalizado', 'Rechazado', 'Pendiente', 'Cancelado');`,
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const totalUsuarios = () => {
    return new Promise((resolve, reject) => {
        connection.query(`select count(1) as total from usuario u 
                            inner join usuario_rol ur
                            on u.id = ur.iduser
                            where ur.idrol= 1 and u.estado_eliminacion not in (1);`,
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const totalConductores = () => {
    return new Promise((resolve, reject) => {
        connection.query(`select count(1) as total from usuario u 
                            inner join usuario_rol ur
                            on u.id = ur.iduser
                            where ur.idrol= 2 and u.estado_eliminacion not in (1) and u.activacion = 1;`,
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const totalAfiliaciones = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT count(1) as total FROM documentacion WHERE estado in ('Enviado',  'Estado');`,
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const totalRecargas = () => {
    return new Promise((resolve, reject) => {
        connection.query(`select count(1) as total from transaccion_billetera where estado = "Validación";`,
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

module.exports = {
    totalViajes,
    totalUsuarios,
    totalConductores,
    totalAfiliaciones,
    totalRecargas
}
