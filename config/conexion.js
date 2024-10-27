const { database } = require('./credenciales');
const mysql = require('mysql');

const connection = mysql.createPool(database);

//connection.connect();

module.exports = connection;