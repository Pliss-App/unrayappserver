const connection = require('../mysql');

const getServices = () => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM service WHERE 1", (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const getCosSerKm = () => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM preciobasekm WHERE 1", (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

module.exports = {
    getServices,
    getCosSerKm
}