const pool = require("../db/connection");

exports.listar = async (req, res, next) => {
  try {
    const { estado } = req.query;

    let sql = `
      SELECT m.id, m.anio,
             a.nombres, a.apellidos,
             c.nombre AS curso
      FROM matriculas m
      JOIN alumnos a ON a.id = m.alumno_id
      JOIN cursos c ON c.id = m.curso_id
    `;

    const params = [];
    if (estado) {
      sql += " WHERE m.estado = $1";
      params.push(estado);
    }

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.crear = async (req, res, next) => {
  try {
    const { alumno_id, curso_id, anio, monto } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO matriculas (alumno_id, curso_id, anio, monto)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [alumno_id, curso_id, anio, monto]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    await pool.query(
      "UPDATE matriculas SET estado=$1 WHERE id=$2",
      [estado, id]
    );

    res.json({ message: "Matrícula actualizada" });
  } catch (err) {
    next(err);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    await pool.query("DELETE FROM matriculas WHERE id=$1", [req.params.id]);
    res.json({ message: "Matrícula eliminada" });
  } catch (err) {
    next(err);
  }
};
