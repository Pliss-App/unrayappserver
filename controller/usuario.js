const connection = require('../mysql');
const bcrypt = require('bcrypt');

const getUser = (uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT u.*, ud.photoURL, ud.idphotoURL FROM user u INNER JOIN user_detail ud ON u.id=ud.idUser  WHERE u.uid=?",[uid],(err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const getUserDetail = (uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT uid , name, last_name, phoneNumber, gender, email FROM user_detail  WHERE uid= ?",[uid],(err, rows) => {
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

const updateTableUser = ( uid) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE user, user_detail SET user.name=  CONCAT(user_detail.name, ' ', user_detail.last_name), user.email = user_detail.email WHERE user_detail.uid = ?;",[uid],(err, rows) => {
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

const insertUserDetail=(body) =>{
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO user_detail SET ?`,[body], (err, result) => {
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
    getUserDetail
}