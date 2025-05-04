const connection = require('../../config/conexion');
const bcrypt = require('bcrypt');

const getActivos = () => {
    return new Promise((resolve, reject) => {
        connection.query(`select u.nombre, u.apellido, u.estado, u.estado_usuario, b.saldo, d.* from documentacion d
INNER JOIN usuario u
on d.iduser= u.id
INNER JOIN billetera b
ON d.iduser = b.idUser
WHERE d.estado = 'Recibido'
ORDER BY  fecha asc`,
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}


const getTodas = (item) => {
    return new Promise((resolve, reject) => {
        connection.query(`select u.nombre, u.apellido, u.estado, u.estado_usuario, b.saldo, d.* from documentacion d
INNER JOIN usuario u
on d.iduser= u.id
INNER JOIN billetera b
ON d.iduser = b.idUser
WHERE d.estado = ?
ORDER BY  fecha asc`,[item],
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

const actualizarEstadoDocumentacion = ( id, estado) => {
    return new Promise((resolve, reject) => {
        connection.query(`update documentacion set estado = ? where iduser = ?`, [estado, id],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

module.exports = {
    getActivos,
    getTodas,
    deleteViaje,
    liberarConductor,
    getDocumentoId,
    activarConductor,
    actualizarEstadoDocumentacion
}
