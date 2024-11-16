module.exports = {
    hostname: 'myhostname',
    database: {
        host: process.env.DB_HOST || "srv1543.hstgr.io", //traido desde hostinger. para establecer la conexión remota.
        user: process.env.DB_USER || "u889064612_adminray",
        password: process.env.DB_PASSWORD || "Ov5zTInX?",
        database: process.env.DB_DATABASE || "u889064612_unray",
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
