const connection = require('../mysql');
const bcrypt = require('bcrypt');

const getUser = (uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT u.*, CASE WHEN  ud.idUser IS NULL THEN "editar" ELSE ud.idUser END idUser,ud.name, ud.last_name, ud.phoneNumber, ud.photoURL,ud.gender, ud.email, ud.idphotoURL FROM user u LEFT JOIN user_detail ud ON u.id=ud.idUser  WHERE u.uid=?`,[uid],(err, rows) => {
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

const updateLogin = (lastLoginAt,lastSignInTime, uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE user_detail SET lastLoginAt=?, lastSignInTime= ? WHERE uid=?",[lastLoginAt,lastSignInTime,uid],(err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const updateUser = (name, last_name, gender,email, uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE user_detail SET name= ?, last_name=?, gender=?, email=? WHERE uid=? ;",[name, last_name, gender,email,uid],(err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const updatePhotoUser = (photoURL ,idphotoURL, uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE user_detail SET photoURL=? ,idphotoURL=? WHERE uid= ?",[photoURL ,idphotoURL,uid],(err, rows) => {
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


const register=(uid, name, email, pass, date_created, id_type) =>{
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO user(uid, name, email, pass, date_created, id_type) VALUES (${connection.escape(uid)}, ${connection.escape(name)}, ${connection.escape(email)}, ${connection.escape(pass)}, ${connection.escape(date_created)}, ${connection.escape(id_type)})`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const insertUserDetail=(idUser, uid, name, last_name, gender, photoURL, idphotoURL, phoneNumber, email, emailVerified, providerId, createdAt, creationTime, lastLoginAt, lastSignInTime) =>{
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO user_detail(idUser, uid, name, last_name, gender, photoURL, idphotoURL, phoneNumber, email, emailVerified, providerId, createdAt, creationTime, lastLoginAt, lastSignInTime) VALUES (${connection.escape(idUser)}, ${connection.escape(uid)}, ${connection.escape(name)}, ${connection.escape(last_name)}, ${connection.escape(gender)}, ${connection.escape(photoURL)}, ${connection.escape(idphotoURL)}, ${connection.escape(phoneNumber)}, ${connection.escape(email)}, ${connection.escape(emailVerified)}, ${connection.escape(providerId)}, ${connection.escape(createdAt)}, ${connection.escape(creationTime)}, ${connection.escape(lastLoginAt)}, ${connection.escape(lastSignInTime)})`,(err, result) => {
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

module.exports = {
    register,
    getUser,
    insertUserDetail,
    updateLogin,
    updateUser,
    updateTableUser,
    getUserDetail,
    getUserDet,
    updatePhotoUser,
    insertAddressFavorite,
    getUserBy
}