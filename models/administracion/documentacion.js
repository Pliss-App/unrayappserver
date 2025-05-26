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


const getListEnviado = () => {
    return new Promise((resolve, reject) => {
        connection.query(`
select u.id, s.id idservicio, u.codigo, u.nombre, u.apellido, ro.nombre rol,  s.nombre servicio, d.estado, d.fecha from documentacion d
INNER JOIN usuario u
on d.iduser= u.id
INNER JOIN usuario_rol ur
on u.id = ur.iduser
INNER JOIN servicios s
on ur.idservice = s.id
INNER JOIN roles ro
on ur. idrol = ro.id
WHERE d.estado = 'Enviado'
ORDER BY  fecha asc`,
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}



const getListAprobado = () => {
    return new Promise((resolve, reject) => {
        connection.query(`
select u.id, s.id idservicio, u.codigo, u.nombre, u.apellido, ro.nombre rol,  s.nombre servicio, d.estado, d.fecha from documentacion d
INNER JOIN usuario u
on d.iduser= u.id
INNER JOIN usuario_rol ur
on u.id = ur.iduser
INNER JOIN servicios s
on ur.idservice = s.id
INNER JOIN roles ro
on ur. idrol = ro.id
WHERE d.estado = 'Aprobado'
ORDER BY  fecha asc`,
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const getListRechazadas = () => {
    return new Promise((resolve, reject) => {
        connection.query(`
select u.id, s.id idservicio, u.codigo, u.nombre, u.apellido, ro.nombre rol,  s.nombre servicio, d.estado, d.fecha from documentacion d
INNER JOIN usuario u
on d.iduser= u.id
INNER JOIN usuario_rol ur
on u.id = ur.iduser
INNER JOIN servicios s
on ur.idservice = s.id
INNER JOIN roles ro
on ur. idrol = ro.id
WHERE d.estado = 'Rechazada'
ORDER BY  fecha asc`,
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const getListPendientes = () => {
    return new Promise((resolve, reject) => {
        connection.query(`
select u.id, s.id idservicio, u.codigo, u.nombre, u.apellido, ro.nombre rol,  s.nombre servicio, d.estado, d.fecha from documentacion d
INNER JOIN usuario u
on d.iduser= u.id
INNER JOIN usuario_rol ur
on u.id = ur.iduser
INNER JOIN servicios s
on ur.idservice = s.id
INNER JOIN roles ro
on ur. idrol = ro.id
WHERE d.estado = 'Pendiente'
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
ORDER BY  fecha asc`, [item],
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

const getDatosVehiculoId = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`select * from detalle_vehiculo where idUser = ?`, [id],
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


const activarConductor = (id, estado) => {
    return new Promise((resolve, reject) => {
        connection.query(`update usuario set activacion=? WHERE id= ?`, [estado, id],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}


const estadoActivacionConductor = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`select activacion from usuario WHERE id= ?`, [id],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const actualizarEstadoDocumentacion = (id, estado, comentario) => {
    return new Promise((resolve, reject) => {
        connection.query(`update documentacion set estado = ?, comentario = ? where iduser = ?`, [estado, comentario, id],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const actualizarFotoDocumento = (key, foto, id, iduser) => {
    return new Promise((resolve, reject) => {
        connection.query(`update documentacion set ${key}= ? WHERE id= ? and iduser= ?`, [ foto, id, iduser],
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
    actualizarEstadoDocumentacion,
    getListEnviado,
    getDatosVehiculoId,
    actualizarFotoDocumento,
    getListAprobado,
    getListRechazadas,
    getListPendientes ,
    estadoActivacionConductor
}
