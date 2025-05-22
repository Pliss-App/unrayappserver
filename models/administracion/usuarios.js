const connection = require('../../config/conexion');
const bcrypt = require('bcrypt');

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


const getUsuariosActivos = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM usuario u
INNER JOIN usuario_rol ur
on u.id = ur.iduser
where u.estado = 1 and u.estado_eliminacion = 1
and ur.idservice= 5`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const actualizarReferencias = (nombrereferencia1, nombrereferencia2, contactoreferencia1, contactoreferencia2, parentescoreferencia1, parentescoreferencia2, id) => {
    return new Promise((resolve, reject) => {
        connection.query(`update documentacion set nombrereferencia1 = ?,  nombrereferencia2= ?, contactoreferencia1= ?, contactoreferencia2= ?, parentescoreferencia1= ?, parentescoreferencia2= ?  where id = ?`, [nombrereferencia1, nombrereferencia2, contactoreferencia1, contactoreferencia2, parentescoreferencia1, parentescoreferencia2, id],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const actualizarFotoConductor = (foto, id) => {
    return new Promise((resolve, reject) => {
        connection.query(`update usuario set foto = ? where id = ?`, [foto, id],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const actualizarEstadoFotoConductor = (estado, id) => {
    return new Promise((resolve, reject) => {
        connection.query(`update documentacion set estado_perfil = ? where id = ?`, [estado, id],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const listCostoViajes = (estado, id) => {
    return new Promise((resolve, reject) => {
        connection.query(`select s.nombre, cv.* from servicios s
inner join costo_viaje cv
on s.id = cv.idservicio
WHERE s.estado =1;`, [estado, id],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const updatePreciosKM = (min_km, max_km, costo_base, precio_km, id, idservicio) => {
    return new Promise((resolve, reject) => {
        connection.query(`UPDATE costo_viaje set 
            min_km= ?, 
            max_km = ?, 
            costo_base =?,
            precio_km=? 
            where id = ? 
            and idservicio= ? `, [min_km, max_km, costo_base, precio_km, id, idservicio],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const getComunity = () => {
    return new Promise((resolve, reject) => {
        connection.query(`select * from comunity order by fecha desc`,
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}


module.exports = {
    getUsuariosActivos,
    actualizarReferencias,
    actualizarFotoConductor,
    actualizarEstadoFotoConductor,
    listCostoViajes,
    updatePreciosKM,
    getComunity

}
