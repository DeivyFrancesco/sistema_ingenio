const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ingenio",
  password: "postgres",
  port: 5434,
});

// 🔍 Verificar conexión al iniciar
pool
  .query("SELECT NOW()")
  .then((res) => {
    console.log("PostgreSQL conectado correctamente:", res.rows[0]);
  })
  .catch((err) => {
    console.error("Error conectando a PostgreSQL:", err);
  });

module.exports = pool;
