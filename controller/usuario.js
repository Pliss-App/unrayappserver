const connection = require('../mysql');
const bcrypt = require('bcrypt');

const getServices = () => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM Servicios WHERE 1", (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const insertComercio = (_code, _nombre, _id_tipcomercio) => { //
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO Comercio(code, nombre, id_tipcomercio) VALUES (${connection.escape(_code)}, ${connection.escape(_nombre)}, ${connection.escape(_id_tipcomercio)})`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const register=(uid, name, email, pass, date_created, id_type) =>{
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO user(uid, name, email, pass, date_created, id_type) VALUES (${connection.escape(uid)}, ${connection.escape(name)}, ${connection.escape(email)}, ${connection.escape(pass)}, ${connection.escape(date_created)}, ${connection.escape(id_type)})`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

module.exports = {
    register
}