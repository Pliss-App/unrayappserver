// Imports
require('dotenv').config();
require('./jobs/saldoChecker');
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const { initializeSocket } = require('./socket'); // Importa el inicializador de Socket.IO
const { initializeSocketOr } = require('./socketOr');
const app = express();
// 👇 Solución al error
app.set('trust proxy', 1);

const server = http.createServer(app); // Crea el servidor HTTP usando Express
// 👈 Iniciamos el socket aquí
// Inicializa Socket.IO con el servidor
const PORT = process.env.PORT || 3000;


app.use(express.json({ limit: '990mb' }));
app.use(express.urlencoded({ limit: '990mb', extended: true, parameterLimit: 900000 }));
app.use("/uploads", express.static("uploads"));


var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
/*
  const allowedOrigins = [
  'http://localhost:3000',    
  'http://127.0.0.1:3000',
  'https://unrayappserver.onrender.com',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8100',
  'https://unraylatinoamerica.com',
  'https://dashboard.unraylatinoamerica.com',
  'capacitor://localhost',
  'http://localhost',
  'http://192.168.1.10:3000', 
    'file://', // apps móviles usando Capacitor// tu IP local con puerto de backend
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
}));*/


app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




app.get('/api/conection', (req, res) => {
  res.send('Servidor activo');
});

//module.exports = { io };


initializeSocketOr(server).then(() => {
  const apiRoutes = require('./roles/index');

  app.use('/api', apiRoutes);

  const ser = server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });

})
  .catch(err => {
    console.error('❌ Error al inicializar sockets:', err);
  });
//initializeSocket(ser);
//initializeSocketOr(ser);