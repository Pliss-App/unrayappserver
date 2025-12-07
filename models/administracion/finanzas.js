const connection = require('../../config/conexion');
const bcrypt = require('bcrypt');

const getTotalSinFiltros = (fecha_ini, fecha_fin) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT 
    UPPER(t.tipo_operacion) AS tipo_operacion,
    COALESCE(SUM(tb.total), 0) AS total,
    COALESCE(SUM(tb.monto), 0) AS monto_total
FROM (
    SELECT 'bono' AS tipo_operacion
    UNION ALL
    SELECT 'deposito'
) AS t
LEFT JOIN (
    SELECT 
        LOWER(tipo_operacion) AS tipo_operacion,
        COUNT(*) AS total,
        SUM(monto) AS monto
    FROM transaccion_billetera
    WHERE 
        (
            ('${fecha_ini}' IS NULL 
                OR fecha_carga >= STR_TO_DATE('${fecha_ini}', '%d/%m/%Y')
            )
            AND
            ('${fecha_fin}' IS NULL 
                OR fecha_carga <= STR_TO_DATE('${fecha_fin}', '%d/%m/%Y')
            )
        )
    GROUP BY LOWER(tipo_operacion)
) AS tb
ON t.tipo_operacion = tb.tipo_operacion
GROUP BY t.tipo_operacion;

`,
            (err, result) => {
                if (err) reject(err)
                resolve(result)
            })
    });
}

module.exports = {
    getTotalSinFiltros
}
