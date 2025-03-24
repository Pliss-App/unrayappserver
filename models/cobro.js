const connection = require('../config/conexion');
const bcrypt = require('bcrypt');


const cobroApp = (code) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT  porApp, porCond FROM porapps", [code], (err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const saldoBilletera = (id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `select idUser, b.saldo from billetera b
            inner join usuario  u
            on b.idUser = u.id
            WHERE b.idUser =?`, [id], (err, rows) => {
            if (err) reject(err)
            resolve(rows[0])
        });
    });
};

const actualizarBilletera = (id, saldo) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `UPDATE billetera set saldo = ? where idUser = ? `, [saldo, id], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const agregarHistorialPagos = (idViaje, monto) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `insert into hispagos(idViaje, monto) values (?,?)`, [idViaje, monto], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const agregarHistorialdebitos = (idUser, idViaje, costo, debitar, saldo_antes, saldo_despues, ) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `insert into debitos_hist(idUser ,   	
                                        idViaje	,	
                                        costo_viaje	,
                                        costo_debito,	
                                        monto_antes ,	
                                        monto_despues
                                        ) values (?,?,?,?,?,?)`, [idUser, idViaje, costo, debitar, saldo_antes,saldo_despues], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        });
    });
};

const insertGanaDriver = (idUser, idViaje, gana, fecha, hora) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO GanaDriver(idUser, idViaje, ganancia, fecha, hora) 
                           VALUES (?, ?, ?, ?, ?);`, [idUser, idViaje, gana, fecha, hora], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

module.exports = {
    cobroApp,
    saldoBilletera,
    actualizarBilletera,
    agregarHistorialPagos,
    agregarHistorialdebitos,
    insertGanaDriver 
}