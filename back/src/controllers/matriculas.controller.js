const pool = require("../db/connection");

exports.listar = async (req, res, next) => {
  try {
    const { estado } = req.query;

    let sql = `
      SELECT m.id, m.anio, m.fecha_inicio, m.monto, m.estado,
             m.total_pagado, m.saldo,
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

    sql += " ORDER BY m.fecha_inicio DESC";

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.crear = async (req, res, next) => {
  try {
    const { alumno_id, curso_id, anio, fecha_inicio, monto } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO matriculas (alumno_id, curso_id, anio, fecha_inicio, monto)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [alumno_id, curso_id, anio, fecha_inicio, monto || 0]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, monto, fecha_inicio } = req.body;

    const campos = [];
    const vals   = [];
    let idx = 1;

    if (estado       !== undefined) { campos.push("estado = $"       + idx++); vals.push(estado); }
    if (monto        !== undefined) { campos.push("monto = $"        + idx++); vals.push(monto); }
    if (fecha_inicio !== undefined) { campos.push("fecha_inicio = $" + idx++); vals.push(fecha_inicio); }

    if (!campos.length)
      return res.status(400).json({ message: "Sin campos para actualizar" });

    vals.push(id);
    await pool.query(
      "UPDATE matriculas SET " + campos.join(", ") + " WHERE id = $" + idx,
      vals
    );

    res.json({ message: "Matricula actualizada" });
  } catch (err) {
    next(err);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    await pool.query("DELETE FROM matriculas WHERE id=$1", [req.params.id]);
    res.json({ message: "Matricula eliminada" });
  } catch (err) {
    next(err);
  }
};
