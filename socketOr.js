const { Server } = require('socket.io');

let io;
const connectedDrivers = {};

function initializeSocketOr(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Conductor conectado:', socket.id);

        socket.on('registrar_conductor', (driverId) => {
            connectedDrivers[driverId] = socket.id;
        });

        socket.on('respuesta_solicitud', (data) => {
            io.emit(`respuesta_solicitud_${data.solicitudId}`, data);
        });

        socket.on('disconnect', () => {
            console.log('Conductor desconectado:', socket.id);
        });
    });
}

module.exports = { initializeSocketOr, io };
