const haversine = require('haversine-distance');
const isController = require('../models/solicitud');
const condController = require('../models/conductor');


const findNearestDriver = async (start_lat, start_lng, idService) => {
    const conductoresIntentados = new Set();
    const origen = { lat: parseFloat(start_lat), lng: parseFloat(start_lng) };
    const saldo = await condController.getSaldoMinimoConductores();
    const conductoresDisponibles = await isController.conductores(idService, saldo.saldo);
    // console.log("LIDTAOD E CONDCUTOR ", conductoresDisponibles)
    const conductoresFiltrados = conductoresDisponibles
        .filter(conductor => !conductoresIntentados.has(conductor.id))
        .map(conductor => {
            const destino = { lat: parseFloat(conductor.lat), lng: parseFloat(conductor.lon) };
            const distancia = haversine(origen, destino); // Calcula la distancia
            const distanciaKm = distancia / 1000;
            const km = distanciaKm.toFixed(2);
            return { ...conductor, km };
        })
        .filter(conductor => conductor.km < 3)
        .sort((a, b) => a.km - b.km);
    return conductoresFiltrados;
}

const findNearestDriverListar = async (start_lat, start_lng, idService) => {
    const conductoresIntentados = new Set();
    const origen = { lat: parseFloat(start_lat), lng: parseFloat(start_lng) };
    const saldo = await condController.getSaldoMinimoConductores();
    const conductoresDisponibles = await isController.conductoreslist(idService, saldo.saldo);
    // console.log("LIDTAOD E CONDCUTOR ", conductoresDisponibles)
    const conductoresFiltrados = conductoresDisponibles
        .filter(conductor => !conductoresIntentados.has(conductor.id))
        .map(conductor => {
            const destino = { lat: parseFloat(conductor.lat), lng: parseFloat(conductor.lon) };
            const distancia = haversine(origen, destino); // Calcula la distancia
            const distanciaKm = distancia / 1000;
            const km = distanciaKm.toFixed(2);
            return { ...conductor, km };
        })
        .filter(conductor => conductor.km < 3)
        .sort((a, b) => a.km - b.km);
    return conductoresFiltrados;
}

module.exports = { findNearestDriver, findNearestDriverListar };