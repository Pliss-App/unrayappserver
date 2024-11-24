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

const getLogin = (_valor) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT u.id as idUser, r.id as idRol, u.foto, u.estado, r.nombre as rol, u.nombre, u.apellido, u.password, u.correo, u.telefono, u.created_at FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.iduser INNER JOIN roles r  ON ur.idrol = r.id WHERE LOWER(u.correo) = LOWER(?)OR u.telefono = ?", [_valor, _valor], (err, rows) => {
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
            "SELECT u.id as idUser, r.id as idRol, u.foto, r.nombre as rol, u.nombre, u.apellido, u.password, u.correo, u.telefono, u.created_at FROM usuario u INNER JOIN usuario_rol ur ON u.id = ur.iduser INNER JOIN roles r  ON ur.idrol = r.id WHERE u.id =  ?", [_valor], (err, rows) => {
            if (err) {
                console.error('Error getting record:', err); // Registro del error en el servidor
                return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
            }
            resolve(rows[0]);
        });
    });
};

const createUser = (userData) => { //getByEmail
    const {nombre, apellido, telefono, correo, password } = userData;

    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO usuario (nombre, apellido, telefono, correo, foto, password, reset_token, estado, reset_token_expiration)
               VALUES (?, ?, ?, ?, ?, ?, ?,?)`, [nombre.toUpperCase(), apellido.toUpperCase(), telefono, correo.toUpperCase(), null, password, null, true, null], (err, rows) => {
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
            `INSERT INTO location(iduser, lat, lon) VALUES (?, ?, ?)`, [idUser, 0,0], (err, rows) => {
            if (err) {
                console.error('Error en la consulta a la base de datos:', err); // Registro del error en el servidor
                return reject(new Error('Error al crear la cuenta')); // Rechazo con un mensaje de error personalizado
            }
            resolve(rows)
        });
    });
};

const updateLocationConductor = (userData) => { 
    const {iduser, lat, lon} = userData;
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE location SET lat=?, lon= ? WHERE id=?",[lat, lon, iduser],(err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};


const createUserDriver = (userData) => { //getByEmail
    const {nombre, apellido, telefono, correo, password } = userData;

    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO usuario (nombre, apellido, telefono, correo, foto, password, reset_token, estado, reset_token_expiration)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [nombre.toUpperCase(), apellido.toUpperCase(), telefono, correo.toUpperCase(), null, password, null, false, null], (err, rows) => {
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

const getUser = (uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT u.*, CASE WHEN  ud.idUser IS NULL THEN "editar" ELSE ud.idUser END idUser,  ud.photoURL, ud.idphotoURL, tu.ref FROM user u LEFT JOIN user_detail ud ON u.id=ud.idUser INNER JOIN type_user tu ON u.id_type = tu.id  WHERE u.uid=?`,[uid],(err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const getUserDet = (uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT u.*, CASE WHEN  ud.idUser IS NULL THEN "editar" ELSE ud.idUser END idUser,ud.name, ud.last_name, ud.phoneNumber, ud.photoURL,ud.gender, ud.email, ud.idphotoURL FROM user u LEFT JOIN user_detail ud ON u.id=ud.idUser  WHERE u.uid=?`,[uid],(err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const getUserBy = (uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT id FROM user WHERE uid=?",[uid],(err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const getUserDetail = (uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT u.id, u.uid, CASE WHEN  ud.idUser IS NULL THEN "editar" ELSE ud.idUser END idUser, ud.photoURL, ud.idphotoURL, ud.uid, ud.name, ud.last_name, ud.phoneNumber, ud.gender, ud.email  FROM user u LEFT JOIN user_detail ud ON u.id=ud.idUser  WHERE u.uid=?`,[uid],(err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const getFoto = (id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT foto FROM usuario WHERE id=?`,[id],(err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const updateLogin = (lastLoginAt,lastSignInTime, uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE user_detail SET lastLoginAt=?, lastSignInTime= ? WHERE uid=?",[lastLoginAt,lastSignInTime,uid],(err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const updateFoto = (id, foto) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE usuario SET foto= ? WHERE id=?",[foto, id],(err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};


const updateUser = (nombre, apellido,  telefono, correo, id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE usuario SET nombre= ?, apellido=?, correo=?, telefono=? WHERE id=? ;",[nombre.toUpperCase(), apellido.toUpperCase(), correo.toUpperCase(),  telefono, id],(err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const updatePhotoUser = (base64photo, photoURL ,idphotoURL, uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE user_detail SET base64photo= ?, photoURL=? ,idphotoURL=? WHERE uid= ?",[base64photo, photoURL ,idphotoURL,uid],(err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const updateTableUser = (name, last_name, email, uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `UPDATE user SET name=  CONCAT(?, ' ', ?), email = ? WHERE uid = ?;`, [name, last_name, email, uid],(err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};


const register=(uid, name, email, pass, id_status, idStatus_travel, date_created, id_type, idService) =>{
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
            `SELECT * FROM documentacion WHERE iduser=?`,[id],(err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};


const getLocationUser = (uid) => { 
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT idUser FROM location WHERE uid=?`,[uid],(err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const getPhotoProfile = (uid) => { 
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT base64photo FROM user_detail WHERE  uid= ?`,[uid],(err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const updateLocation = (uid, lat, lng) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `UPDATE location SET lat=?, lng=?, location =POINTFROMTEXT('POINT(${connection.escape(lat)} ${connection.escape(lng)})') WHERE uid=?`, [lat, lng, uid],(err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};


const registerLocation=(idUser, uid, lat, lng) =>{
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO location (idUser, uid, lat, lng, location) VALUES (${connection.escape(idUser)},${connection.escape(uid)},${connection.escape(lat)},${connection.escape(lng)},POINTFROMTEXT('POINT(${connection.escape(lat)} ${connection.escape(lng)})'))`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const insertUserDetail=(idUser, uid, name, last_name, gender, base64photo, photoURL, idphotoURL, phoneNumber, email, emailVerified, providerId, createdAt, creationTime, lastLoginAt, lastSignInTime) =>{
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO user_detail(idUser, uid, name, last_name, gender, base64photo, photoURL, idphotoURL, phoneNumber, email, emailVerified, providerId, createdAt, creationTime, lastLoginAt, lastSignInTime) VALUES (${connection.escape(idUser)}, ${connection.escape(uid)}, ${connection.escape(name)}, ${connection.escape(last_name)}, ${connection.escape(gender)}, ${connection.escape(base64photo)}, ${connection.escape(photoURL)}, ${connection.escape(idphotoURL)}, ${connection.escape(phoneNumber)}, ${connection.escape(email)}, ${connection.escape(emailVerified)}, ${connection.escape(providerId)}, ${connection.escape(createdAt)}, ${connection.escape(creationTime)}, ${connection.escape(lastLoginAt)}, ${connection.escape(lastSignInTime)})`,(err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const insertAddressFavorite=(_idUser, _uid, _address, _lat, _lng, _idtAddres) =>{
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
            `SELECT tu.id idSer,  u.uid,  tu.ref FROM user as u INNER JOIN type_user as tu on u.id_type = tu.id WHERE u.uid=?`,[uid],(err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
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
    getPhotoProfile,
    getUserRol,
    getFoto,
    refreshLogin,
    createUserDriver,
    getDocumentacionUser,
    insertLocation,
    updateLocationConductor 

}