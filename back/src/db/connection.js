const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5434,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ingenio",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    max: 10, // máximo de conexiones
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Verificar conexión al iniciar
(async() => {
    try {
        const client = await pool.connect();
        console.log(
            "✅ Conexión exitosa a PostgreSQL - Base de datos:",
            process.env.DB_NAME || "ingenio",
        );
        client.release();
    } catch (err) {
        console.error("❌ Error conectando a PostgreSQL:", err.message);
    }
})();

module.exports = pool;