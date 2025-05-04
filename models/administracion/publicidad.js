const connection = require('../../config/conexion');
const bcrypt = require('bcrypt');

const insertPublicidad = (titulo, subtitulo, descripcion, url, ubicationurl, tipopublicidad, href) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO publicidad 
            (titulo, subtitulo, descripcion, url, ubicationurl, tipopublicidad, href) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const values = [titulo, subtitulo, descripcion, url, ubicationurl, tipopublicidad, href];

        connection.query(sql, values, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

const getPublicidades = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM publicidad ORDER BY fechacreacion DESC';

        connection.query(sql, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const updatePublicidad = (id, data) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE publicidad SET 
                titulo = ?, 
                subtitulo = ?, 
                descripcion = ?, 
                url = ?, 
                ubicationurl = ?, 
                tipopublicidad = ?, 
                href = ?
            WHERE id = ?`;

        const values = [
            data.titulo,
            data.subtitulo,
            data.descripcion,
            data.url,
            data.ubicationurl,
            data.tipopublicidad,
            data.href,
            id
        ];

        connection.query(sql, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const deletePublicidad = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM publicidad WHERE id = ?';

        connection.query(sql, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


module.exports = {
    insertPublicidad,
    getPublicidades,
    updatePublicidad,
    deletePublicidad
}