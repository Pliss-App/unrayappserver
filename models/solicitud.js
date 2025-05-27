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
    estado, estado_cancelacion, estado_viaje, tiempoExpiracion) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [idUser,
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
            'Pendiente',
            0,
            'Pendiente de Iniciar',
            Date.now() + 32000
        ], (err, result) => {
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
                        WHERE s.idUser = ${id} AND s.estado = 'Aceptado'
                        ORDER BY s.fecha_hora ASC
                        LIMIT 1)
                        
                        UNION ALL

                        (SELECT u.foto, u.nombre, u.apellido, s.*
                        FROM solicitudes s
                        INNER JOIN usuario u ON s.idConductor = u.id
                        WHERE s.idConductor = ${id} AND s.estado = 'Aceptado'
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
        connection.query(`   SELECT  dv.idUser, s.nombre as servicio, s.foto fotoservicio,  u.nombre, u.apellido,   u.rating, u.total_viajes,
      u.telefono, u.correo, u.foto, dv.placas, 
      dv.modelo, dv.color FROM usuario u
      INNER JOIN detalle_vehiculo dv
      on u.id = dv.idUser
      inner join usuario_rol ur
      on  u.id = ur.iduser
      inner join servicios s
      on  ur.idservice = s.id
      WHERE u.id =?`, [id], (err, result) => {
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
        connection.query(`SELECT * FROM solicitudes where id= ?`, [id], (err, result) => {
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

const updateSolicitudConductor = (id, time, idConductor,) => {
    return new Promise((resolve, reject) => {
        connection.query(`UPDATE solicitudes SET idConductor = ?,  tiempoExpiracion = ? WHERE id = ?`, [idConductor, time, id], (err, result) => {
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
       WHERE u.activacion = 1 and u.estado = 1 and u.estado_usuario = 'libre' AND ur.idservice = ? `, [idService], (err, result) => {
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

const saveMessage = (idViaje, emisor_id, receptor_id, mensaje) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO mensajes (idViaje, emisor_id, receptor_id, mensaje) VALUES (?, ?, ?, ?)';
        connection.query(query, [idViaje, emisor_id, receptor_id, mensaje], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const obtMessage = (idViaje, emisorId, receptorId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM mensajes 
      WHERE idViaje= ? AND (emisor_id = ? AND receptor_id = ?) 
         OR (emisor_id = ? AND receptor_id = ?) 
      ORDER BY fecha ASC`;
        connection.query(query, [idViaje, emisorId, receptorId, receptorId, emisorId], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const obtSMSDefinido = (rol) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM mensajeDefinido 
                       WHERE rol = ?`;
        connection.query(query, [rol], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const obtenerSolicitudPendiente = (driverId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT s.*, COALESCE(u.foto, '') AS foto
FROM solicitudes s
LEFT JOIN usuario u ON s.idUser = u.id
WHERE s.idConductor = ? AND s.estado = 'Pendiente';`;
        connection.query(query, [driverId], (err, result) => {
            if (err) return reject(err);
            resolve(result[0]);
        });
    });
}

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



const buscarConductorViaje = (id) => {
    return new Promise((resolve, reject) => {
        const query = `select idConductor from  solicitudes  where id= ?`;
        connection.query(query, [id], (err, result) => {
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

const guardarCalificacion = (data) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO calificaciones 
        (id_viaje, evaluador_id, evaluado_id, calificacion, comentario)
         VALUES (?, ?, ?, ?, ?)`;
        connection.query(query, [data.id_viaje, data.evaluador_id, data.evaluado_id, data.calificacion, data.comentario], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const consultarCalificacion = (data) => {
    return new Promise((resolve, reject) => {
        const query = `select * from calificaciones where id_viaje = ?  and  evaluador_id= ? and evaluado_id = ?`;
        connection.query(query, [data.id_viaje, data.evaluador_id, data.evaluado_id], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        });
    });
};


const guardarCali_previa = (idUser, idViaje) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO cali_viaje
        (idUser, idViaje, estado)
         VALUES (?, ?, ?)`;
        connection.query(query, [idUser, idViaje, 'A'], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const getCalificacion = (idUser) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT AVG(calificacion) AS promedio, COUNT(*) AS total_viajes 
            FROM calificaciones WHERE evaluado_id = ?`;
        connection.query(query, [idUser], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


const obtenerSiCalifico = (idUser, idviaje) => {
    return new Promise((resolve, reject) => {
        const query = `select * from cali_viaje
            where idUser = ? and idViaje= ? AND estado= 'A'`;
        connection.query(query, [idUser, idviaje], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const updateCali_viaje = (idUser, idViaje) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE cali_viaje SET estado = 'N' WHERE idUser = ? and idViaje= ?`;
        connection.query(query, [idUser, idViaje], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const updateRanting = (idUser, promedio, totalViajes) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE usuario SET  total_viajes = ?, rating = ? WHERE id = ?`;
        connection.query(query, [totalViajes, promedio, idUser], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


const updateEstado = (estado, estado_cancelacion, estado_viaje, id) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE solicitudes SET  estado = ?, estado_cancelacion = ?, estado_viaje=? WHERE id = ?`;
        connection.query(query, [estado, estado_cancelacion, estado_viaje, id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const obtenerSoliSinCalificacionUsuario = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT s.idUser, s.idConductor, s.id
                            FROM solicitudes s
                            LEFT JOIN calificacion c ON s.id = c.viaje_id
                            WHERE s.estado = 'Finalizado' AND  s.idUser = ? AND c.viaje_id IS NULL;`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const obtenerSoliSinCalificacion = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT s.idUser, s.idConductor, s.id
                FROM solicitudes s
                LEFT JOIN calificaciones c 
                    ON s.id = c.id_viaje AND c.evaluador_id = ? 
                WHERE s.estado = 'Finalizado' and estado_viaje= 'Finalizado' and c.id IS NULL  
                AND EXISTS (
                    SELECT 1
                    FROM solicitudes sub_s
                    WHERE sub_s.estado = 'Finalizado' and estado_viaje= 'Finalizado' AND sub_s.idUser = ? OR sub_s.idConductor = ?
            );` , [id, id, id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });

}

const obtLisCali = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(` SELECT s.idUser, s.idConductor, s.id FROM cali_viaje c
            INNER JOIN  solicitudes s
            on c.idViaje = s.id
            where c.estado = 'A' AND c.idUser = ?` , [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });

}

const historial = (id, role, offset) => {
    return new Promise((resolve, reject) => {
        let column = role === "conductor" ? "idConductor" : "idUser";
        connection.query(`SELECT id, start_direction, end_direction, costo, fecha_hora
                        FROM solicitudes
                        WHERE ${column} = ?
                        ORDER BY fecha_hora DESC
                        LIMIT ?, 10; `, [id, parseInt(offset, 10)], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });

}

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
    updateEstadoViaje,
    finalizarViaje,
    guardarCalificacion,
    getCalificacion,
    updateRanting,
    obtenerSolicitud,
    obtenerSoliSinCalificacionUsuario,
    obtenerSoliSinCalificacion,
    historial, insertMoviBilletera,
    obtenerSiCalifico,
    obtenerSolicitudPendiente,
    guardarCali_previa,
    updateCali_viaje,
    obtLisCali,
    obtSMSDefinido,
    updateEstado,
    consultarCalificacion,
    buscarConductorViaje
}
