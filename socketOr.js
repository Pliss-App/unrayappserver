const { Server } = require('socket.io');

let io;
const connectedDrivers = {}; 
const connectedUsers = {};

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
            io.emit(`respuesta_solicitud_${data.solicitudId}`, data);
        });

        socket.on('disconnect', () => {
            console.log('Conductor desconectado:', socket.id);

            for (const driverId in connectedDrivers) {
                if (connectedDrivers[driverId] === socket.id) {
                    delete connectedDrivers[driverId];
                    console.log(`Conductor eliminado: ${driverId}`);
                    break;
                }
            }

            for (const userId in connectedUsers) {
                if (connectedUsers[userId] === socket.id) {
                    delete connectedUsers[userId];
                    console.log(`Usuario eliminado: ${userId}`);
                    break;
                }
            }
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

module.exports = { initializeSocketOr, getIO, connectedDrivers,    connectedUsers };
