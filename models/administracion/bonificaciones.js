const connection = require('../../config/conexion');
const bcrypt = require('bcrypt');

const filtrarRangoFechaViajes = (fech_ini, fech_final, codigo = null) => {
    return new Promise((resolve, reject) => {
        const ini = `${fech_ini} 00:00:00`;
        const fin = `${fech_final} 23:59:59`;

        const sql = `
            SELECT 
                s.idConductor, 
                u.codigo, 
                u.nombre, 
                u.apellido,
                u.id AS id_conductor,
                COUNT(s.id) AS totalViajes
            FROM usuario u
            INNER JOIN solicitudes s ON u.id = s.idConductor
            WHERE /*s.estado = 'Finalizado'
              AND*/ s.fecha_hora BETWEEN ? AND ?
              AND (? IS NULL OR u.codigo = ?)
            GROUP BY u.id;
        `;

        const params = [ini, fin, codigo, codigo];

        connection.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


const filtrarCodigoViajes = (codigo) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT 
                            s.idConductor, 
                            u.codigo, 
                            u.nombre, 
                            u.apellido,
                            u.id AS id_conductor,
                            COUNT(s.id) AS totalViajes
                            FROM usuario u
                            INNER JOIN solicitudes s 
                            ON u.id = s.idConductor
                            WHERE /* s.estado = "Finalizado"
                            AND*/ codigo= ?
                            GROUP BY u.id;`,
            [codigo],
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}


const filtrarRangoFechaTiempoUsuarios = (fech_ini, fech_final, codigo = null) => {
  return new Promise((resolve, reject) => {
    // Construimos los límites con hora para comparar fechas con tiempo
    const ini = fech_ini ? `${fech_ini} 00:00:00` : null;
    const fin = fech_final ? `${fech_final} 23:59:59` : null;

    const sql = `
      SELECT 
        u.id, 
        u.codigo, 
        u.nombre, 
        u.apellido, 
        u.telefono, 
        ur.idrol, 
        ur.idservice, 
        SUM(td.duracionsegundos) AS tiempo,
         u.ultconexion 
      FROM usuario u
      INNER JOIN usuario_rol ur ON u.id = ur.idUser
      INNER JOIN tiempoUsoDiario td ON u.id = td.idUser
      WHERE u.estado_eliminacion = 1
        AND ur.idrol = 2
        AND (
          (? IS NULL OR ? = '') 
          OR td.fecha >= ?
        )
        AND (
          (? IS NULL OR ? = '') 
          OR td.fecha <= ?
        )
        AND (
          (? IS NULL OR ? = '') 
          OR u.codigo = ?
        )
      GROUP BY u.id
      ORDER BY tiempo DESC;
    `;

    // Los parámetros según el orden en la consulta SQL:
    // Para la condición de td.fecha >= ?  --> ini, ini, ini
    // Para la condición de td.fecha <= ?  --> fin, fin, fin
    // Para la condición de código          --> codigo, codigo, codigo
    const params = [ini, ini, ini, fin, fin, fin, codigo, codigo, codigo];

    connection.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const insertarNotificacion = (notificacion) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO notificaciones_recurrentes 
      (rol, titulo, cuerpo, hora_inicio, intervalo_tipo, intervalo_valor, veces, estado) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      notificacion.rol,
      notificacion.titulo,
      notificacion.cuerpo,
      notificacion.hora_inicio,
      notificacion.intervalo_tipo,
      notificacion.intervalo_valor,
      notificacion.veces,
      notificacion.estado || 'activo'
    ];

    connection.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, ...notificacion });
    });
  });
};

const obtenerNotificaciones = (id = null) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM notificaciones_recurrentes 
      ${id ? 'WHERE id = ?' : ''}
      ORDER BY creado_en DESC
    `;
    const params = id ? [id] : [];

    connection.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const actualizarNotificacion = (id, datos) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE notificaciones_recurrentes 
      SET rol = ?, titulo = ?, cuerpo = ?, hora_inicio = ?, intervalo_tipo = ?, 
          intervalo_valor = ?, veces = ?, estado = ?
      WHERE id = ?
    `;
    const params = [
      datos.rol,
      datos.titulo,
      datos.cuerpo,
      datos.hora_inicio,
      datos.intervalo_tipo,
      datos.intervalo_valor,
      datos.veces,
      datos.estado,
      id
    ];

    connection.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve({ actualizado: result.affectedRows > 0 });
    });
  });
};

const eliminarNotificacion = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM notificaciones_recurrentes WHERE id = ?`;

    connection.query(sql, [id], (err, result) => {
      if (err) return reject(err);
      resolve({ eliminado: result.affectedRows > 0 });
    });
  });
};


module.exports = {
    filtrarRangoFechaViajes,
    filtrarCodigoViajes,
    filtrarRangoFechaTiempoUsuarios,
    insertarNotificacion,
    eliminarNotificacion,
    actualizarNotificacion,
    obtenerNotificaciones
}