const { Server } = require('socket.io');

let io;
const connectedDrivers = {};
const connectedUsers = {};
const respuestasSolicitudes = {};

function initializeSocketOr(server) {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
        path: '/api/socket/',
    });

    io.on('connection', (socket) => {

        socket.on('registrar_conductor', (driverId) => {
            connectedDrivers[driverId] = socket.id;
        });

        socket.on('registrar_usuario', (userId) => {
            connectedUsers[userId] = socket.id;
        });

        socket.on('respuesta_solicitud', (data) => {
            const eventName = `respuesta_solicitud_${data.solicitudId}`;
            //console.log(`📢 Emitiendo respuesta de la solicitud: ${eventName}`, data);
        
            // Guardar respuesta
            respuestasSolicitudes[data.solicitudId] = data;
        
            // Emitir solo al usuario correspondiente
            if (connectedUsers[data.idUser]) {
                io.to(connectedUsers[data.idUser]).emit(eventName, data);
            }
        });

        socket.on('disconnect', () => {
            console.log('Conductor desconectado:', socket.id);
        });
    });
}

// ✅ Función para obtener `io` cuando se necesite
function getIO() {
    if (!io) {
        throw new Error('Socket.io no ha sido inicializado.');
    }
    return io;
}

module.exports = { initializeSocketOr, getIO, connectedDrivers, connectedUsers, respuestasSolicitudes };
