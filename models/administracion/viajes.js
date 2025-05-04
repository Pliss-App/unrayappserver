const connection = require('../../config/conexion');
const bcrypt = require('bcrypt');

const getActivos = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT 
s.id,
s.idUser,
s.idConductor,
s.start_direction,
s.end_direction,
    s.costo,
    u1.nombre  nombre_usuario,
    u2.nombre  nombre_conductor,
    se.nombre servicio,
    s.estado,
    s.estado_viaje
FROM solicitudes s
INNER JOIN usuario u1 ON s.idUser = u1.id
INNER JOIN usuario u2 ON s.idConductor = u2.id
INNER JOIN servicios se ON s.idService = se.id
ORDER BY fecha_hora desc`,
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

module.exports = {
    getActivos,
    deleteViaje,
    liberarConductor
}
