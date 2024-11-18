const connection = require('../config/conexion');

const getServices = () => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM servicios WHERE 1", (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const getServicesActivos = () => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM servicios WHERE estado=true", (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const getCostoServices = (id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM costo_viaje WHERE idservicio= ?",[id], (err, rows) => {
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

const getDriverService = (id, punto) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
           `SELECT u.id,  u.idService, u.uid, u.name, lo.lat, lo.lng, u.id_status, u.idStatus_travel, (6371 * acos(cos (radians(X(POINTFROMTEXT(${punto}))) ) * cos( radians( X(lo.location) ) ) * cos( radians( Y(lo.location) ) -radians(Y(POINTFROMTEXT(${punto}))) )+ sin ( radians(X(POINTFROMTEXT(${punto}))) )* sin( radians( X(lo.location) ) ))) AS distance_km FROM user u INNER JOIN location lo ON u.uid = lo.uid where u.id_type= 2 AND u.id_status=1 AND u.idStatus_travel= 0 AND u.idService=${id} HAVING distance_km < 10 ORDER BY distance_km`, (err, rows) => {
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
    getCostoServices,
    getCosSerKm,
    getDriver,
    getDriverService,
    getServicesActivos
}