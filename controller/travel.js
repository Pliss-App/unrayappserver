const connection = require('../mysql');
const bcrypt = require('bcrypt');

const createTravel=(data) =>{
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO travel SET ? `,[data], (err, result) => {
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
    createTravel,
    createTravelDetail
}
