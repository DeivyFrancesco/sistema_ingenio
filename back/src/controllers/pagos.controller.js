const pool = require("../db/connection");

/**
 * LISTAR PAGOS (CORREGIDO)
 */
exports.listar = async (req, res, next) => {
  try {
    const { buscar } = req.query;

    let sql = `
      SELECT
        p.id,
        p.monto,
        p.fecha_pago,

        /* ── ALUMNO ── */
        a.id AS alumno_id,
        a.nombres,
        a.apellidos,

        /* ── CURSO ── */
        c.nombre AS curso,

        /* ── MENSUALIDAD ── */
        me.id AS mensualidad_id,
        me.periodo,
        me.monto AS monto_total,
        me.fecha_inicio,
        me.fecha_vencimiento,
        me.fecha_limite_saldo,

        /* ── APODERADO (SIN apellidos porque no existe) ── */
        ap.nombres AS apoderado_nombres,
        NULL AS apoderado_apellidos,
        ap.telefono AS apoderado_telefono,

        /* ── TOTAL PAGADO ── */
        COALESCE(SUM(p2.monto), 0) AS total_pagado,

        /* ── SALDO ── */
        me.monto - COALESCE(SUM(p2.monto), 0) AS saldo_mensualidad,

        /* ── ESTADO ── */
        CASE
          WHEN me.monto - COALESCE(SUM(p2.monto), 0) <= 0 THEN 'PAGADO'
          WHEN CURRENT_DATE > me.fecha_vencimiento THEN 'VENCIDO'
          ELSE 'PENDIENTE'
        END AS estado,

        /* ── POR VENCER ── */
        (
          me.monto - COALESCE(SUM(p2.monto), 0) > 0
          AND CURRENT_DATE >= me.fecha_vencimiento - INTERVAL '2 days'
          AND CURRENT_DATE <= me.fecha_vencimiento
        ) AS por_vencer

      FROM pagos p
      JOIN mensualidades me ON me.id = p.mensualidad_id
      JOIN matriculas m ON m.id = me.matricula_id
      JOIN alumnos a ON a.id = m.alumno_id
      JOIN cursos c ON c.id = m.curso_id

      LEFT JOIN pagos p2 ON p2.mensualidad_id = me.id
      LEFT JOIN alumno_apoderado aa ON aa.alumno_id = a.id
      LEFT JOIN apoderados ap ON ap.id = aa.apoderado_id
    `;

    const params = [];
    if (buscar) {
      sql += " WHERE a.nombres ILIKE $1 OR a.apellidos ILIKE $1";
      params.push(`%${buscar}%`);
    }

    sql += `
      GROUP BY 
        p.id,
        a.id, a.nombres, a.apellidos,
        c.nombre,
        me.id, me.periodo, me.monto, me.fecha_inicio, me.fecha_vencimiento, me.fecha_limite_saldo,
        ap.nombres, ap.telefono
      ORDER BY p.fecha_pago DESC
    `;

    const { rows } = await pool.query(sql, params);
    res.json(rows);

  } catch (err) {
    console.error("❌ ERROR LISTAR PAGOS:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * CREAR PAGO (OK)
 */
exports.crear = async (req, res, next) => {
  try {
    const { mensualidad_id, monto, fecha_pago, fecha_limite_saldo } = req.body;

    if (!mensualidad_id || !monto || !fecha_pago) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    await pool.query(
      "INSERT INTO pagos (mensualidad_id, monto, fecha_pago) VALUES ($1, $2, $3)",
      [mensualidad_id, monto, fecha_pago]
    );

    if (fecha_limite_saldo) {
      await pool.query(
        "UPDATE mensualidades SET fecha_limite_saldo = $1 WHERE id = $2",
        [fecha_limite_saldo, mensualidad_id]
      );
    }

    /* ── VERIFICAR SI YA SE PAGÓ TODO ── */
    const { rows } = await pool.query(
      `SELECT 
         me.matricula_id,
         me.monto,
         me.fecha_vencimiento,
         me.monto - COALESCE(SUM(p.monto), 0) AS saldo
       FROM mensualidades me
       LEFT JOIN pagos p ON p.mensualidad_id = me.id
       WHERE me.id = $1
       GROUP BY me.id`,
      [mensualidad_id]
    );

    if (rows.length && parseFloat(rows[0].saldo) <= 0) {
      const mens = rows[0];

      const fecha = new Date(mens.fecha_vencimiento);
      const dia = fecha.getDate();

      fecha.setMonth(fecha.getMonth() + 1);

      const anio = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");

      const nuevaFecha = `${anio}-${mes}-${String(dia).padStart(2, "0")}`;
      const periodo = `${anio}-${mes}`;

      await pool.query(
        `INSERT INTO mensualidades
          (matricula_id, periodo, monto, fecha_inicio, fecha_vencimiento)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (matricula_id, periodo) DO NOTHING`,
        [mens.matricula_id, periodo, mens.monto, mens.fecha_vencimiento, nuevaFecha]
      );
    }

    res.status(201).json({ message: "Pago registrado correctamente" });

  } catch (err) {
    console.error("❌ ERROR CREAR PAGO:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * ACTUALIZAR
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
    console.error("❌ ERROR ACTUALIZAR:", err.message);
    res.status(500).json({ error: err.message });
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
    console.error("❌ ERROR ELIMINAR:", err.message);
    res.status(500).json({ error: err.message });
  }
};