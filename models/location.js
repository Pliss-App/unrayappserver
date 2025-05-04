const connection = require('../config/conexion');
const bcrypt = require('bcrypt');



const createTravel=(id_user_driver, id_user_passenger, id_service, descripcion, ayudante, tipo_vehiculo, address_initial, address_final, lat_initial, lng_initial, lat_final, lng_final, date_init, date_final, distance, total, status, status_travel) =>{
    return new Promise((resolve, reject) => {

        //id_user_driver, id_user_passenger, id_service, descripcion, ayudante, tipo_vehiculo, address_initial, address_final, lat_initial, lng_initial, lat_final, lng_final, date_init, date_final, distance, total, status, status_travel
       //INSERT INTO travel( id_user_driver, id_user_passenger, id_service, descripcion, ayudante, tipo_vehiculo, address_initial, address_final, lat_initial, lng_initial, lat_final, lng_final, date_init, date_final, distance, total, status, status_travel) VALUES (${connection.escape(id_user_driver)}, ${connection.escape(id_user_passenger)}, ${connection.escape(id_service)}, ${connection.escape(descripcion)}, ${connection.escape(ayudante)}, ${connection.escape(tipo_vehiculo)}, ${connection.escape(address_initial)}, ${connection.escape(address_final)}, ${connection.escape(lat_initial)}, ${connection.escape(lng_initial)}, ${connection.escape(lat_final)}, ${connection.escape(lng_final)}, ${connection.escape(date_init)}, ${connection.escape(date_final)}, ${connection.escape(distance)}, ${connection.escape(total)}, ${connection.escape(status)}, ${connection.escape(status_travel)})
       
        connection.query(`INSERT INTO travel( id_user_driver, id_user_passenger, id_service, descripcion, ayudante, tipo_vehiculo, address_initial, address_final, lat_initial, lng_initial, lat_final, lng_final, date_init, date_final, distance, total, status, status_travel) VALUES (${connection.escape(id_user_driver)}, ${connection.escape(id_user_passenger)}, ${connection.escape(id_service)}, ${connection.escape(descripcion)}, ${connection.escape(ayudante)}, ${connection.escape(tipo_vehiculo)}, ${connection.escape(address_initial)}, ${connection.escape(address_final)}, ${connection.escape(lat_initial)}, ${connection.escape(lng_initial)}, ${connection.escape(lat_final)}, ${connection.escape(lng_final)}, ${connection.escape(date_init)}, ${connection.escape(date_final)}, ${connection.escape(distance)}, ${connection.escape(total)}, ${connection.escape(status)}, ${connection.escape(status_travel)})`, (err, result) => {
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


const obtenerLocationUserIsSharing = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT lat  latitude, lon  longitude, isSharing FROM location WHERE iduser=? and isSharing=1`, [id], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const obtenerLocationUser = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT lat  latitude, lon  longitude FROM location WHERE iduser=?`, [id], (err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};


const updateLocationUser = (id, lat, lng, angle) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `UPDATE location SET lat=?, lon=?, angle=? WHERE iduser=?`, [lat, lng, angle, id], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const updateSharedLocationUser = (id, isShared) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `UPDATE location SET isSharing=? WHERE iduser=?`, [isShared, id], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};



module.exports = {
    createTravel,
    createTravelDetail,
    obtenerLocationUser,
    updateLocationUser,
    updateSharedLocationUser,
    obtenerLocationUserIsSharing
}
