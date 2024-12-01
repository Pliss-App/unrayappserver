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
    distace_unit,
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

const obtenerEstadoConductor= (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT estado_usuario FROM usuario WHERE id = ?`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result[0])
        })
    });
}

const updateEstadoUser = (id, estado) => {
    return new Promise((resolve, reject) => {
        connection.query(`UPDATE usuario SET estado_usuario = ? WHERE id = ?`, [estado, id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const conductores = (idService) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT u.id, u.nombre, u.apellido, 
       u.telefono, u.foto, r.nombre as rol, u.estado,
       u.estado_usuario, l.lat, l.lon FROM usuario u 
       inner join usuario_rol  ur
       on u.id = ur.iduser
       inner join roles r
       ON r.id = ur.idrol
       INNER JOIN location l
       ON u.id = l.iduser
       WHERE estado_usuario = 'libre' AND idservice = ? `, [idService], (err, result) => {
            if (err) reject(err)

           
            resolve(result)
        })
    });
}


module.exports = {
    conductores,
    createSolicitud,
    updateEstadoUser,
    obtenerEstadoConductor
}
