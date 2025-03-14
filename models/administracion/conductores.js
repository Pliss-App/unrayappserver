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

const getConductorVehiculoId = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`select u.*, dv.id idVehiculo, dv.placas, dv.modelo, dv.color, ul.id idLocation, ul.direccion, ul.municipio, ul.departamento, ul.pais from 
usuario u
LEFT JOIN
detalle_vehiculo dv
on u.id = dv.idUser
left join usuario_location ul
on u.id =  ul.idUser
where u.id = ?`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const updateVehiculoId = (vehiculo, id) => {
    return new Promise((resolve, reject) => {
        connection.query(`UPDATE detalle_vehiculo 
      SET placas = ?, modelo = ?, color = ? 
      WHERE idUser = ? `, [vehiculo.placas,
        vehiculo.modelo,
        vehiculo.color, id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const updateLocationId = (location, id) => {
    return new Promise((resolve, reject) => {
        connection.query(`update usuario_location 
            set direccion =?, 
            municipio = ?, 
            departamento= ?, 
            pais= ? 
            where idUser = ?`, 
            [location.direccion, location.municipio, location.departamento, location.pais,  id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const updateProfileId = (conductor, id) => {
    return new Promise((resolve, reject) => {
        connection.query(`UPDATE usuario 
      SET nombre = ?, apellido = ?, correo = ?, telefono = ?, estado = ?, 
          estado_usuario = ?, estado_eliminacion = ?
      WHERE id = ? `, [    conductor.nombre,
        conductor.apellido,
        conductor.correo,
        conductor.telefono,
        conductor.estado,
        conductor.estado_usuario,
        conductor.estado_eliminacion,
        id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

/*
const getConductorVehiculoId=(id) =>{
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM detalle_vehiculo where idUser= ? `,[id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
} */



const getActivos = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT u.id,
  u.nombre, 
  u.apellido, 
  u.telefono, 
  u.correo, 
  u.estado_usuario, 
  ur.idrol, 
  ur.idservice, 
  s.nombre AS servicio,
  CASE 
    WHEN COUNT(d.iduser) > 0 THEN 'true' 
    ELSE 'false' 
  END AS documentacion
FROM 
  usuario u
INNER JOIN 
  usuario_rol ur ON u.id = ur.iduser
INNER JOIN 
  servicios s ON ur.idservice = s.id
LEFT JOIN 
  documentacion d ON u.id = d.iduser
WHERE 
  u.estado = 1 
  AND u.estado_eliminacion = 1 
  AND ur.idservice != 5
GROUP BY 
  u.id, ur.idrol, ur.idservice, s.nombre;
`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const getServicios = () => {
    return new Promise((resolve, reject) => {
        connection.query(`select id, nombre from servicios
where id!=5`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const getDepartamentos = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM departamento`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const getMunicipios = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM municipalidad where departamento_id= ?`, [id] ,(err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}



module.exports = {
    getActivos,
    getServicios,
    //getConductorId,
    getConductorVehiculoId,
    updateVehiculoId,
    updateProfileId,
    updateLocationId,
    getDepartamentos ,
    getMunicipios
}
