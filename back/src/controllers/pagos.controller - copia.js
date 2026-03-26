const pool = require("../db/connection");

/**
 * LISTAR PAGOS
 * - estado calculado en tiempo real
 * - por_vencer: aviso visual cuando faltan ≤ 2 días para vencer
 */
exports.listar = async (req, res, next) => {
  try {
    const { buscar } = req.query;

    let sql = `
      SELECT
        p.id,
        p.monto,
        p.fecha_pago,
        a.nombres,
        a.apellidos,
        c.nombre        AS curso,
        me.periodo,
        me.monto        AS monto_total,
        me.fecha_inicio,
        me.fecha_vencimiento,
        me.fecha_limite_saldo,

        /* ── ESTADO ── */
        CASE
          WHEN me.monto - (
            SELECT COALESCE(SUM(p2.monto), 0)
            FROM pagos p2
            WHERE p2.mensualidad_id = me.id
          ) <= 0
            THEN 'PAGADO'
          WHEN CURRENT_DATE > me.fecha_vencimiento
            THEN 'VENCIDO'
          ELSE 'PENDIENTE'
        END AS estado,

        /* ── POR VENCER ── */
        (
          me.monto - (
            SELECT COALESCE(SUM(p2.monto), 0)
            FROM pagos p2
            WHERE p2.mensualidad_id = me.id
          ) > 0
          AND CURRENT_DATE >= me.fecha_vencimiento - INTERVAL '2 days'
          AND CURRENT_DATE <= me.fecha_vencimiento
        ) AS por_vencer,

        /* saldo restante de esa mensualidad */
        me.monto - (
          SELECT COALESCE(SUM(p2.monto), 0)
          FROM pagos p2
          WHERE p2.mensualidad_id = me.id
        ) AS saldo_mensualidad

      FROM pagos p
      JOIN mensualidades me ON me.id = p.mensualidad_id
      JOIN matriculas    m  ON m.id  = me.matricula_id
      JOIN alumnos       a  ON a.id  = m.alumno_id
      JOIN cursos        c  ON c.id  = m.curso_id
    `;

    const params = [];
    if (buscar) {
      sql += " WHERE a.nombres ILIKE $1 OR a.apellidos ILIKE $1";
      params.push(`%${buscar}%`);
    }

    sql += " ORDER BY p.fecha_pago DESC";

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * CREAR PAGO
 * Caso 1 — pago completo: saldo queda en 0, estado pasa a PAGADO automáticamente
 * Caso 2 — pago parcial: se registra el pago y opcionalmente se guarda
 *           fecha_limite_saldo para avisar cuándo debe pagarse el resto
 */
exports.crear = async (req, res, next) => {
  try {
    const { mensualidad_id, monto, fecha_pago, fecha_limite_saldo } = req.body;

    if (!mensualidad_id || !monto || !fecha_pago) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    /* registrar el pago */
    await pool.query(
      "INSERT INTO pagos (mensualidad_id, monto, fecha_pago) VALUES ($1, $2, $3)",
      [mensualidad_id, monto, fecha_pago]
    );

    /* si es pago parcial, guardar fecha límite para el saldo restante */
    if (fecha_limite_saldo) {
      await pool.query(
        "UPDATE mensualidades SET fecha_limite_saldo = $1 WHERE id = $2",
        [fecha_limite_saldo, mensualidad_id]
      );
    }

    res.status(201).json({ message: "Pago registrado correctamente" });
  } catch (err) {
    next(err);
  }
};

/**
 * ACTUALIZAR (solo monto y fecha_pago)
 */
exports.actualizar = async (req, res, next) => {
  try {
    const { monto, fecha_pago } = req.body;

    if (!monto || !fecha_pago) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    await pool.query(
      "UPDATE pagos SET monto = $1, fecha_pago = $2 WHERE id = $3",
      [monto, fecha_pago, req.params.id]
    );

    res.json({ message: "Pago actualizado correctamente" });
  } catch (err) {
    next(err);
  }
};

/**
 * ELIMINAR
 */
exports.eliminar = async (req, res, next) => {
  try {
    await pool.query("DELETE FROM pagos WHERE id = $1", [req.params.id]);
    res.json({ message: "Pago eliminado correctamente" });
  } catch (err) {
    next(err);
  }
};
