const pool = require("../db/connection");

/**
 * LISTAR MENSUALIDADES
 * - estado se calcula en tiempo real (no se usa el campo guardado en DB)
 * - por_vencer = true si faltan 2 días o menos para vencer (y aún tiene saldo)
 */
exports.listar = async(req, res, next) => {
    try {
        const { buscar } = req.query;

        let sql = `
      SELECT 
        me.id,
        me.matricula_id,
        me.periodo,
        me.monto,
        me.fecha_inicio,
        me.fecha_vencimiento,
        me.fecha_limite_saldo,
        me.created_at,
        a.nombres,
        a.apellidos,
        ap.nombres AS apoderado,
        c.nombre AS curso,
        COALESCE(SUM(p.monto), 0)                        AS pagado,
        MIN(p.fecha_pago)                                 AS fecha_primer_pago,
        me.monto - COALESCE(SUM(p.monto), 0)             AS saldo,

        /* ── ESTADO ── */
        CASE
          WHEN me.monto - COALESCE(SUM(p.monto), 0) <= 0
            THEN 'PAGADO'
          WHEN CURRENT_DATE > me.fecha_vencimiento
            THEN 'VENCIDO'
          ELSE 'PENDIENTE'
        END AS estado,

        /* ── POR VENCER: saldo pendiente y quedan ≤ 2 días ── */
        (
          me.monto - COALESCE(SUM(p.monto), 0) > 0
          AND CURRENT_DATE >= me.fecha_vencimiento - INTERVAL '2 days'
          AND CURRENT_DATE <= me.fecha_vencimiento
        ) AS por_vencer,

        /* días restantes (negativo = ya venció) */
        me.fecha_vencimiento - CURRENT_DATE AS dias_para_vencer

      FROM mensualidades me
      JOIN matriculas        m  ON m.id  = me.matricula_id
      JOIN alumnos           a  ON a.id  = m.alumno_id
      JOIN cursos            c  ON c.id  = m.curso_id
      LEFT JOIN alumno_apoderado aa ON aa.alumno_id    = a.id
      LEFT JOIN apoderados       ap ON ap.id           = aa.apoderado_id
      LEFT JOIN pagos            p  ON p.mensualidad_id = me.id
    `;

        const params = [];
        if (buscar) {
            sql += " WHERE a.nombres ILIKE $1 OR a.apellidos ILIKE $1";
            params.push(`%${buscar}%`);
        }

        sql += `
      GROUP BY me.id, a.nombres, a.apellidos, ap.nombres, c.nombre
      ORDER BY a.apellidos ASC, a.nombres ASC, me.fecha_vencimiento DESC
    `;

        const { rows } = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

/**
 * PENDIENTES + VENCIDOS (con saldo > 0)
 * Incluye por_vencer para que el selector del formulario pueda mostrarlo
 */
exports.pendientes = async(req, res, next) => {
    try {
        const { rows } = await pool.query(`
      SELECT 
        me.id,
        me.periodo,
        me.monto,
        me.fecha_inicio,
        me.fecha_vencimiento,
        me.fecha_limite_saldo,
        a.nombres,
        a.apellidos,
        ap.nombres AS apoderado,
        c.nombre AS curso,
        me.monto - COALESCE(SUM(p.monto), 0) AS saldo,

        CASE
          WHEN CURRENT_DATE > me.fecha_vencimiento THEN 'VENCIDO'
          ELSE 'PENDIENTE'
        END AS estado,

        (
          CURRENT_DATE >= me.fecha_vencimiento - INTERVAL '2 days'
          AND CURRENT_DATE <= me.fecha_vencimiento
        ) AS por_vencer

      FROM mensualidades me
      JOIN matriculas        m  ON m.id  = me.matricula_id
      JOIN alumnos           a  ON a.id  = m.alumno_id
      JOIN cursos            c  ON c.id  = m.curso_id
      LEFT JOIN alumno_apoderado aa ON aa.alumno_id    = a.id
      LEFT JOIN apoderados       ap ON ap.id           = aa.apoderado_id
      LEFT JOIN pagos            p  ON p.mensualidad_id = me.id

      GROUP BY me.id, a.nombres, a.apellidos, ap.nombres, c.nombre
      HAVING me.monto - COALESCE(SUM(p.monto), 0) > 0
      ORDER BY me.fecha_vencimiento DESC
    `);

        res.json(rows);
    } catch (err) {
        next(err);
    }
};

/**
 * CREAR
 */
exports.crear = async(req, res, next) => {
    try {
        const { matricula_id, periodo, monto, fecha_inicio, fecha_vencimiento } =
        req.body;

        if (!matricula_id ||
            !periodo ||
            !monto ||
            !fecha_inicio ||
            !fecha_vencimiento
        ) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const { rows } = await pool.query(
            `INSERT INTO mensualidades
         (matricula_id, periodo, monto, fecha_inicio, fecha_vencimiento)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [matricula_id, periodo, monto, fecha_inicio, fecha_vencimiento],
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        next(err);
    }
};

/**
 * ELIMINAR
 */
exports.eliminar = async(req, res, next) => {
    try {
        await pool.query("DELETE FROM mensualidades WHERE id = $1", [
            req.params.id,
        ]);
        res.json({ message: "Mensualidad eliminada" });
    } catch (err) {
        next(err);
    }
};
