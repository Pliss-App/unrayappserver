const connection = require('../config/conexion');


const comparaCode = (code) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT code FROM Comercio WHERE code=?",[code], (err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
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

module.exports = {
    comparaCode,
    insertComercio
}