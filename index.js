// Imports
require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*', // Permitir acceso desde cualquier origen
        methods: ['GET', 'POST']
    }
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

const apiRoutes = require('./roles/index');

app.use('/api', apiRoutes);


app.get('/api/socket/', (req, res) => {
  res.send('Servidor activo');
});



//module.exports = { io };

const PORT = process.env.PORT || 3000;

const ser = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

