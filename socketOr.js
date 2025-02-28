const { Server } = require('socket.io');

let io;
const connectedDrivers = {};
const connectedUsers = {};
const respuestasSolicitudes = {};
const userStatus = {};

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
            userStatus[driverId] = 1;  
        });

        socket.on('registrar_usuario', (userId) => {
            connectedUsers[userId] = socket.id;
            userStatus[userId] = 1;
        });

        socket.on('cambiar_estado', (data) => {
            const { userId, estado } = data;
            userStatus[userId] = estado; // Guardar estado del usuario
            
            // Si el usuario cambia a "offline", permitir desconexión
            if (estado === 0) {
                delete connectedUsers[userId];
                delete connectedDrivers[userId];
                console.log(`Usuario ${userId} ahora está desconectado`);
            } else {
                // Si está en línea, volver a agregarlo si se había eliminado
                if (!connectedUsers[userId] && !connectedDrivers[userId]) {
                    connectedUsers[userId] = socket.id;
                }
            }
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
            let userId = Object.keys(connectedUsers).find(key => connectedUsers[key] === socket.id) || 
                         Object.keys(connectedDrivers).find(key => connectedDrivers[key] === socket.id);
            
            if (userId && userStatus[userId] !== 0) {
                console.log(`⚠️ Usuario ${userId} sigue en línea, re-agregando...`);
                connectedUsers[userId] = socket.id;
            } else {
                console.log(`🛑 Usuario ${userId} se desconectó.`);
                delete connectedUsers[userId];
                delete connectedDrivers[userId];
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

module.exports = { initializeSocketOr, getIO, connectedDrivers, connectedUsers, respuestasSolicitudes };
