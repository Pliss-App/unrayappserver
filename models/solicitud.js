const connection = require('../config/conexion');
const bcrypt = require('bcrypt');

const createSolicitud = (
    idUser,
    idConductor,
    idService,
    start_lat,
    start_lng,
    start_direction,
    end_lat,
    end_lng,
    end_direction,
    distance,
    distance_unit,
    duration_unit,
    duration,
    costo,
    fecha_hora
 
) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO solicitudes(
    idUser,
    idConductor,
    idService,
    start_lat,
    start_lng,
    start_direction,
    end_lat,
    end_lng,
    end_direction,
    distance,
    distance_unit,
    duration_unit,
    duration,
    costo,
    fecha_hora,
     estado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[idUser,
        idConductor,
        idService,
        start_lat,
        start_lng,
        start_direction,
        end_lat,
        end_lng,
        end_direction,
        distance,
        distance_unit,
        duration_unit,
        duration,
        costo,
        fecha_hora, 
        'Pendiente'], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const updateEstadoUser = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`UPDATE usuario SET estado_usuario = 'ocupado' WHERE id = ?`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const conductores = (idService) => {
    return new Promise((resolve, reject) => {
        connection.query(`       SELECT * FROM usuario u 
       inner join usuario_rol  ur
       on u.id = ur.iduser
       inner join roles r
       ON r.id = ur.idrol
       INNER JOIN location l
       ON u.id = l.iduser
       WHERE estado_usuario = 'libre' AND idservice =? `, [idService], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


module.exports = {
    conductores,
    createSolicitud,
    updateEstadoUser 
}
