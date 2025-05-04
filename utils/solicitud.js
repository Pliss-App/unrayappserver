const haversine = require('haversine-distance');
const isController = require('../models/solicitud');

const findNearestDriver = async (start_lat, start_lng, idService) => {
        const conductoresIntentados = new Set();
        const origen = { lat: parseFloat(start_lat), lng: parseFloat(start_lng) };
        const conductoresDisponibles = await isController.conductores(idService);
       // console.log("LIDTAOD E CONDCUTOR ", conductoresDisponibles)
        const conductoresFiltrados = conductoresDisponibles
            .filter(conductor => !conductoresIntentados.has(conductor.id))
            .map(conductor => {
                const destino = { lat: parseFloat(conductor.lat), lng: parseFloat(conductor.lon) };
                const distancia = haversine(origen, destino); // Calcula la distancia
                return { ...conductor, distancia };
            })
            .sort((a, b) => a.distancia - b.distancia);

            return conductoresFiltrados;
}

const obtenerConductores = async(lat, lon, idService) => {
    const [rows] = await connection.query(
        `SELECT u.id, u.nombre, u.apellido, 
       u.telefono, u.foto, r.nombre as rol, u.estado,
       u.estado_usuario, l.lat, l.lon, u.socket_id FROM usuario u 
       inner join usuario_rol  ur
       on u.id = ur.iduser
       inner join roles r
       ON r.id = ur.idrol
       INNER JOIN location l
       ON u.id = l.iduser
       WHERE estado = 1 and estado_usuario = 'libre' AND idservice = ?`, [idService]);
       return rows
       .map((c) => ({
           ...c,
           distancia: calcularDistancia(lat, lon, c.lat, c.lon),
       }))
       .sort((a, b) => a.distancia - b.distancia);
}

module.exports = {findNearestDriver};