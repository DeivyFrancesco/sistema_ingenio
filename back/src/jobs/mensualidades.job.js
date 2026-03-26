const cron = require("node-cron");
const pool = require("../db/connection");

/**
 * JOB QUE SE EJECUTA TODOS LOS DÍAS A LAS 00:00
 * Actualiza el estado de mensualidades vencidas
 */
const verificarVencimientos = cron.schedule("0 0 * * *", async() => {
    try {
        console.log("🕐 Ejecutando job de verificación de vencimientos...");

        const result = await pool.query(
            `UPDATE mensualidades 
       SET estado = 'VENCIDO'
       WHERE fecha_vencimiento < CURRENT_DATE 
       AND estado = 'PENDIENTE'
       RETURNING id, periodo, fecha_vencimiento`
        );

        if (result.rows.length > 0) {
            console.log(
                `✅ ${result.rows.length} mensualidades marcadas como VENCIDAS`
            );
            result.rows.forEach((men) => {
                console.log(
                    `   - Mensualidad ID: ${men.id}, Periodo: ${men.periodo}, Vencimiento: ${men.fecha_vencimiento}`
                );
            });
        } else {
            console.log("✅ No hay mensualidades vencidas pendientes de actualizar");
        }
    } catch (error) {
        console.error("❌ Error en job de vencimientos:", error);
    }
});

// Iniciar el job
verificarVencimientos.start();

console.log(
    "✅ Job de verificación de vencimientos iniciado (se ejecuta diariamente a las 00:00)"
);

module.exports = verificarVencimientos;