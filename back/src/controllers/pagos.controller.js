const pool = require("../db/connection");

exports.listar = async (req, res, next) => {
  try {
    const { buscar } = req.query;

    let sql = `
      SELECT p.id, p.monto, p.fecha_pago,
             a.nombres, a.apellidos,
             c.nombre AS curso,
             me.periodo
      FROM pagos p
      JOIN mensualidades me ON me.id = p.mensualidad_id
      JOIN matriculas m ON m.id = me.matricula_id
      JOIN alumnos a ON a.id = m.alumno_id
      JOIN cursos c ON c.id = m.curso_id
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

exports.crear = async (req, res, next) => {
  try {
    const { mensualidad_id, monto, fecha_pago, fecha_limite_saldo } = req.body;

    await pool.query(
      "INSERT INTO pagos (mensualidad_id, monto, fecha_pago) VALUES ($1,$2,$3)",
      [mensualidad_id, monto, fecha_pago]
    );

    // 👉 guardar fecha límite del saldo si viene
    if (fecha_limite_saldo) {
      await pool.query(
        "UPDATE mensualidades SET fecha_limite_saldo=$1 WHERE id=$2",
        [fecha_limite_saldo, mensualidad_id]
      );
    }

    res.status(201).json({ message: "Pago registrado" });
  } catch (err) {
    next(err);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    const { monto, fecha_pago } = req.body;

    await pool.query(
      "UPDATE pagos SET monto=$1, fecha_pago=$2 WHERE id=$3",
      [monto, fecha_pago, req.params.id]
    );

    res.json({ message: "Pago actualizado" });
  } catch (err) {
    next(err);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    await pool.query("DELETE FROM pagos WHERE id=$1", [req.params.id]);
    res.json({ message: "Pago eliminado" });
  } catch (err) {
    next(err);
  }
};
