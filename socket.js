const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*', 
            methods: ['GET', 'POST'],
        },
        path: '/api/socket/', 
    });

    io.on('connection', (socket) => {
        console.log(`Nuevo conductor conectado: ${socket.id}`);

        // Escuchar solicitudes activas
      /*  socket.on('solicitud_pendiente', async (data) => {
            console.log(`Solicitud pendiente para el conductor ${data.idConductor}`);

            // Buscar la solicitud activa
            const solicitudActiva = await getSolicitudActiva(data.idConductor);
            
            if (solicitudActiva) {
                // Emitir evento al cliente con la solicitud activa
                socket.emit('solicitud_activa', solicitudActiva);
            } else {
                socket.emit('solicitud_activa', null); // Si no hay solicitud activa
            }
        });*/

         // Enviar notificación cuando se recibe una nueva solicitud
    socket.on('nueva_solicitud', (data) => {
        console.log('Nueva solicitud para el conductor: ', data);
        io.to(socket.id).emit('solicitud_pendiente', data);  // Notificar al conductor conectado
    });

        socket.on('disconnect', () => {
            console.log(`Conductor desconectado: ${socket.id}`);
        });
    });
};

const getSolicitudActiva = async (idConductor) => {
    // Lógica para obtener la solicitud activa del conductor
    const query = 'SELECT * FROM solicitudes WHERE idConductor = ? AND estado = "Pendiente" LIMIT 1';
    
    return new Promise((resolve, reject) => {
        connection.query(query, [idConductor], (err, result) => {
            if (err) return reject(err);
            resolve(result[0]); // Devolvemos la primera solicitud activa
        });
    });
};

module.exports = { initializeSocket, getIo: () => io };
