const connection = require('../../config/conexion');
const bcrypt = require('bcrypt');


const getSoporteUsuarioId = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`select u.id idUser, s.id idSoporte, u.nombre, u.apellido, u.correo, u.telefono, s.titulo, s.mensaje, s.estado, s.fecha_hora from soporteusuario s
       inner join usuario u
       on  s.idUser = u.id
       where s.id = ? `, [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}
const getSoporteUsuario = () => {
    return new Promise((resolve, reject) => {
        connection.query(`select * from soporteusuario where estado = 'Revisión'`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const getSoporteUsuarioPendiente = () => {
    return new Promise((resolve, reject) => {
        connection.query(`select * from soporteusuario where estado = 'Pendiente'`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const getSoporteUsuarioAtendido = () => {
    return new Promise((resolve, reject) => {
        connection.query(`select * from soporteusuario where estado = 'Atendido'`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const updateSoporteUsuario = (estado, id, idUser) => {
    return new Promise((resolve, reject) => {
        connection.query(`update soporteusuario set estado= ? where id= ? and idUser = ?`, [estado, id, idUser], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

module.exports = { getSoporteUsuario, updateSoporteUsuario, getSoporteUsuarioPendiente, getSoporteUsuarioAtendido, getSoporteUsuarioId }