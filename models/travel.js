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

const getSolicitudId=(id) =>{
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM solicitudes where id= ?`,[id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


module.exports = {
    createTravel,
    createTravelDetail,
    getSolicitudId
}
