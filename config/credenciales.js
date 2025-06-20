module.exports = {
    hostname: 'myhostname',
    database: {
        host: process.env.DB_HOST || "srv1543.hstgr.io", //traido desde hostinger. para establecer la conexión remota.
        user: process.env.DB_USER || "u889064612_unrayadmin",
        password: process.env.DB_PASSWORD || "H$h60pA!zY",
        database: process.env.DB_DATABASE || "u889064612_unrayprod",
        connectTimeout: 20000,   // 20 segundos para handshake
        acquireTimeout: 20000,   // 20 segundos para obtener una conexión del pool
        connectionLimit: 10,     // límite de conexiones simultáneas
        waitForConnections: true // espera si no hay conexiones disponibles
    }
    /*  hostname: 'localhost',
      database: {
          host: "localhost", // dirección para establecer la conexión
          port: 3306, // puerto donde se ejecuta el servidor  motor de base de datos
          user: "root", // usuario de login 
          password: "Lib49@pz", // contraseña asignada a la base de datos (esto segun hayas configurado tu motor de base de datos).
          database: "unray", // nombre de la base de datos
      } */


}
