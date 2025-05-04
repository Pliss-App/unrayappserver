const connection = require('../../config/conexion');
const bcrypt = require('bcrypt');

const getActivos = (item) => {
    return new Promise((resolve, reject) => {
        connection.query(`select * from transaccion_billetera where estado = ?
ORDER BY  fecha_carga asc`, [item],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}


const getTotal = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT 'Recibido' AS estado, COUNT(*) AS cantidad FROM documentacion WHERE estado = 'Recibido'
UNION ALL
SELECT 'Aprobado', COUNT(*) FROM documentacion WHERE estado = 'Aprobado'
UNION ALL
SELECT 'Rechazado', COUNT(*) FROM documentacion WHERE estado = 'Rechazado';`,
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const getBoleta = (boleta) => {
    return new Promise((resolve, reject) => {
        connection.query(`select * from transaccion_billetera
                            where boleta = ?
                            ORDER BY  fecha_carga asc`, [boleta],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const getFecha = (fecha) => {
    return new Promise((resolve, reject) => {
        connection.query(`select * from transaccion_billetera
                            where fecha_carga = ?
                            ORDER BY  fecha_carga asc`, [fecha],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}


const getBoletaId = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`select * from transaccion_billetera
                            where id = ?`, [id],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const updateBoletaId = (id, estado, comentario) => {
    return new Promise((resolve, reject) => {
        connection.query(`update transaccion_billetera set estado = ?, comentario = ?
                            where id = ?`, [estado, comentario, id],
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
    getActivos,
    getBoleta,
    getFecha,
    getBoletaId,
    updateBoletaId,
    getTotal
}
