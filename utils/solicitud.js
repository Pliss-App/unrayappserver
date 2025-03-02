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
module.exports = {findNearestDriver};