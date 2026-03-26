const cron = require("node-cron");
const pool = require("../db/connection");

// 🔁 Corre todos los días a las 02:00 AM
cron.schedule("0 2 * * *", async () => {
  try {
    console.log("⏰ Ejecutando control de mensualidades...");

    // 1️⃣ Marcar mensualidades vencidas
    await pool.query(`
      UPDATE mensualidades
      SET estado = 'VENCIDO'
      WHERE fecha_vencimiento < CURRENT_DATE
      AND estado = 'PENDIENTE'
    `);

    console.log("✅ Mensualidades vencidas actualizadas");
  } catch (error) {
    console.error("❌ Error en job mensualidades:", error);
  }
});
