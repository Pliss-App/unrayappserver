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

const insert = (           
    iduser, 
    dpi_frontal, 
    dpi_inverso, 
    permiso_conducir, 
    licencia_frontal, 
    licencia_inverso, 
    tarjeta_frontal, 
    tarjeta_inverso,
    penales,  
    policiales, 
    nombrereferencia1, 
    parentescoreferencia1,
    contactoreferencia1, 
    nombrereferencia2,
    parentescoreferencia2, 
    contactoreferencia2,
    servicio,
    rostrodpi,
    perfil,
    vehiculo_frontal, 
    vehiculo_atras) => {
    return new Promise((resolve, reject) => {
        connection.query(`insert documentacion (
            iduser, 
            dpi_frontal, 
            dpi_inverso, 
            permiso_conducir, 
            licencia_frontal, 
            licencia_inverso, 
            tarjeta_frontal, 
            tarjeta_inverso,
            penales,  
            policiales, 
            nombrereferencia1, 
            parentescoreferencia1,
            contactoreferencia1, 
            nombrereferencia2,
            parentescoreferencia2, 
            contactoreferencia2,
            servicio,
            rostrodpi,
            perfil,
            vehiculo_frontal, 
            vehiculo_atras,
            estado_perfil,
            estado
            ) 
            VALUES (?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?, ?, ?, ?);`,
            [iduser,
                dpi_frontal,
                dpi_inverso,
                permiso_conducir,
                licencia_frontal,
                licencia_inverso,
                tarjeta_frontal,
                tarjeta_inverso,
                penales,
                policiales,
                nombrereferencia1,
                parentescoreferencia1,
                contactoreferencia1,
                nombrereferencia2,
                parentescoreferencia2,
                contactoreferencia2,
                servicio,
                rostrodpi,
                perfil,
                vehiculo_frontal,
                vehiculo_atras,
                null, 
                'Recibido'], (err, result) => {
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
