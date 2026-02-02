const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5434,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "ingenio",
});

// Verificar conexión al iniciar
pool.connect((err, client, release) => {
    if (err) {
        console.error("❌ Error conectando a la base de datos:", err.stack);
    } else {
        console.log(
            "✅ Conexión exitosa a PostgreSQL - Base de datos:",
            process.env.DB_NAME
        );
        release();
    }
});

module.exports = pool;