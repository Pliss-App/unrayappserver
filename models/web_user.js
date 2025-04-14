const connection = require('../config/conexion');
const bcrypt = require('bcrypt');

const beneficios = (modulo) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM beneficios WHERE modulo = ?`, [modulo], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const insertPasosAfiliacion = (paso, titulo, descripcion) => {
    return new Promise((resolve, reject) => {

        connection.query(`insert into pasosAfiliacionConductor (
        paso,
        titulo,
        descripcion 
            ) values (?,?,?)`, [paso, titulo, descripcion], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const updatePasosAfiliacion = (paso, titulo, descripcion, id) => {
    return new Promise((resolve, reject) => {
        connection.query(`update pasosAfiliacionConductor set  paso= ?,
        titulo=?,
        descripcion= ? where id = ?`, [paso, titulo, descripcion, id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const getPasosAfiliacion = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM pasosAfiliacionConductor`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const editPasosAfiliacion = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM pasosAfiliacionConductor where id = ? `, [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const banners = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM carousel`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const bannersId = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM carousel where id= ?`, [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}



const nosotros = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM nosotros`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

const requisitos = () => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT 
            s.nombre AS servicio,
            GROUP_CONCAT(r.titulo ORDER BY r.titulo SEPARATOR '/ ') AS requisitos,
            s.foto AS url
        FROM 
            servicios s
        right JOIN 
            requisitos r ON s.id = r.idservicio
        GROUP BY 
            s.id, s.nombre;`, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


const actualizarBanner = (id, datos) => {
    return new Promise((resolve, reject) => {
        const query = `
        UPDATE carousel
        SET titulo = ?, subtitulo = ?, descripcion = ?, modulo = ?, src = ?, tipomultimedia = ?
        WHERE id = ?
      `;
        const valores = [
            datos.titulo,
            datos.subtitulo,
            datos.descripcion,
            datos.modulo,
            datos.src,
            datos.tipomultimedia,
            id
        ];

        connection.query(query, valores, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


const getServices = () => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM servicios WHERE id != 5;", (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const updateServicios = (nombre, precio, foto, descuento, total_costo, estado, id) => { //getByEmail
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE servicios
            SET nombre = ?, precio = ?, foto = ?, descuento = ?, total_costo = ?, estado = ?
            WHERE id = ?;
        `;

        connection.query(query, [nombre, precio, foto, descuento, total_costo, estado, id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};


const getCrearCuenta = () => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM crearcuenta;", (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const insertIndicaCuenta = (titulo, descripcion, indicaciones, src) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "INSERT INTO crearcuenta (titulo, descripcion, indicaciones, src) VALUES (?, ?, ?, ?);", [titulo, descripcion, indicaciones, src], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const getIndicacionesCuenta = () => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM crearcuenta;", (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const updateIndicacionesCuenta = (titulo, descripcion, indicaciones, src, id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `UPDATE crearcuenta SET titulo= ?, descripcion=?, indicaciones= ?, src= ? WHERE id = ? ;`, [titulo, descripcion, indicaciones, src, id], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const getBeneficios = (modulo) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM beneficios WHERE modulo= ?;", [modulo], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const updateBeneficios = (titulo, descripcion, url, tamanio_columna, id, modulo) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `update beneficios set
titulo=?,  
descripcion=?,
url=?,
tamanio_columna =?   WHERE id= ? and modulo= ?`, [titulo, descripcion, url, tamanio_columna, id, modulo], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        });
    });
};

const insertBeneficios = (modulo, titulo, descripcion, url, tamanio_columna) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "INSERT INTO beneficios (modulo, titulo, descripcion, url, tamanio_columna) VALUES (?, ?, ?, ?, ?);", [modulo, titulo, descripcion, url, tamanio_columna], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};


module.exports = {
    beneficios,
    requisitos,
    nosotros,
    banners,
    bannersId,
    actualizarBanner,
    insertPasosAfiliacion,
    getPasosAfiliacion,
    editPasosAfiliacion,
    updatePasosAfiliacion,
    getServices,
    updateServicios,
    getCrearCuenta,
    insertIndicaCuenta,
    getIndicacionesCuenta,
    updateIndicacionesCuenta,
    getBeneficios,
    updateBeneficios,
    insertBeneficios
}
