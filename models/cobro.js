const connection = require('../config/conexion');
const bcrypt = require('bcrypt');

const cobroApp = (total) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT  porApp, porCond FROM porapps
                where viaje_minimo <= ? AND viaje_maximo >= ?
                limit 1 `, [total, total], (err, rows) => {
            if (err) reject(err)
            resolve(rows[0])
        });
    });
};


const alladditionalCoste = () => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT *
            FROM costeTrafic;`, (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        });
    });
};

const additionalCoste = (trafic) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT coste  
            FROM costeTrafic 
            WHERE ? BETWEEN traffic_min AND traffic_max;`, 
            [trafic], (err, rows) => {
            if (err) reject(err)
            resolve(rows[0])
        });
    });
};

const createCoste = (traffic_min, traffic_max, coste) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO costeTrafic (traffic_min, traffic_max, coste) VALUES (?, ?, ?)`,
      [traffic_min, traffic_max, coste],
      (err, result) => {
        if (err) return reject(err);
        resolve({
          coste,
          message: "Registro creado correctamente"
        });
      }
    );
  });
};

const updateCoste = (traffic_min, traffic_max, coste, id) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE costeTrafic SET coste = ?, traffic_min = ?, traffic_max= ? WHERE id=? `,
      [coste, traffic_min, traffic_max, id],
      (err, result) => {
        if (err) return reject(err);

        if (result.affectedRows === 0) {
          return resolve({ message: "No se encontró registro para actualizar" });
        }

        resolve({
          trafficFactor,
          coste,
          message: "Registro actualizado correctamente"
        });
      }
    );
  });
};


const
    saldoBilletera = (id) => { //getByEmail
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

const agregarHistorialdebitos = (idUser, idViaje, costo, debitar, saldo_antes, saldo_despues,) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `insert into debitos_hist(idUser ,   	
                                        idViaje	,	
                                        costo_viaje	,
                                        costo_debito,	
                                        monto_antes ,	
                                        monto_despues
                                        ) values (?,?,?,?,?,?)`, [idUser, idViaje, costo, debitar, saldo_antes, saldo_despues], (err, rows) => {
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
    insertGanaDriver,
    additionalCoste,
    createCoste,
    updateCoste,
    alladditionalCoste
}