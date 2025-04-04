const connection = require('../../config/conexion');
const bcrypt = require('bcrypt');

const getUsuarios = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT 
    u.codigo,
 CONCAT(u.nombre, ' ', u.apellido) AS nombre,
    u.telefono,
    u.correo,
    COUNT(r.codigo_referido) AS cantidad_referidos
FROM 
    usuario u
JOIN 
    usuario r ON u.codigo = r.codigo_referido
GROUP BY 
    u.codigo, u.nombre
ORDER BY 
    cantidad_referidos DESC;`,
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

module.exports = {
    getUsuarios,

}
