// Imports
require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { initializeSocket } = require('./socket'); // Importa el inicializador de Socket.IO
const {initializeSocketOr} = require('./socketOr');
const app = express();

const server = http.createServer(app); // Crea el servidor HTTP usando Express
 // 👈 Iniciamos el socket aquí
// Inicializa Socket.IO con el servidor
initializeSocketOr(server);

app.use(express.json({ limit: '990mb' }));
app.use(express.urlencoded({ limit: '990mb', extended: true, parameterLimit: 900000 }));
app.use("/uploads", express.static("uploads"));

/*
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
} */

  const allowedOrigins = [
  'http://localhost:3000',       // desarrollo local
  'http://127.0.0.1:3000',
  'https://unrayappserver.onrender.com',
  'http://localhost:8080',
  'http://localhost:8100',
  'https://unraylatinoamerica.com'        // tu dominio en producción
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman) o si está en la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No autorizado por CORS'));
    }
  }
}));


//app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const apiRoutes = require('./roles/index');

app.use('/api', apiRoutes);



app.get('/api/conection', (req, res) => {
  res.send('Servidor activo');
});

//module.exports = { io };

const PORT = process.env.PORT || 3000;

const ser = server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

//initializeSocket(ser);
//initializeSocketOr(ser);