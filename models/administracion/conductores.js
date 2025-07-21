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
        connection.query(`select u.*, dv.id idVehiculo, 
dv.placas, dv.modelo, 
dv.color, ul.id idLocation, 
ul.direccion, ul.municipio, 
ul.departamento, ul.pais,
bi.saldo,
bi.reserva
 from 
usuario u
LEFT JOIN
detalle_vehiculo dv
on u.id = dv.idUser
left join usuario_location ul
on u.id =  ul.idUser
left join billetera bi
ON u.id = bi.iduser
where u.id =?`, [id], (err, result) => {
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
            [location.direccion, location.municipio, location.departamento, 1, id], (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}


const updateProfileId = (conductor, id) => {
    return new Promise((resolve, reject) => {
        connection.query(`UPDATE usuario 
      SET nombre = ?, apellido = ?, correo = ?, telefono = ?, estado = ?, 
          estado_usuario = ?, estado_eliminacion = ?, activacion= ?
      WHERE id = ? `, [conductor.nombre,
        conductor.apellido,
        conductor.correo,
        conductor.telefono,
        conductor.estado,
        conductor.estado_usuario,
        conductor.estado_eliminacion,
        conductor.activacion,
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


// LIBNI CAMBIA PORFA ESTO LUEGO  PARA QUE SOLO VENA LOS CONDUTORES ACTIVOS PORFA
const getActivos = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT u.id, u.codigo,
            CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario,
  u.telefono, 
  u.correo, 
  u.estado_usuario, 
  ur.idrol, 
  ur.idservice, 
  s.nombre AS servicio,
  (select nombre from  departamento where id = ul.departamento ) departamento,
  ul.departamento ubicacion,
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
  LEFT JOIN  usuario_location ul ON u.id = ul.idUser
WHERE u.estado_eliminacion = 1 
  AND ur.idservice != 5
GROUP BY 
  u.id, ur.idrol, ur.idservice, s.nombre;

`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const getConductoresActivados = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT u.id, u.codigo,
            CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario,
  u.telefono, 
  u.correo, 
  u.estado_usuario, 
  ur.idrol, 
  ur.idservice, 
  u.ultconexion,
  s.nombre AS servicio,
  (select nombre from  departamento where id = ul.departamento ) departamento,
  ul.departamento ubicacion,
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
  LEFT JOIN  usuario_location ul ON u.id = ul.idUser
WHERE u.estado_eliminacion = 1 and u.activacion = 1
  AND ur.idservice != 5
GROUP BY 
  u.id, ur.idrol, ur.idservice, s.nombre;

`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const getConductoresNoActivados = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT u.id, u.codigo,
            CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario,
  u.telefono, 
  u.correo, 
  u.estado_usuario, 
  ur.idrol, 
  ur.idservice, 
  s.nombre AS servicio,
  (select nombre from  departamento where id = ul.departamento ) departamento,
  ul.departamento ubicacion,
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
  LEFT JOIN  usuario_location ul ON u.id = ul.idUser
WHERE u.estado_eliminacion = 1 and u.activacion = 0
  AND ur.idservice != 5
GROUP BY 
  u.id, ur.idrol, ur.idservice, s.nombre;

`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const getConductoresEnLinea = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT u.id, u.codigo,
            CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario,
  u.telefono, 
  u.correo, 
  u.estado_usuario, 
  ur.idrol, 
  ur.idservice, 
  s.nombre AS servicio,
  (select nombre from  departamento where id = ul.departamento ) departamento,
  ul.departamento ubicacion,
  CASE 
    WHEN COUNT(d.iduser) > 0 THEN 'true' 
    ELSE 'false' 
  END AS documentacion,
  u.ultconexion
FROM 
  usuario u
INNER JOIN 
  usuario_rol ur ON u.id = ur.iduser
INNER JOIN 
  servicios s ON ur.idservice = s.id
LEFT JOIN 
  documentacion d ON u.id = d.iduser
  LEFT JOIN  usuario_location ul ON u.id = ul.idUser
WHERE u.estado_eliminacion = 1 and u.activacion = 1 and u.estado = 1
  AND ur.idservice != 5
GROUP BY 
  u.id, ur.idrol, ur.idservice, s.nombre;

`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const getConductoresFueradeLinea = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT u.id, u.codigo,
            CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario,
  u.telefono, 
  u.correo, 
  u.estado_usuario, 
  ur.idrol, 
  ur.idservice, 
  s.nombre AS servicio,
  (select nombre from  departamento where id = ul.departamento ) departamento,
  ul.departamento ubicacion,
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
  LEFT JOIN  usuario_location ul ON u.id = ul.idUser
WHERE u.estado_eliminacion = 1 and u.activacion = 1 and u.estado = 0
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
        connection.query(`SELECT * FROM municipalidad where departamento_id= ?`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const getHistorialBilletera = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`select * from movimiento_billetera
                    where idUser= ?`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const getHistorialBilleteraFecha = (id, feini, fefin) => {
    return new Promise((resolve, reject) => {
        connection.query(`select * from movimiento_billetera
                    where idUser= ? and fecha BETWEEN ? AND ? order by fecha asc`, [id, feini, fefin], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const getHistorialBilleteraTipo = (id, tipo) => {
    return new Promise((resolve, reject) => {
        connection.query(`select * from movimiento_billetera
                    where idUser= ? and tipo= ? order by fecha asc`, [id, tipo], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const getHistorialBilleteraBusqueda = (id, estado, fechaini, fechafin) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * 
FROM movimiento_billetera
WHERE 
    idUser = ? 
    AND tipo = ?  
    AND fecha BETWEEN ? AND ?  order by fecha asc`, [id, estado, fechaini, fechafin], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const getViajesConductor = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM solicitudes
WHERE idConductor = ? 
AND MONTH(fecha_hora) = MONTH(CURDATE()) 
AND YEAR(fecha_hora) = YEAR(CURDATE()) 
ORDER BY fecha_hora ASC;`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const getViajesConductorFecha = (id, fechaini, fechafin) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM solicitudes
WHERE idConductor = ? 
AND fecha_hora BETWEEN ? AND ?
ORDER BY fecha_hora ASC;`, [id, fechaini, fechafin], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const updateDatoVehiculo = (id, placas, modelo, color) => {
    return new Promise((resolve, reject) => {
        connection.query(`update detalle_vehiculo set placas = ?, modelo = ?, color= ? where idUser= ?`, [placas, modelo, color, id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const getMovimientosConductores = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT u.id, u.codigo,
 CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario,
  s.nombre AS servicio,
  u.estado,
  l.lat latitude,
  l.lon longitude,
  l.angle
FROM 
  usuario u
INNER JOIN 
  usuario_rol ur ON u.id = ur.iduser
INNER JOIN 
  servicios s ON ur.idservice = s.id
LEFT JOIN 
  documentacion d ON u.id = d.iduser
  LEFT JOIN  usuario_location ul ON u.id = ul.idUser
inner join location l
on u.id = l.iduser
WHERE u.estado_eliminacion = 1 and activacion= 1
  AND ur.idservice != 5
GROUP BY 
  u.id, ur.idrol, ur.idservice, s.nombre;
`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const getPorcentajes = () => {
    return new Promise((resolve, reject) => {
        connection.query(`select * from porapps`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const updatePorcentajes = (app, cond, id) => {
    return new Promise((resolve, reject) => {
        connection.query(`update porapps set porApp = ?, porCond= ? where id = ?`, [app, cond, id], (err, result) => {
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
    getDepartamentos,
    getMunicipios,
    getHistorialBilletera,
    getHistorialBilleteraBusqueda,
    getHistorialBilleteraFecha,
    getHistorialBilleteraTipo,
    getViajesConductor,
    getViajesConductorFecha,
    updateDatoVehiculo,
    getConductoresActivados,
    getConductoresNoActivados,
    getConductoresFueradeLinea,
    getConductoresEnLinea,
    getMovimientosConductores,
    getPorcentajes,
    updatePorcentajes
}
