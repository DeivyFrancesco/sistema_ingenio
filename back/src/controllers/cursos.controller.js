const pool = require("../db/connection");

/**
 * LISTAR TODOS LOS CURSOS
 */
/**
 * LISTAR TODOS LOS CURSOS CON BÚSQUEDA
 * Query params: ?buscar=texto&nivel=Primaria
 */
const listar = async(req, res) => {
    try {
        const { buscar, nivel } = req.query;

        let query = "SELECT * FROM cursos WHERE 1=1";
        const params = [];
        let paramCount = 1;

        // Búsqueda por nombre
        if (buscar) {
            query += ` AND nombre ILIKE $${paramCount}`;
            params.push(`%${buscar}%`);
            paramCount++;
        }

        // Filtro por nivel
        if (nivel) {
            query += ` AND nivel = $${paramCount}`;
            params.push(nivel);
            paramCount++;
        }

        query += " ORDER BY id DESC";

        const result = await pool.query(query, params);

        res.json({
            total: result.rows.length,
            cursos: result.rows,
        });
    } catch (error) {
        console.error("Error al listar cursos:", error);
        res.status(500).json({ error: "Error al listar cursos" });
    }
};

/**
 * OBTENER UN CURSO POR ID
 */
const obtenerPorId = async(req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query("SELECT * FROM cursos WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al obtener curso:", error);
        res.status(500).json({ error: "Error al obtener curso" });
    }
};

/**
 * CREAR CURSO
 */
const crear = async(req, res) => {
    try {
        const { nombre, nivel, precio_base } = req.body;

        // Validaciones
        if (!nombre) {
            return res.status(400).json({
                error: "El nombre del curso es requerido",
            });
        }

        // Verificar que no exista curso con el mismo nombre y nivel
        const cursoExistente = await pool.query(
            "SELECT id FROM cursos WHERE nombre = $1 AND nivel = $2", [nombre, nivel]
        );

        if (cursoExistente.rows.length > 0) {
            return res.status(409).json({
                error: "Ya existe un curso con ese nombre y nivel",
            });
        }

        const result = await pool.query(
            `INSERT INTO cursos (nombre, nivel, precio_base)
       VALUES ($1, $2, $3) RETURNING *`, [nombre, nivel, precio_base || 0]
        );

        res.status(201).json({
            message: "Curso creado exitosamente",
            curso: result.rows[0],
        });
    } catch (error) {
        console.error("Error al crear curso:", error);
        res.status(500).json({ error: "Error al crear curso" });
    }
};

/**
 * ACTUALIZAR CURSO
 */
const actualizar = async(req, res) => {
    try {
        const { id } = req.params;
        const { nombre, nivel, precio_base } = req.body;

        // Verificar si existe el curso
        const cursoExiste = await pool.query(
            "SELECT id FROM cursos WHERE id = $1", [id]
        );

        if (cursoExiste.rows.length === 0) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }

        // Verificar duplicado (excluyendo el mismo curso)
        const cursoDuplicado = await pool.query(
            "SELECT id FROM cursos WHERE nombre = $1 AND nivel = $2 AND id != $3", [nombre, nivel, id]
        );

        if (cursoDuplicado.rows.length > 0) {
            return res.status(409).json({
                error: "Ya existe otro curso con ese nombre y nivel",
            });
        }

        const result = await pool.query(
            `UPDATE cursos
       SET nombre=$1, nivel=$2, precio_base=$3
       WHERE id=$4
       RETURNING *`, [nombre, nivel, precio_base, id]
        );

        res.json({
            message: "Curso actualizado exitosamente",
            curso: result.rows[0],
        });
    } catch (error) {
        console.error("Error al actualizar curso:", error);
        res.status(500).json({ error: "Error al actualizar curso" });
    }
};

/**
 * ELIMINAR CURSO
 */
const eliminar = async(req, res) => {
    try {
        const { id } = req.params;

        // Verificar si hay matrículas asociadas
        const matriculasAsociadas = await pool.query(
            "SELECT COUNT(*) as total FROM matriculas WHERE curso_id = $1", [id]
        );

        if (parseInt(matriculasAsociadas.rows[0].total) > 0) {
            return res.status(409).json({
                error: "No se puede eliminar el curso porque tiene matrículas asociadas",
            });
        }

        const result = await pool.query(
            "DELETE FROM cursos WHERE id = $1 RETURNING *", [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }

        res.json({ message: "Curso eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar curso:", error);
        res.status(500).json({ error: "Error al eliminar curso" });
    }
};

/**
 * OBTENER MATRÍCULAS DE UN CURSO
 */
const obtenerMatriculas = async(req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT 
        m.*,
        a.nombres,
        a.apellidos,
        a.dni
      FROM matriculas m
      JOIN alumnos a ON a.id = m.alumno_id
      WHERE m.curso_id = $1
      ORDER BY m.fecha_inicio DESC`, [id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener matrículas:", error);
        res.status(500).json({ error: "Error al obtener matrículas" });
    }
};

module.exports = {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    obtenerMatriculas,
};