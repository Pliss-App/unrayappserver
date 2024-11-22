const connection = require('../config/conexion');
const bcrypt = require('bcrypt');

const documentacion = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM requisitos_documentacion`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const insert = (userData) => {
    return new Promise((resolve, reject) => {
        connection.query(`insert requisitos_documentacion (data) VALUES (?)`,[JSON.stringify(userData)],  (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const requisitos = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT 
            s.nombre AS servicio,
            GROUP_CONCAT(r.titulo ORDER BY r.titulo SEPARATOR '/ ') AS requisitos,
            s.foto AS url
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
    documentacion,
    requisitos,
    insert
}
