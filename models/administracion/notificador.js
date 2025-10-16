const connection = require('../../config/conexion');
const bcrypt = require('bcrypt');

const getUsuarios = () => {
    return new Promise((resolve, reject) => {
        connection.query(`select u.id as idUser, u.nombre, u.apellido, u.onesignal_token, 
                            s.id as idServicio, s.nombre as nombreServicio,
                            ur.idRol,
                                CASE 
                                    WHEN idRol = 1 THEN 'Usuario' 
                                    ELSE 'Conductor' 
                                END AS tipo_usuario
                            from usuario u 
                            inner join usuario_rol ur
                            on u.id = ur.iduser
                            inner join servicios s
                            on ur.idservice = s.id
                            WHERE u.estado_eliminacion!= 1;`,
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const getDocumentoId = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`select u.nombre, u.apellido, u.correo, u.telefono, u.activacion, u.estado_usuario, b.saldo, d.* from documentacion d
INNER JOIN usuario u
on d.iduser= u.id
INNER JOIN billetera b
ON d.iduser = b.idUser
WHERE  d.iduser = ?`, [id],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const deleteViaje = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`delete from solicitudes WHERE id= ?`, [id],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const liberarConductor = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`update usuario set estado_usuario= 'libre' WHERE id= ?`, [id],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}


const activarConductor = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`update usuario set activacion= true WHERE id= ?`, [id],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const actualizarEstadoDocumentacion = (id, estado) => {
    return new Promise((resolve, reject) => {
        connection.query(`update documentacion set estado = ? where iduser = ?`, [estado, id],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}


const getNotificaciones = (rol) => {
    return new Promise((resolve, reject) => {
        connection.query(`    SELECT * FROM notificaciones_recurrentes  WHERE rol = ? AND estado = 'activo'`, [rol],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

module.exports = {
    getUsuarios,
    deleteViaje,
    liberarConductor,
    getDocumentoId,
    activarConductor,
    actualizarEstadoDocumentacion,
    getNotificaciones
}
