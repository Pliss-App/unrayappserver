const connection = require('../config/conexion');
const bcrypt = require('bcrypt');


const saldoBilletera = (id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM billetera WHERE iduser = ?", [id], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const recargarBilletera = (id_user, boleta, monto, url) => {
    return new Promise((resolve, reject) => {
        connection.query(`CALL recargar_billetera(?, ?, ?, ?, NOW());`, [id_user, boleta, monto, url], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const movimientos = (id_user) => {
    return new Promise((resolve, reject) => {
        connection.query(`select * from movimiento_billetera 
       where idUser = ?;`, [id_user], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const getTokenOnesignal = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT onesignal_token AS token FROM usuario WHERE id = ?;`,
            [id],
            (err, result) => {
                if (err) {
                    console.error("Error al obtener el token:", err);
                    return reject(err);  // Rechaza la promesa en caso de error
                }

                // Si no hay resultados, resuelve con null en lugar de `undefined`
                if (!result || result.length === 0) {
                    return resolve(null);
                }

                resolve(result[0].token); // Devuelve solo el token en lugar de un objeto completo
            }
        );
    });
};




const insertMoviBilletera = (id_user, monto, descripcion, tipo) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO movimiento_billetera (
    idUser, 
    tipo, 
    descripcion, 
    cantidad, 
    estado_movimiento, 
    estado
) 
VALUES (
    ?,       
    ?,       
    ?,     
    ?,       
    ?,      
    ?        
);
`, [id_user, tipo, descripcion, monto, 'Realizado', 'A'], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const createTravel = (id_user_driver, id_user_passenger, id_service, descripcion, ayudante, tipo_vehiculo, address_initial, address_final, lat_initial, lng_initial, lat_final, lng_final, date_init, date_final, distance, total, status, status_travel) => {
    return new Promise((resolve, reject) => {

        //id_user_driver, id_user_passenger, id_service, descripcion, ayudante, tipo_vehiculo, address_initial, address_final, lat_initial, lng_initial, lat_final, lng_final, date_init, date_final, distance, total, status, status_travel
        //INSERT INTO travel( id_user_driver, id_user_passenger, id_service, descripcion, ayudante, tipo_vehiculo, address_initial, address_final, lat_initial, lng_initial, lat_final, lng_final, date_init, date_final, distance, total, status, status_travel) VALUES (${connection.escape(id_user_driver)}, ${connection.escape(id_user_passenger)}, ${connection.escape(id_service)}, ${connection.escape(descripcion)}, ${connection.escape(ayudante)}, ${connection.escape(tipo_vehiculo)}, ${connection.escape(address_initial)}, ${connection.escape(address_final)}, ${connection.escape(lat_initial)}, ${connection.escape(lng_initial)}, ${connection.escape(lat_final)}, ${connection.escape(lng_final)}, ${connection.escape(date_init)}, ${connection.escape(date_final)}, ${connection.escape(distance)}, ${connection.escape(total)}, ${connection.escape(status)}, ${connection.escape(status_travel)})

        connection.query(`INSERT INTO travel( id_user_driver, id_user_passenger, id_service, descripcion, ayudante, tipo_vehiculo, address_initial, address_final, lat_initial, lng_initial, lat_final, lng_final, date_init, date_final, distance, total, status, status_travel) VALUES (${connection.escape(id_user_driver)}, ${connection.escape(id_user_passenger)}, ${connection.escape(id_service)}, ${connection.escape(descripcion)}, ${connection.escape(ayudante)}, ${connection.escape(tipo_vehiculo)}, ${connection.escape(address_initial)}, ${connection.escape(address_final)}, ${connection.escape(lat_initial)}, ${connection.escape(lng_initial)}, ${connection.escape(lat_final)}, ${connection.escape(lng_final)}, ${connection.escape(date_init)}, ${connection.escape(date_final)}, ${connection.escape(distance)}, ${connection.escape(total)}, ${connection.escape(status)}, ${connection.escape(status_travel)})`, (err, result) => {
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


const getDetalleVehiculo = (uid) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT * FROM detalle_vehiculo
WHERE idUser= ?`, [uid], (err, rows) => {
            if (err) reject(err)
            resolve(rows[0])
        });
    });
};

const insertGanaDriver = (idUser, idViaje, gana, fecha, hora) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO  GanaDriver (idUser, idViaje, ganancia, fecha, hora) 
                           VALUES (?, ?, ?, ?, ?);`, [idUser, idViaje, gana, fecha, hora], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}



const GananciasDriver = (idUser, fecha) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT COALESCE(SUM(ganancia), 0) AS ganancia 
                    FROM GanaDriver
                    where idUser = ? and fecha = ?`,
            [idUser, fecha], (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const HistorialGananciasDriver = (idUser, fecha) => {
    return new Promise((resolve, reject) => {

        connection.query(`select s.start_direction, s.end_direction, s.costo, gd.ganancia, gd.fecha, gd.hora  from GanaDriver gd
            inner join solicitudes s
            on gd.idViaje = s.id 
            WHERE gd.idUser= ? and gd.fecha = ?`,
            [idUser, fecha], (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

module.exports = {
    createTravel,
    createTravelDetail,
    saldoBilletera,
    recargarBilletera,
    insertMoviBilletera,
    movimientos,
    getTokenOnesignal,
    getDetalleVehiculo,
    insertGanaDriver,
    GananciasDriver,
    HistorialGananciasDriver
}
