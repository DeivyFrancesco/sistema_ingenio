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


    /* ── AUTO-CREAR SIGUIENTE MENSUALIDAD cuando saldo queda en 0 ── */
    const { rows: saldoRows } = await pool.query(
      `SELECT
         me.matricula_id,
         me.monto,
         me.fecha_vencimiento::text AS fecha_vencimiento,
         me.monto - COALESCE(SUM(p2.monto), 0) AS saldo_actual
       FROM mensualidades me
       LEFT JOIN pagos p2 ON p2.mensualidad_id = me.id
       WHERE me.id = $1
       GROUP BY me.id`,
      [mensualidad_id]
    );

    if (saldoRows.length > 0 && parseFloat(saldoRows[0].saldo_actual) <= 0) {
      const mens = saldoRows[0];

      /* Parsear fecha sin problemas de timezone usando solo la parte de fecha */
      const [anio, mes, dia] = mens.fecha_vencimiento.slice(0, 10).split('-').map(Number);

      /* fecha_inicio de la nueva = fecha_vencimiento de la actual */
      const fInicio = `${anio}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;

      /* fecha_vencimiento de la nueva = +1 mes exacto */
      let mesNuevo  = mes + 1;
      let anioNuevo = anio;
      if (mesNuevo > 12) { mesNuevo = 1; anioNuevo++; }
      const fVence = `${anioNuevo}-${String(mesNuevo).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;

      /* período YYYY-MM */
      const periodo = `${anioNuevo}-${String(mesNuevo).padStart(2,'0')}`;

      await pool.query(
        `INSERT INTO mensualidades
             (matricula_id, periodo, monto, fecha_inicio, fecha_vencimiento)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (matricula_id, periodo) DO NOTHING`,
        [mens.matricula_id, periodo, mens.monto, fInicio, fVence]
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
