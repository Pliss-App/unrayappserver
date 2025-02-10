const { Server } = require('socket.io');

let io;
const connectedDrivers = {}; // Guarda conductores conectados

function initializeSocketOr(server) {
    io = new Server(server, {
        cors: {
            origin: '*', 
            methods: ['GET', 'POST'],
        },
        path: '/api/socket/', 
    });

    io.on('connection', (socket) => {
     
        console.log('Conductor conectado:', socket.id);

        socket.on('registrar_conductor', (driverId) => {
        
            connectedDrivers[driverId] = socket.id;
            console.log("Listado de conductores ", connectedDrivers )
        });

        socket.on('respuesta_solicitud', (data) => {
            io.emit(`respuesta_solicitud_${data.solicitudId}`, data);
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

module.exports = { initializeSocketOr, getIO, connectedDrivers  };
