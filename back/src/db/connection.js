const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // obligatorio en Render
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Verificar conexión al iniciar
(async() => {
    try {
        const client = await pool.connect();
        console.log("✅ Conectado a PostgreSQL (Render)");
        client.release();
    } catch (err) {
        console.error("❌ Error conectando a PostgreSQL:", err.message);
    }
})();

module.exports = pool;