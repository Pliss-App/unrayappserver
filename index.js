// Imports
require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const app = express();

const server = http.createServer(app); // Crea el servidor HTTP usando Express
const io = socketIo(server, {
  cors: {
    origin: '*', // Permite conexiones desde cualquier origen
    methods: ['GET', 'POST'], // Métodos permitidos
  },
  path: '/api/socket/', // Ruta personalizada para los sockets
});

app.use(express.json({ limit: '990mb' }));
app.use(express.urlencoded({ limit: '990mb', extended: true, parameterLimit: 900000 }));

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Compartir `io` con otras partes de la aplicación

app.set('socketio', io);

// Ruta para probar el servidor
app.get('/', (req, res) => {
  res.send('Servidor activo');
});

// Configuración de Socket.IO
io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  // Ejemplo: emitir un evento al cliente
  socket.emit('mensaje_bienvenida', { mensaje: 'Bienvenido al servidor de Socket.IO' });

  // Escuchar eventos del cliente
  socket.on('evento_cliente', (data) => {
    console.log(`Evento recibido del cliente:`, data);
  });

  // Manejar la desconexión
  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});


const apiRoutes = require('./roles/index');

app.use('/api', apiRoutes);


//module.exports = { io };

const PORT = process.env.PORT || 3000;

const ser = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

