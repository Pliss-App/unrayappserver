const connection = require('../config/conexion');
const bcrypt = require('bcrypt');

const createSolicitud = (
    idUser,
    idConductor,
    idService,
    start_lat,
    start_lng,
    start_direction,
    end_lat,
    end_lng,
    end_direction,
    distance,
    distance_unit,
    duration_unit,
    duration,
    costo,
    fecha_hora

) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO solicitudes(
    idUser,
    idConductor,
    idService,
    start_lat,
    start_lng,
    start_direction,
    end_lat,
    end_lng,
    end_direction,
    distance,
    distace_unit,
    duration_unit,
    duration,
    costo,
    fecha_hora,
     estado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [idUser,
            idConductor,
            idService,
            start_lat,
            start_lng,
            start_direction,
            end_lat,
            end_lng,
            end_direction,
            distance,
            distance_unit,
            duration_unit,
            duration,
            costo,
            fecha_hora,
            'Pendiente'], (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

const obtenerSolicitudesConductor = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT u.foto, u.nombre, u.apellido, s.* 
            FROM solicitudes s
            INNER JOIN usuario u
            on s.idUser =  u.id
            WHERE s.idConductor = ? AND s.estado = 'Pendiente'
            ORDER BY fecha_hora ASC 
            LIMIT 1`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const obtenerSolicitudesUsuario = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`(SELECT u.foto, u.nombre, u.apellido, s.*
                        FROM solicitudes s
                        INNER JOIN usuario u ON s.idUser = u.id
                        WHERE s.idUser = ${id} AND s.estado = 'Aceptada'
                        ORDER BY s.fecha_hora ASC
                        LIMIT 1)
                        
                        UNION ALL

                        (SELECT u.foto, u.nombre, u.apellido, s.*
                        FROM solicitudes s
                        INNER JOIN usuario u ON s.idConductor = u.id
                        WHERE s.idConductor = ${id} AND s.estado = 'Aceptada'
                        ORDER BY s.fecha_hora ASC
                        LIMIT 1)

                        LIMIT 1;`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const respDriver = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT u.id as conductor, u.estado_usuario, s.estado FROM usuario u
      INNER JOIN solicitudes s
      on u.id =  s.idConductor
      WHERE s.idConductor = ?       
      order by s.fecha_hora desc  
      limit 1`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result[0])
        })
    });
}

const viajeDriver = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`      SELECT  dv.idUser, u.nombre, u.apellido, 
      u.telefono, u.correo, u.foto, dv.placas, 
      dv.modelo, dv.color FROM usuario u
      INNER JOIN detalle_vehiculo dv
      on u.id = dv.idUser
      INNER JOIN solicitudes s
      on u.id =  s.idConductor
      WHERE s.idConductor = ?`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result[0])
        })
    });
}

const viajeUser = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT nombre, apellido, telefono, foto, rating, total_viajes FROM usuario
      WHERE id=?`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result[0])
        })
    });
}

const updateEstadoViaje = (id, estado) => {
    return new Promise((resolve, reject) => {
        connection.query(`UPDATE solicitudes SET estado_viaje = ? where id= ?`, [estado, id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const obtenerSolicitud = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM solicitud where id= ?`, [ id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const obtenerEstadoConductor = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT estado_usuario FROM usuario WHERE id = ?`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result[0])
        })
    });
}

const updateEstadoUser = (id, estado) => {
    return new Promise((resolve, reject) => {
        connection.query(`UPDATE usuario SET estado_usuario = ? WHERE id = ?`, [estado, id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const updateEstadoSolicitud = (solicitudId, estado) => {
    return new Promise((resolve, reject) => {
        connection.query(`UPDATE solicitudes SET estado = ? WHERE id = ?`, [estado, solicitudId], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const updateSolicitudConductor = (id, idConductor) => {
    return new Promise((resolve, reject) => {
        connection.query(`UPDATE solicitudes SET idConductor = ? WHERE id = ?`, [idConductor, id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const deleteSolicitud = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`delete from solicitudes where id = ?`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const conductores = (idService) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT u.id, u.nombre, u.apellido, 
       u.telefono, u.foto, r.nombre as rol, u.estado,
       u.estado_usuario, l.lat, l.lon, u.socket_id FROM usuario u 
       inner join usuario_rol  ur
       on u.id = ur.iduser
       inner join roles r
       ON r.id = ur.idrol
       INNER JOIN location l
       ON u.id = l.iduser
       WHERE estado_usuario = 'libre' AND idservice = ? `, [idService], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const procesarSolicitud = (idsoli, idConductor, accion) => {
    return new Promise((resolve, reject) => {
        connection.query(`UPDATE solicitudes SET estado = ? WHERE id = ? AND idConductor= ?`, [accion, idsoli, idConductor], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const saveMessage = (emisor_id, receptor_id, mensaje) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO mensajes (emisor_id, receptor_id, mensaje) VALUES (?, ?, ?)';
        connection.query(query, [emisor_id, receptor_id, mensaje], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const obtMessage = (emisorId, receptorId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM mensajes 
      WHERE (emisor_id = ? AND receptor_id = ?) 
         OR (emisor_id = ? AND receptor_id = ?) 
      ORDER BY fecha ASC`;
        connection.query(query, [emisorId, receptorId, receptorId, emisorId], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const obtLocationDriver = (id) => {
    return new Promise((resolve, reject) => {
        const query = `select lat, lon, angle from location
            where iduser =?`;
        connection.query(query, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const obtEstadoViajeDriver = (id) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT estado_viaje, estado from solicitudes
where id =?`;
        connection.query(query, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


const obtMotCancelar = () => {
    return new Promise((resolve, reject) => {
        const query = `SELECT title, id as value from motiCancelar`;
        connection.query(query, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


const cancelarViaje = (id, option) => {
    return new Promise((resolve, reject) => {
        const query = `update solicitudes set estado = 'Cancelado', estado_cancelacion = ?  where id= ?`;
        connection.query(query, [option, id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const finalizarViaje = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`UPDATE solicitudes SET estado='Finalizado',  estado_viaje = 'Finalizado' where id= ?`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const guardarCalificacion = (idViaje, idUser, punteo, comentario) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO calificacion (idUser, viaje_id, calificacion, comentario) VALUES (?, ?, ?, ?)';
        connection.query(query, [ idUser, idViaje, punteo, comentario], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const getCalificacion = (idUser) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT AVG(calificacion) AS promedio, COUNT(*) AS total_viajes 
            FROM calificacion WHERE idUser = ?`;
        connection.query(query, [idUser], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const updateRanting= (idUser, promedio, totalViajes) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE usuario SET  total_viajes = ?, rating = ? WHERE id = ?`;
        connection.query(query, [totalViajes, promedio,  idUser], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

module.exports = {
    conductores,
    createSolicitud,
    updateEstadoUser,
    obtenerEstadoConductor,
    updateSolicitudConductor,
    updateEstadoSolicitud,
    deleteSolicitud,
    obtenerSolicitudesConductor,
    procesarSolicitud,
    respDriver,
    viajeDriver,
    obtenerSolicitudesUsuario,
    saveMessage,
    obtMessage,
    obtLocationDriver,
    obtEstadoViajeDriver,
    obtMotCancelar,
    cancelarViaje,
    viajeUser,
    updateEstadoViaje ,
    finalizarViaje,
    guardarCalificacion,
    getCalificacion,
    updateRanting,
    obtenerSolicitud
}
