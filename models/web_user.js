const connection = require('../config/conexion');
const bcrypt = require('bcrypt');

const beneficios=(modulo) =>{
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM beneficios WHERE modulo = ?`,[modulo], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const createTravelDetail=(data) =>{
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO travel_detail SET ? `,[data], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


module.exports = {
    beneficios,
    createTravelDetail
}
