/**
 * seed-admin.js — Crear / resetear superusuario admin
 */

require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const readline = require("readline");

/* ✅ CONEXIÓN CORRECTA (SIN DATABASE_URL) */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD), // 👈 importante
  database: process.env.DB_NAME,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q) => new Promise((res) => rl.question(q, res));

(async () => {
  console.log("\n=== CREAR SUPER ADMIN ===\n");

  const username = (await ask("Usuario (default: admin): ")).trim() || "admin";
  const password = (await ask("Contraseña: ")).trim();

  rl.close();

  if (!password || password.length < 6) {
    console.error("❌ La contraseña debe tener mínimo 6 caracteres");
    process.exit(1);
  }

  /* 🔐 HASH */
  const hash = await bcrypt.hash(password, 10);

  /* 🚀 INSERT / UPDATE */
  const { rows } = await pool.query(
    `INSERT INTO usuarios (username, password, rol, estado)
     VALUES ($1, $2, 'admin', true)
     ON CONFLICT (username)
     DO UPDATE SET password = $2, rol = 'admin', estado = true
     RETURNING id, username, rol, estado, creado_en`,
    [username, hash]
  );

  console.log("\n✅ SUPER ADMIN LISTO:");
  console.table(rows);

  await pool.end();
})();