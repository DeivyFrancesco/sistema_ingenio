const pool = require("../db/connection");
const listarPorFecha = async (req, res) => {
    try {
        const { fecha, buscar, grado } = req.query;
        const fechaConsulta = fecha || new Date().toISOString().split("T")[0];

        let query = `
            SELECT 
                a.id          AS alumno_id,
                a.dni,
                a.nombres,
                a.apellidos,
                a.grado,
                a.telefono,
                a.dias_asistencia,
                m.id          AS matricula_id,
                ast.id        AS asistencia_id,
                ast.estado,
                ast.hora_ingreso,
                ast.nota
            FROM alumnos a
            JOIN LATERAL (
                SELECT id FROM matriculas
                WHERE alumno_id = a.id
                ORDER BY id DESC
                LIMIT 1
            ) m ON true
            LEFT JOIN asistencias ast
                ON ast.matricula_id = m.id
                AND ast.fecha = $1
            WHERE 1=1
        `;

        const params = [fechaConsulta];
        let idx = 2;

        if (buscar) {
            query += ` AND (
                a.nombres  ILIKE $${idx} OR
                a.apellidos ILIKE $${idx} OR
                a.dni       ILIKE $${idx}
            )`;
            params.push(`%${buscar}%`);
            idx++;
        }

        if (grado) {
            query += ` AND a.grado = $${idx}`;
            params.push(grado);
            idx++;
        }

        query += " ORDER BY a.apellidos, a.nombres";

        const result = await pool.query(query, params);
        const rows = result.rows;

        const stats = {
            presentes:   rows.filter((r) => r.estado === "presente").length,
            ausentes:    rows.filter((r) => r.estado === "ausente").length,
            tarde:       rows.filter((r) => r.estado === "tarde").length,
            justificado: rows.filter((r) => r.estado === "justificado").length,
            sinMarcar:   rows.filter((r) => !r.estado && r.matricula_id).length,
        };

        res.json({
            fecha: fechaConsulta,
            total: rows.length,
            stats,
            alumnos: rows,
        });
    } catch (error) {
        console.error("Error al listar asistencias:", error);
        res.status(500).json({ error: "Error al listar asistencias" });
    }
};

// Las otras funciones (marcarAsistencia, marcarLote, reporte) permanecen igual.

/**
 * MARCAR / ACTUALIZAR ASISTENCIA DE UN ALUMNO
 * POST /asistencias/marcar
 * Body: { alumno_id, fecha, estado, hora_ingreso?, nota? }
 */
const marcarAsistencia = async (req, res) => {
  try {
    const { alumno_id, fecha, estado, hora_ingreso, nota } = req.body;

    if (!alumno_id || !fecha || !estado) {
      return res.status(400).json({
        error: "Faltan datos requeridos: alumno_id, fecha, estado",
      });
    }

    const estadosValidos = ["presente", "ausente", "tarde", "justificado"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: "Estado no válido" });
    }

    // Obtener la matrícula más reciente del alumno
    const matResult = await pool.query(
      "SELECT id FROM matriculas WHERE alumno_id = $1 ORDER BY id DESC LIMIT 1",
      [alumno_id]
    );

    if (matResult.rows.length === 0) {
      return res.status(400).json({
        error: "El alumno no tiene matrícula registrada",
      });
    }

    const matricula_id = matResult.rows[0].id;

    // UPSERT: inserta o actualiza si ya existe para ese día
    const result = await pool.query(
      `INSERT INTO asistencias (matricula_id, fecha, estado, hora_ingreso, nota)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (matricula_id, fecha)
       DO UPDATE SET
         estado       = EXCLUDED.estado,
         hora_ingreso = EXCLUDED.hora_ingreso,
         nota         = EXCLUDED.nota,
         updated_at   = CURRENT_TIMESTAMP
       RETURNING *`,
      [matricula_id, fecha, estado, hora_ingreso || null, nota || null]
    );

    res.json({
      message: "Asistencia registrada correctamente",
      asistencia: result.rows[0],
    });
  } catch (error) {
    console.error("Error al marcar asistencia:", error);
    res.status(500).json({ error: "Error al marcar asistencia" });
  }
};

/**
 * MARCAR ASISTENCIA EN LOTE (todos presentes, etc.)
 * POST /asistencias/marcar-lote
 * Body: { fecha, estado, alumno_ids: [1,2,3] }
 */
const marcarLote = async (req, res) => {
  const client = await pool.connect();
  try {
    const { fecha, estado, alumno_ids } = req.body;

    if (!fecha || !estado || !Array.isArray(alumno_ids) || alumno_ids.length === 0) {
      return res.status(400).json({ error: "Faltan datos: fecha, estado, alumno_ids[]" });
    }

    const estadosValidos = ["presente", "ausente", "tarde", "justificado"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: "Estado no válido" });
    }

    await client.query("BEGIN");

    let marcados = 0;
    let sinMatricula = 0;

    for (const alumno_id of alumno_ids) {
      const matResult = await client.query(
        "SELECT id FROM matriculas WHERE alumno_id = $1 ORDER BY id DESC LIMIT 1",
        [alumno_id]
      );

      if (matResult.rows.length === 0) {
        sinMatricula++;
        continue;
      }

      const matricula_id = matResult.rows[0].id;

      await client.query(
        `INSERT INTO asistencias (matricula_id, fecha, estado)
         VALUES ($1, $2, $3)
         ON CONFLICT (matricula_id, fecha)
         DO UPDATE SET estado = EXCLUDED.estado, updated_at = CURRENT_TIMESTAMP`,
        [matricula_id, fecha, estado]
      );
      marcados++;
    }

    await client.query("COMMIT");

    res.json({
      message: `${marcados} asistencias marcadas como "${estado}"`,
      marcados,
      sinMatricula,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en marcado por lote:", error);
    res.status(500).json({ error: "Error al marcar asistencias en lote" });
  } finally {
    client.release();
  }
};

/**
 * REPORTE DE ASISTENCIAS POR RANGO DE FECHAS
 * GET /asistencias/reporte?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&grado=&alumno_id=
 */
const reporte = async (req, res) => {
  try {
    const { desde, hasta, grado, alumno_id } = req.query;

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const today = now.toISOString().split("T")[0];

    const fechaDesde = desde || firstDay;
    const fechaHasta = hasta || today;

    let query = `
      SELECT
        a.id          AS alumno_id,
        a.dni,
        a.nombres,
        a.apellidos,
        a.grado,
        ast.fecha,
        ast.estado,
        ast.hora_ingreso,
        ast.nota
      FROM alumnos a
      JOIN matriculas m   ON m.alumno_id   = a.id
      JOIN asistencias ast ON ast.matricula_id = m.id
      WHERE ast.fecha BETWEEN $1 AND $2
    `;

    const params = [fechaDesde, fechaHasta];
    let idx = 3;

    if (grado) {
      query += ` AND a.grado = $${idx}`;
      params.push(grado);
      idx++;
    }

    if (alumno_id) {
      query += ` AND a.id = $${idx}`;
      params.push(alumno_id);
      idx++;
    }

    query += " ORDER BY a.apellidos, a.nombres, ast.fecha DESC";

    const result = await pool.query(query, params);

    // Agrupar por alumno
    const mapaAlumnos = {};
    result.rows.forEach((row) => {
      if (!mapaAlumnos[row.alumno_id]) {
        mapaAlumnos[row.alumno_id] = {
          alumno_id:  row.alumno_id,
          dni:        row.dni,
          nombres:    row.nombres,
          apellidos:  row.apellidos,
          grado:      row.grado,
          presente:   0,
          ausente:    0,
          tarde:      0,
          justificado: 0,
          total:      0,
          detalle:    [],
        };
      }
      const a = mapaAlumnos[row.alumno_id];
      a[row.estado]++;
      a.total++;
      a.detalle.push({
        fecha:       row.fecha,
        estado:      row.estado,
        hora_ingreso: row.hora_ingreso,
        nota:        row.nota,
      });
    });

    // Calcular % asistencia (presente + tarde + justificado)
    const alumnos = Object.values(mapaAlumnos).map((a) => ({
      ...a,
      porcentaje:
        a.total > 0
          ? Math.round(((a.presente + a.tarde + a.justificado) / a.total) * 100)
          : 0,
    }));

    // Totales generales
    const totales = alumnos.reduce(
      (acc, a) => ({
        presente:    acc.presente    + a.presente,
        ausente:     acc.ausente     + a.ausente,
        tarde:       acc.tarde       + a.tarde,
        justificado: acc.justificado + a.justificado,
        total:       acc.total       + a.total,
      }),
      { presente: 0, ausente: 0, tarde: 0, justificado: 0, total: 0 }
    );

    res.json({
      desde:   fechaDesde,
      hasta:   fechaHasta,
      totales,
      alumnos,
    });
  } catch (error) {
    console.error("Error al generar reporte:", error);
    res.status(500).json({ error: "Error al generar reporte de asistencias" });
  }
};

module.exports = { listarPorFecha, marcarAsistencia, marcarLote, reporte };
