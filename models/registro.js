const connection = require('../config/conexion');

const getTelefono = (telefono) => {
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT telefono FROM usuario WHERE telefono = ?",
            [telefono],
            (err, rows) => {
                if (err) {
                    console.error('Error obteniendo el registro:', err);
                    return reject(new Error('Error al obtener el registro'));
                }
                resolve(rows); // No hay registros encontrados
            }
        );
    });
}

module.exports = {
    getTelefono
}