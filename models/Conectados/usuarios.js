const connection = require('../../config/conexion');
const bcrypt = require('bcrypt');

const connectedUsers = (id, socket) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO connectedUsers( identificador,  socket) VALUES (${connection.escape(id)}, ${connection.escape(socket)})`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const connectedDrivers = (id, socket) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO connectedDrivers( identificador,  socket) VALUES (${connection.escape(id)}, ${connection.escape(socket)})`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


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
        connection.query(`DELETE FROM connectedUsers WHERE identificador = ?;`,[id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const deleteConnectedDrivers = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`DELETE FROM connectedDrivers WHERE identificador = ?; `,[id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}



const createTravelDetail = (data) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO travel_detail SET ? `, [data], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const getCarousel = (modulo) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM carousel WHERE modulo = ?`, [modulo], (err, result) => {
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
