const pool = require("../db/connection");

/**
 * LISTAR MENSUALIDADES
 * Incluye:
 * - total pagado
 * - fecha del primer pago
 * - saldo pendiente
 */
exports.listar = async (req, res, next) => {
  try {
    const { buscar } = req.query;

    let sql = `
      SELECT 
        me.*,
        a.nombres,
        a.apellidos,
        c.nombre AS curso,

        COALESCE(SUM(p.monto),0) AS pagado,
        MIN(p.fecha_pago) AS fecha_primer_pago,
        me.monto - COALESCE(SUM(p.monto),0) AS saldo

      FROM mensualidades me
      JOIN matriculas m ON m.id = me.matricula_id
      JOIN alumnos a ON a.id = m.alumno_id
      JOIN cursos c ON c.id = m.curso_id
      LEFT JOIN pagos p ON p.mensualidad_id = me.id
    `;

    const params = [];
    if (buscar) {
      sql += " WHERE a.nombres ILIKE $1 OR a.apellidos ILIKE $1";
      params.push(`%${buscar}%`);
    }

    sql += `
      GROUP BY 
        me.id,
        a.nombres,
        a.apellidos,
        c.nombre
      ORDER BY me.fecha_vencimiento
    `;

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * LISTAR SOLO MENSUALIDADES PENDIENTES
 */
exports.pendientes = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        me.id,
        me.periodo,
        me.fecha_inicio,
        me.fecha_vencimiento,
        me.fecha_limite_saldo,
        a.nombres,
        a.apellidos,
        c.nombre AS curso,
        me.monto - COALESCE(SUM(p.monto),0) AS saldo

      FROM mensualidades me
      JOIN matriculas m ON m.id = me.matricula_id
      JOIN alumnos a ON a.id = m.alumno_id
      JOIN cursos c ON c.id = m.curso_id
      LEFT JOIN pagos p ON p.mensualidad_id = me.id

      GROUP BY 
        me.id,
        a.nombres,
        a.apellidos,
        c.nombre

      HAVING me.monto - COALESCE(SUM(p.monto),0) > 0
    `);

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * CREAR MENSUALIDAD
 */
exports.crear = async (req, res, next) => {
  try {
    const {
      matricula_id,
      periodo,
      monto,
      fecha_inicio,
      fecha_vencimiento,
    } = req.body;

    const { rows } = await pool.query(
      `
      INSERT INTO mensualidades
      (matricula_id, periodo, monto, fecha_inicio, fecha_vencimiento)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [matricula_id, periodo, monto, fecha_inicio, fecha_vencimiento]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * ELIMINAR MENSUALIDAD
 */
exports.eliminar = async (req, res, next) => {
  try {
    await pool.query(
      "DELETE FROM mensualidades WHERE id=$1",
      [req.params.id]
    );
    res.json({ message: "Mensualidad eliminada" });
  } catch (err) {
    next(err);
  }
};
