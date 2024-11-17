const connection = require('../config/conexion');
const bcrypt = require('bcrypt');

const beneficios = (modulo) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM beneficios WHERE modulo = ?`, [modulo], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const requisitos = () => {
    return new Promise((resolve, reject) => {
        connection.query(`
SELECT 
    s.nombre AS servicio,
    GROUP_CONCAT(r.titulo ORDER BY r.titulo SEPARATOR '/ ') AS requisitos
FROM 
    servicios s
right JOIN 
    requisitos r ON s.id = r.idservicio
GROUP BY 
    s.id, s.nombre;`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


module.exports = {
    beneficios,
    requisitos
}
