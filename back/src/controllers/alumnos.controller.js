const pool = require("../db/connection");

/**
 * LISTAR TODOS LOS ALUMNOS
 */
/**
 * LISTAR TODOS LOS ALUMNOS CON BÚSQUEDA
 * Query params: ?buscar=texto&grado=1ro
 */
const listar = async(req, res) => {
    try {
        const { buscar, grado } = req.query;

        let query = "SELECT * FROM alumnos WHERE 1=1";
        const params = [];
        let paramCount = 1;

        // Búsqueda por nombre, apellido o DNI
        if (buscar) {
            query += ` AND (
        nombres ILIKE $${paramCount} OR 
        apellidos ILIKE $${paramCount} OR 
        dni ILIKE $${paramCount}
      )`;
            params.push(`%${buscar}%`);
            paramCount++;
        }

        // Filtro por grado
        if (grado) {
            query += ` AND grado = $${paramCount}`;
            params.push(grado);
            paramCount++;
        }

        query += " ORDER BY id DESC";

        const result = await pool.query(query, params);

        res.json({
            total: result.rows.length,
            alumnos: result.rows,
        });
    } catch (error) {
        console.error("Error al listar alumnos:", error);
        res.status(500).json({ error: "Error al listar alumnos" });
    }
};

/**
 * OBTENER UN ALUMNO POR ID
 */
const obtenerPorId = async(req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query("SELECT * FROM alumnos WHERE id = $1", [
            id,
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Alumno no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al obtener alumno:", error);
        res.status(500).json({ error: "Error al obtener alumno" });
    }
};

/**
 * CREAR ALUMNO
 */
const crear = async(req, res) => {
    try {
        const { dni, nombres, apellidos, telefono, grado } = req.body;

        // Validaciones
        if (!dni || !nombres || !apellidos) {
            return res.status(400).json({
                error: "Faltan datos requeridos: dni, nombres, apellidos",
            });
        }

        // Verificar que el DNI no exista
        const dniExistente = await pool.query(
            "SELECT id FROM alumnos WHERE dni = $1", [dni]
        );

        if (dniExistente.rows.length > 0) {
            return res.status(409).json({
                error: "Ya existe un alumno con ese DNI",
            });
        }

        const result = await pool.query(
            `INSERT INTO alumnos (dni, nombres, apellidos, telefono, grado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [dni, nombres, apellidos, telefono, grado]
        );

        res.status(201).json({
            message: "Alumno creado exitosamente",
            alumno: result.rows[0],
        });
    } catch (error) {
        console.error("Error al crear alumno:", error);
        res.status(500).json({ error: "Error al crear alumno" });
    }
};

/**
 * ACTUALIZAR ALUMNO
 */
const actualizar = async(req, res) => {
    try {
        const { id } = req.params;
        const { dni, nombres, apellidos, telefono, grado } = req.body;

        // Verificar si existe el alumno
        const alumnoExiste = await pool.query(
            "SELECT id FROM alumnos WHERE id = $1", [id]
        );

        if (alumnoExiste.rows.length === 0) {
            return res.status(404).json({ error: "Alumno no encontrado" });
        }

        // Verificar DNI duplicado (excluyendo el mismo alumno)
        const dniDuplicado = await pool.query(
            "SELECT id FROM alumnos WHERE dni = $1 AND id != $2", [dni, id]
        );

        if (dniDuplicado.rows.length > 0) {
            return res.status(409).json({
                error: "Ya existe otro alumno con ese DNI",
            });
        }

        const result = await pool.query(
            `UPDATE alumnos
       SET dni=$1, nombres=$2, apellidos=$3, telefono=$4, grado=$5
       WHERE id=$6
       RETURNING *`, [dni, nombres, apellidos, telefono, grado, id]
        );

        res.json({
            message: "Alumno actualizado exitosamente",
            alumno: result.rows[0],
        });
    } catch (error) {
        console.error("Error al actualizar alumno:", error);
        res.status(500).json({ error: "Error al actualizar alumno" });
    }
};

/**
 * ELIMINAR ALUMNO
 */
const eliminar = async(req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM alumnos WHERE id = $1 RETURNING *", [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Alumno no encontrado" });
        }

        res.json({ message: "Alumno eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar alumno:", error);
        res.status(500).json({ error: "Error al eliminar alumno" });
    }
};

/**
 * OBTENER MATRÍCULAS DE UN ALUMNO
 */
const obtenerMatriculas = async(req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT 
        m.*,
        c.nombre AS curso,
        c.nivel,
        c.precio_base
      FROM matriculas m
      JOIN cursos c ON c.id = m.curso_id
      WHERE m.alumno_id = $1
      ORDER BY m.anio DESC, m.fecha_inicio DESC`, [id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener matrículas:", error);
        res.status(500).json({ error: "Error al obtener matrículas" });
    }
};

/**
 * OBTENER APODERADOS DE UN ALUMNO
 */
const obtenerApoderados = async(req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT 
        a.id,
        a.nombres,
        a.telefono
      FROM apoderados a
      JOIN alumno_apoderado aa ON aa.apoderado_id = a.id
      WHERE aa.alumno_id = $1`, [id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener apoderados:", error);
        res.status(500).json({ error: "Error al obtener apoderados" });
    }
};

module.exports = {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    obtenerMatriculas,
    obtenerApoderados,
};