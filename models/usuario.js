const connection = require('../config/conexion');

const getUserTelfonoEmail = (_valor) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM usuario WHERE correo = ? OR telefono = ?", [_valor, _valor], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0]);
            });
    });
};


const getRating = (id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT total_viajes, rating FROM usuario WHERE id = ?", [id], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0]);
            });
    });
};


const getEstado = (id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT estado FROM usuario WHERE id = ?", [id], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0]);
            });
    });
};

const updateEstado = (id, estado) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "update usuario set estado = ? WHERE id = ?", [estado, id], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows);
            });
    });
};




const updateUsuarioPass = (token, expiration, _id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE usuario SET reset_token = ?, reset_token_expiration = ? WHERE correo = ? OR telefono = ?", [token, expiration, _id, _id], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0]);
            });
    });
};


const getPassword = (token) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM usuario WHERE reset_token = ? AND reset_token_expiration > NOW()", [token], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0]);
            });
    });
};

const updatePasswordNew  = (password, id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE usuario SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE id = ?", [password, id], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0]);
            });
    });
};



const iconMarker = (_id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT s.id, CASE 
            WHEN s.nombre = 'Moto Ray' THEN 'moto'
            WHEN s.nombre IN ('Un Ray', 'Ray Plus') THEN 'carro'
            ELSE s.nombre 
            END AS nombre FROM usuario u
            INNER JOIN usuario_rol ur
            on u.id = ur.iduser
            INNER JOIN servicios s
            on ur.idservice = s.id 
            WHERE u.id = ?`, [_id],
            (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0]);
            });
    });
};

const getLogin = (_valor) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `   SELECT 
    u.id AS idUser, 
    r.id AS idRol, 
    u.foto, 
    u.estado, 
    r.nombre AS rol, 
    u.nombre, 
    u.apellido, 
    u.password, 
    u.correo, 
    u.telefono,  
    u.verificacion,
    CASE 
        WHEN s.nombre = 'moto ray' THEN 'moto'
        WHEN s.nombre IN ('Un ray', 'Plus ray') THEN 'carro'
        ELSE s.nombre 
    END AS marker,  
    u.created_at,
    -- Determinar tipo de usuario
    CASE 
        WHEN r.nombre = 'conductor' AND s.id IS NOT NULL THEN 'conductor'
        ELSE 'usuario normal'
    END AS tipo_usuario
FROM usuario u 
INNER JOIN usuario_rol ur 
    ON u.id = ur.iduser 
INNER JOIN roles r  
    ON ur.idrol = r.id 
LEFT JOIN servicios s 
    ON ur.idservice = s.id  
WHERE (LOWER(u.correo) = LOWER(?)OR u.telefono = ?) and u.estado_eliminacion = 1`, [_valor, _valor], (err, rows) => {
            if (err) {
                console.error('Error getting record:', err); // Registro del error en el servidor
                return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
            }
            resolve(rows[0]);
        });
    });
};


const refreshLogin = (_valor) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT u.id as idUser, r.id as idRol, u.foto, r.nombre as rol, u.nombre, u.apellido, u.password, u.correo, u.telefono, u.verificacion, u.created_at FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.iduser INNER JOIN roles r  ON ur.idrol = r.id WHERE u.id =  ?", [_valor], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0]);
            });
    });
};

const createUser = (userData) => { //getByEmail
    const { nombre, apellido, telefono, correo, password } = userData;

    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO usuario (nombre, 
            apellido, telefono, correo, 
            foto, password, reset_token, 
            estado, total_viajes, rating, onesignal_token, estado_usuario, reset_token_expiration
            , socket_id)
               VALUES (?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?)`,
                [nombre.toUpperCase(), 
                    apellido.toUpperCase(), 
                    telefono, 
                    correo.toUpperCase(), 
                    null, 
                    password, 
                    null, 
                    true, 
                    0,
                    0,
                    null,
                    'libre',
                    null,
                null], (err, rows) => {
            if (err) {
                console.error('Error en la consulta a la base de datos:', err); // Registro del error en el servidor
                return reject(new Error('Error al crear la cuenta')); // Rechazo con un mensaje de error personalizado
            }
            resolve(rows)
        });
    });
};

const insertLocation = (idUser) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO location(iduser, lat, lon) VALUES (?, ?, ?)`, [idUser, 0, 0], (err, rows) => {
                if (err) {
                    console.error('Error en la consulta a la base de datos:', err); // Registro del error en el servidor
                    return reject(new Error('Error al crear la cuenta')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows)
            });
    });
};


const insertNotaSoporte = (idUser, titulo, mensaje) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO soporteusuario(idUser, titulo, mensaje, estado) VALUES (?, ?, ?, ?)`, [idUser, titulo, mensaje, 'Revisión'], (err, rows) => {
                if (err) {
                    console.error('Error en la consulta a la base de datos:', err); // Registro del error en el servidor
                    return reject(new Error('Error al crear la cuenta')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows)
            });
    });
};


const insertBilletera = (idUser) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO billetera(iduser, saldo, reserva) VALUES (?, ?, ?)`, [idUser, 0, 0], (err, rows) => {
                if (err) {
                    console.error('Error en la consulta a la base de datos:', err); // Registro del error en el servidor
                    return reject(new Error('Error al crear la cuenta')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows)
            });
    });
};


const insertVehiculo = (idUser) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO detalle_vehiculo(idUser, placas, modelo, color) VALUES (?, ?, ?, ?)`, [idUser, '', '', ''], (err, rows) => {
                if (err) {
                    console.error('Error en la consulta a la base de datos:', err); // Registro del error en el servidor
                    return reject(new Error('Error al crear la cuenta')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows)
            });
    });
};

const insertLocationDireUser = (idUser) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO usuario_location(idUser, identificador, direccion, municipio, departamento, pais) VALUES (?, ?, ?, ,?, ?)`, [idUser, '', '', ''], (err, rows) => {
                if (err) {
                    console.error('Error en la consulta a la base de datos:', err); // Registro del error en el servidor
                    return reject(new Error('Error al crear la cuenta')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows)
            });
    });
};



const updateLocationConductor = (iduser, lat, lon, angle) => {

    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE location SET lat=?, lon= ?, angle =? WHERE iduser=?", [lat, lon, angle ,iduser], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const updateSocketIO = (iduser, id) => {
    // const { iduser, lat, lon, angle } = userData;
     return new Promise((resolve, reject) => {
         connection.query(
             "UPDATE usuario SET socket_id=?  WHERE id=?", [id, iduser], (err, rows) => {
                 if (err) reject(err)
                 resolve(rows)
             });
     });
 };
 


const createUserDriver = (userData) => { //getByEmail
    const { nombre, apellido, telefono, correo, password } = userData;

    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO usuario (nombre, 
            apellido, telefono, correo, 
            foto, password, reset_token, 
            estado, total_viajes, rating, onesignal_token, estado_usuario, reset_token_expiration
            , socket_id)
               VALUES (?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?)`, 
               [nombre.toUpperCase(), apellido.toUpperCase(), 
                telefono, correo.toUpperCase(), null, 
                password, null, 
                false, 0, 0, null, 'libre',null, null], (err, rows) => {
            if (err) {
                console.error('Error en la consulta a la base de datos:', err); // Registro del error en el servidor
                return reject(new Error('Error al crear la cuenta')); // Rechazo con un mensaje de error personalizado
            }
            resolve(rows)
        });
    });
};

const agregarRol = (idUser, idservice) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO usuario_rol (iduser, idrol, idservice)
               VALUES (?, ?, ?)`, [idUser, 2, idservice], (err, rows) => {
            if (err) {
                console.error('Error al guardar registro:', err); // Registro del error en el servidor
                return reject(new Error('Error al agregar Rol')); // Rechazo con un mensaje de error personalizado
            }
            resolve(rows)
        });
    });
};

const agregarRolUser = (idUser, idservice) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO usuario_rol (iduser, idrol, idservice)
               VALUES (?, ?, ?)`, [idUser, 1, idservice], (err, rows) => {
            if (err) {
                console.error('Error al guardar registro:', err); // Registro del error en el servidor
                return reject(new Error('Error al agregar Rol')); // Rechazo con un mensaje de error personalizado
            }
            resolve(rows)
        });
    });
};

const getUser = (uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT u.*, CASE WHEN  ud.idUser IS NULL THEN "editar" ELSE ud.idUser END idUser,  ud.photoURL, ud.idphotoURL, tu.ref FROM user u LEFT JOIN user_detail ud ON u.id=ud.idUser INNER JOIN type_user tu ON u.id_type = tu.id  WHERE u.uid=?`, [uid], (err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const getUserDet = (uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT u.*, CASE WHEN  ud.idUser IS NULL THEN "editar" ELSE ud.idUser END idUser,ud.name, ud.last_name, ud.phoneNumber, ud.photoURL,ud.gender, ud.email, ud.idphotoURL FROM user u LEFT JOIN user_detail ud ON u.id=ud.idUser  WHERE u.uid=?`, [uid], (err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const getUserBy = (uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT id FROM user WHERE uid=?", [uid], (err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const getUserDetail = (uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT u.id, u.uid, CASE WHEN  ud.idUser IS NULL THEN "editar" ELSE ud.idUser END idUser, ud.photoURL, ud.idphotoURL, ud.uid, ud.name, ud.last_name, ud.phoneNumber, ud.gender, ud.email  FROM user u LEFT JOIN user_detail ud ON u.id=ud.idUser  WHERE u.uid=?`, [uid], (err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const getFotoUser = (uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT foto from usuario WHERE id=?`, [uid], (err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};


const perfilCalificacion = (uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `select nombre, apellido, foto from usuario where id= ?`, [uid], (err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const getFoto = (id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT foto FROM usuario WHERE id=?`, [id], (err, rows) => {
                if (err) reject(err)
                      // Si no hay filas, devuelve un valor predeterminado (null, o lo que prefieras)
                if (rows.length === 0) {
                    return resolve(null); // O puedes poner algún valor predeterminado
                }

                resolve(rows[0])
            });
    });
};

const updateLogin = (lastLoginAt, lastSignInTime, uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE user_detail SET lastLoginAt=?, lastSignInTime= ? WHERE uid=?", [lastLoginAt, lastSignInTime, uid], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const updateFoto = (id, foto) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE usuario SET foto= ? WHERE id=?", [foto, id], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};


const updateUser = (nombre, apellido, telefono, correo, id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE usuario SET nombre= ?, apellido=?, correo=?, telefono=? WHERE id=? ;", [nombre.toUpperCase(), apellido.toUpperCase(), correo.toUpperCase(), telefono, id], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const updatePhotoUser = (base64photo, photoURL, idphotoURL, uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE user_detail SET base64photo= ?, photoURL=? ,idphotoURL=? WHERE uid= ?", [base64photo, photoURL, idphotoURL, uid], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const updateTableUser = (name, last_name, email, uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `UPDATE user SET name=  CONCAT(?, ' ', ?), email = ? WHERE uid = ?;`, [name, last_name, email, uid], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};


const register = (uid, name, email, pass, id_status, idStatus_travel, date_created, id_type, idService) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO user(uid, name, email, pass, id_status, idStatus_travel, date_created, id_type, idService) VALUES (${connection.escape(uid)}, ${connection.escape(name)}, ${connection.escape(email)}, ${connection.escape(pass)}, ${connection.escape(id_status)}, ${connection.escape(idStatus_travel)}, ${connection.escape(date_created)}, ${connection.escape(id_type)}, ${connection.escape(idService)})`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const getDocumentacionUser = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT * FROM documentacion WHERE iduser=?`, [id], (err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};


const getLocationUser = (uid) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT idUser FROM location WHERE uid=?`, [uid], (err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const getPhotoProfile = (uid) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT base64photo FROM user_detail WHERE  uid= ?`, [uid], (err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const updateLocation = (uid, lat, lng) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `UPDATE location SET lat=?, lng=?, location =POINTFROMTEXT('POINT(${connection.escape(lat)} ${connection.escape(lng)})') WHERE uid=?`, [lat, lng, uid], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};


const registerLocation = (idUser, uid, lat, lng) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO location (idUser, uid, lat, lng, location) VALUES (${connection.escape(idUser)},${connection.escape(uid)},${connection.escape(lat)},${connection.escape(lng)},POINTFROMTEXT('POINT(${connection.escape(lat)} ${connection.escape(lng)})'))`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const insertUserDetail = (idUser, uid, name, last_name, gender, base64photo, photoURL, idphotoURL, phoneNumber, email, emailVerified, providerId, createdAt, creationTime, lastLoginAt, lastSignInTime) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO user_detail(idUser, uid, name, last_name, gender, base64photo, photoURL, idphotoURL, phoneNumber, email, emailVerified, providerId, createdAt, creationTime, lastLoginAt, lastSignInTime) VALUES (${connection.escape(idUser)}, ${connection.escape(uid)}, ${connection.escape(name)}, ${connection.escape(last_name)}, ${connection.escape(gender)}, ${connection.escape(base64photo)}, ${connection.escape(photoURL)}, ${connection.escape(idphotoURL)}, ${connection.escape(phoneNumber)}, ${connection.escape(email)}, ${connection.escape(emailVerified)}, ${connection.escape(providerId)}, ${connection.escape(createdAt)}, ${connection.escape(creationTime)}, ${connection.escape(lastLoginAt)}, ${connection.escape(lastSignInTime)})`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const insertAddressFavorite = (_idUser, _uid, _address, _lat, _lng, _idtAddres) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO addressFavorite(idUser, uid, address, lat, lng, idtAddres) VALUES (${connection.escape(_idUser)},${connection.escape(_uid)}, ${connection.escape(_address)}, ${connection.escape(_lat)}, ${connection.escape(_lng)}, ${connection.escape(_idtAddres)})`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const getUserRol = (uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT tu.id idSer,  u.uid,  tu.ref FROM user as u INNER JOIN type_user as tu on u.id_type = tu.id WHERE u.uid=?`, [uid], (err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};




const eliminarCuenta = (idUser) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `UPDATE usuario SET correo = CONCAT('deleted_', ? , '@email.com'), telefono = NULL, estado_eliminacion= 0 WHERE id = ?`, [idUser, idUser], (err, rows) => {
                if (err) {
                    console.error('Error en la consulta a la base de datos:', err); // Registro del error en el servidor
                    return reject(new Error('Error al eliminar cuenta')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows)
            });
    });
};



module.exports = {
    getUserTelfonoEmail,
    createUser,
    agregarRol,
    updateFoto,
    getLogin,
    getUser,
    insertUserDetail,
    updateLogin,
    updateUser,
    updateTableUser,
    getUserDetail,
    getUserDet,
    updatePhotoUser,
    insertAddressFavorite,
    getUserBy,
    registerLocation,
    getLocationUser,
    updateLocation,
    insertBilletera,
    getPhotoProfile,
    getUserRol,
    getFoto,
    refreshLogin,
    createUserDriver,
    getDocumentacionUser,
    insertLocation,
    updateLocationConductor,
    iconMarker,
    updateUsuarioPass,
    updatePasswordNew,
    getPassword,
    updateSocketIO ,
    getFotoUser,
    perfilCalificacion,
    insertVehiculo,
    getEstado,
    updateEstado,
    agregarRolUser,
    getRating,
    insertNotaSoporte,
    eliminarCuenta

}