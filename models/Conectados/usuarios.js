const connection = require('../../config/conexion');
const bcrypt = require('bcrypt');

const connectedUsers = (id, socket) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO connectedUsers( identificador,  socket) 
            VALUES (${connection.escape(id)}, ${connection.escape(socket)})
              ON DUPLICATE KEY UPDATE socket = VALUES(socket)
            `;

        connection.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

const connectedDrivers = (id, socket) => {
    return new Promise((resolve, reject) => {
        const sql = `
      INSERT INTO connectedDrivers (identificador, socket)
      VALUES (${connection.escape(id)}, ${connection.escape(socket)})
      ON DUPLICATE KEY UPDATE socket = VALUES(socket)
    `;
        connection.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


const getConnectedUsers = () => {
    return new Promise((resolve, reject) => {
        connection.query(`select identificador, socket from connectedUsers`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const getConnectedDrivers = () => {
    return new Promise((resolve, reject) => {
        connection.query(`select identificador, socket from  connectedDrivers`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const deleteConnectedUsers = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`DELETE FROM connectedUsers WHERE identificador = ?;`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const deleteConnectedDrivers = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`DELETE FROM connectedDrivers WHERE identificador = ?; `, [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

module.exports = {
    connectedUsers,
    connectedDrivers,
    getConnectedUsers,
    getConnectedDrivers,
    deleteConnectedUsers,
    deleteConnectedDrivers
}
