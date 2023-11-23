module.exports = {
    hostname: 'myhostname',
    database: {
        host: process.env.DB_HOST || "sql644.main-hosting.eu", //traido desde hostinger. para establecer la conexión remota.
        user: process.env.DB_USER || "u614121371_chilazo",
        password: process.env.DB_PASSWORD || "iB>A[F$s0",
        database: process.env.DB_DATABASE || "u614121371_alchilazo",
    }

}
