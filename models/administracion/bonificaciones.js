const connection = require('../../config/conexion');
const bcrypt = require('bcrypt');

const filtrarRangoFechaViajes = (fech_ini, fech_final, codigo = null) => {
    return new Promise((resolve, reject) => {
        const ini = `${fech_ini} 00:00:00`;
        const fin = `${fech_final} 23:59:59`;

        const sql = `
            SELECT 
                s.idConductor, 
                u.codigo, 
                u.nombre, 
                u.apellido,
                u.id AS id_conductor,
                COUNT(s.id) AS totalViajes
            FROM usuario u
            INNER JOIN solicitudes s ON u.id = s.idConductor
            WHERE /*s.estado = 'Finalizado'
              AND*/ s.fecha_hora BETWEEN ? AND ?
              AND (? IS NULL OR u.codigo = ?)
            GROUP BY u.id;
        `;

        const params = [ini, fin, codigo, codigo];

        connection.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


const filtrarCodigoViajes = (codigo) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT 
                            s.idConductor, 
                            u.codigo, 
                            u.nombre, 
                            u.apellido,
                            u.id AS id_conductor,
                            COUNT(s.id) AS totalViajes
                            FROM usuario u
                            INNER JOIN solicitudes s 
                            ON u.id = s.idConductor
                            WHERE /* s.estado = "Finalizado"
                            AND*/ codigo= ?
                            GROUP BY u.id;`,
            [codigo],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

module.exports = {
    filtrarRangoFechaViajes,
    filtrarCodigoViajes
}