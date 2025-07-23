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


const quitarPrefijo502 = (telefono) => {
    return telefono.startsWith('502') ? telefono.slice(3) : telefono;
};

const obtenerTokenOnesignal = (telefono) => {

    const tel = quitarPrefijo502(telefono);
    console.log("TELEFONO SIN 502 ", tel);
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT onesignal_token as token FROM usuario WHERE telefono = ?",
            [tel],
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
    getTelefono,
    obtenerTokenOnesignal
}