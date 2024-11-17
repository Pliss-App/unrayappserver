// Imports
require('dotenv').config();
const express = require("express");
//const connection = require('./mysql');
const axios = require('axios'); // Para realizar peticiones HTTP

const multer = require('multer')
const fs = require('fs')
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const { uploadImage, uploadProduct, uploadPagos, uploadChatSoporte } = require('./firebase');
//-----------------------------------------------------------------------
const app = express()
// Middlewares
//app.use(express.json())

app.use(express.json({limit: '950mb'}));
app.use(express.urlencoded({limit: '950mb', extended: true, parameterLimit: 950000}));


var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const apiRoutes = require('./roles/index');

app.use('/api', apiRoutes);


app.get('/', (req, res) => {
    res.send('Servidor activo');
  });

const PORT = process.env.PORT || 3000;

const keepServerAlive = () => {
    setInterval(async () => {
      try {
    
        const response = await axios.get('http://localhost:' + PORT);
        console.log('Ping exitoso:', PORT ," ---- ", response.status);
      } catch (error) {
        console.error('Error en el ping:',PORT ," ---- ", error.message);
      }
    }, 50 * 1000); // Cada 5 minutos
  };

// Arrancar Servidor
// set port, listen for requests
//const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    keepServerAlive();
});