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

const getDriver = () => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT  u.id,  u.idService, u.uid, u.name, lo.lat, lo.lng, u.id_status, u.idStatus_travel FROM user u INNER JOIN location lo on u.uid = lo.uid where u.id_type= 2 and u.id_status=1 and u.idStatus_travel= 0", (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const getDriverService = (id, lat, lng) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
           `SELECT @punto := 'POINT(',14.524522609950612, ' ', -91.68588609446668,')';
           SELECT u.id,  u.idService, u.uid, u.name, lo.lat, lo.lng, u.id_status, u.idStatus_travel, (6371 * acos(cos (radians(X(POINTFROMTEXT(@punto))) ) * cos( radians( X(lo.location) ) ) * cos( radians( Y(lo.location) ) -radians(Y(POINTFROMTEXT(@punto))) )+ sin ( radians(X(POINTFROMTEXT(@punto))) )* sin( radians( X(lo.location) ) ))) AS distance_km FROM user u INNER JOIN location lo ON u.uid = lo.uid where u.id_type= 2 AND u.id_status=1 AND u.idStatus_travel= 0`,[lat, lng, id], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const getCosSerKm = (km) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT precio FROM preciobasekm WHERE ${km} BETWEEN minkm AND maxkm;`, (err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

module.exports = {
    getServices,
    getCosSerKm,
    getDriver,
    getDriverService
}