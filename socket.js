// socket.js
const socketIo = require('socket.io');
let io;

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: '*', // Ajustar según sea necesario
        methods: ['GET', 'POST']
      }
    });
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io no ha sido inicializado.');
    }
    return io;
  }
};
