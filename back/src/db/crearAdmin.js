require("dotenv").config();
const pool = require("./connection");
const bcrypt = require("bcryptjs");

async function crearAdmin() {
    const passwordPlano = "123456";
    const passwordHash = await bcrypt.hash(passwordPlano, 10);

    await pool.query(
        `INSERT INTO usuarios (username, password, rol, estado)
     VALUES ($1, $2, $3, true)`, ["admin", passwordHash, "admin"],
    );

    console.log("✅ Usuario admin creado");
    console.log("👉 usuario: admin");
    console.log("👉 password: 123456");
    process.exit();
}

crearAdmin().catch((err) => {
    console.error("❌ Error creando admin:", err);
    process.exit(1);
});