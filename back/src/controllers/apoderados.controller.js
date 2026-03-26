const pool = require("../db/connection");

/**
 * LISTAR APODERADOS CON SUS ALUMNOS
 *
 
/**
 * LISTAR APODERADOS CON SUS ALUMNOS Y BÚSQUEDA
 * Query params: ?buscar=texto
 */
const listar = async(req, res) => {
    try {
        const { buscar } = req.query;

        let query = `
      SELECT 
        a.id,
        a.nombres,
        a.telefono,
        a.created_at,
        json_agg(
          json_build_object(
            'alumno_id', al.id,
            'alumno_nombres', al.nombres,
            'alumno_apellidos', al.apellidos,
            'alumno_dni', al.dni
          )
        ) as alumnos
      FROM apoderados a
      LEFT JOIN alumno_apoderado aa ON aa.apoderado_id = a.id
      LEFT JOIN alumnos al ON al.id = aa.alumno_id
      WHERE 1=1
    `;

        const params = [];
        let paramCount = 1;

        // Búsqueda por nombre de apoderado
        if (buscar) {
            query += ` AND a.nombres ILIKE $${paramCount}`;
            params.push(`%${buscar}%`);
            paramCount++;
        }

        query += `
      GROUP BY a.id, a.nombres, a.telefono, a.created_at
      ORDER BY a.id DESC
    `;

        const result = await pool.query(query, params);

        res.json({
            total: result.rows.length,
            apoderados: result.rows,
        });
    } catch (error) {
        console.error("Error al listar apoderados:", error);
        res.status(500).json({ error: "Error al listar apoderados" });
    }
};

/**
 * OBTENER UN APODERADO POR ID
 */
const obtenerPorId = async(req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT 
        a.id,
        a.nombres,
        a.telefono,
        a.created_at,
        json_agg(
          json_build_object(
            'alumno_id', al.id,
            'alumno_nombres', al.nombres,
            'alumno_apellidos', al.apellidos,
            'alumno_dni', al.dni,
            'alumno_grado', al.grado
          )
        ) as alumnos
      FROM apoderados a
      LEFT JOIN alumno_apoderado aa ON aa.apoderado_id = a.id
      LEFT JOIN alumnos al ON al.id = aa.alumno_id
      WHERE a.id = $1
      GROUP BY a.id, a.nombres, a.telefono, a.created_at`, [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Apoderado no encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al obtener apoderado:", error);
        res.status(500).json({ error: "Error al obtener apoderado" });
    }
};

/**
 * CREAR APODERADO Y VINCULAR A ALUMNO
 */
const crear = async(req, res) => {
    const client = await pool.connect();

    try {
        const { nombres, telefono, alumno_id } = req.body;

        // Validaciones
        if (!nombres || !alumno_id) {
            return res.status(400).json({
                error: "Faltan datos requeridos: nombres, alumno_id",
            });
        }

        await client.query("BEGIN");

        // Verificar que el alumno existe
        const alumnoExiste = await client.query(
            "SELECT id FROM alumnos WHERE id = $1", [alumno_id]
        );

        if (alumnoExiste.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Alumno no encontrado" });
        }

        // Crear apoderado
        const apoderadoResult = await client.query(
            `INSERT INTO apoderados (nombres, telefono)
       VALUES ($1, $2)
       RETURNING *`, [nombres, telefono]
        );

        const apoderado = apoderadoResult.rows[0];

        // Vincular con alumno
        await client.query(
            `INSERT INTO alumno_apoderado (alumno_id, apoderado_id)
       VALUES ($1, $2)`, [alumno_id, apoderado.id]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Apoderado creado y vinculado exitosamente",
            apoderado,
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al crear apoderado:", error);
        res.status(500).json({ error: "Error al crear apoderado" });
    } finally {
        client.release();
    }
};

/**
 * ACTUALIZAR APODERADO
 */
const actualizar = async(req, res) => {
    try {
        const { id } = req.params;
        const { nombres, telefono } = req.body;

        // Verificar si existe el apoderado
        const apoderadoExiste = await pool.query(
            "SELECT id FROM apoderados WHERE id = $1", [id]
        );

        if (apoderadoExiste.rows.length === 0) {
            return res.status(404).json({ error: "Apoderado no encontrado" });
        }

        const result = await pool.query(
            `UPDATE apoderados
       SET nombres = $1, telefono = $2
       WHERE id = $3
       RETURNING *`, [nombres, telefono, id]
        );

        res.json({
            message: "Apoderado actualizado exitosamente",
            apoderado: result.rows[0],
        });
    } catch (error) {
        console.error("Error al actualizar apoderado:", error);
        res.status(500).json({ error: "Error al actualizar apoderado" });
    }
};

/**
 * ELIMINAR APODERADO (y vínculos)
 */
const eliminar = async(req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        await client.query("BEGIN");

        // Eliminar vínculos
        await client.query(`DELETE FROM alumno_apoderado WHERE apoderado_id = $1`, [
            id,
        ]);

        // Eliminar apoderado
        const result = await client.query(
            `DELETE FROM apoderados WHERE id = $1 RETURNING *`, [id]
        );

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Apoderado no encontrado" });
        }

        await client.query("COMMIT");

        res.json({ message: "Apoderado eliminado exitosamente" });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al eliminar apoderado:", error);
        res.status(500).json({ error: "Error al eliminar apoderado" });
    } finally {
        client.release();
    }
};

/**
 * VINCULAR APODERADO A OTRO ALUMNO
 */
const vincularAlumno = async(req, res) => {
    try {
        const { id } = req.params;
        const { alumno_id } = req.body;

        // Validaciones
        if (!alumno_id) {
            return res.status(400).json({
                error: "El alumno_id es requerido",
            });
        }

        // Verificar que existan apoderado y alumno
        const apoderadoExiste = await pool.query(
            "SELECT id FROM apoderados WHERE id = $1", [id]
        );

        if (apoderadoExiste.rows.length === 0) {
            return res.status(404).json({ error: "Apoderado no encontrado" });
        }

        const alumnoExiste = await pool.query(
            "SELECT id FROM alumnos WHERE id = $1", [alumno_id]
        );

        if (alumnoExiste.rows.length === 0) {
            return res.status(404).json({ error: "Alumno no encontrado" });
        }

        // Verificar que no exista ya el vínculo
        const vinculoExiste = await pool.query(
            "SELECT * FROM alumno_apoderado WHERE apoderado_id = $1 AND alumno_id = $2", [id, alumno_id]
        );

        if (vinculoExiste.rows.length > 0) {
            return res.status(409).json({
                error: "El vínculo ya existe",
            });
        }

        // Crear vínculo
        await pool.query(
            `INSERT INTO alumno_apoderado (alumno_id, apoderado_id)
       VALUES ($1, $2)`, [alumno_id, id]
        );

        res.status(201).json({
            message: "Alumno vinculado exitosamente",
        });
    } catch (error) {
        console.error("Error al vincular alumno:", error);
        res.status(500).json({ error: "Error al vincular alumno" });
    }
};

/**
 * DESVINCULAR APODERADO DE UN ALUMNO
 */
const desvincularAlumno = async(req, res) => {
    try {
        const { id, alumno_id } = req.params;

        const result = await pool.query(
            `DELETE FROM alumno_apoderado 
       WHERE apoderado_id = $1 AND alumno_id = $2 
       RETURNING *`, [id, alumno_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Vínculo no encontrado" });
        }

        res.json({ message: "Alumno desvinculado exitosamente" });
    } catch (error) {
        console.error("Error al desvincular alumno:", error);
        res.status(500).json({ error: "Error al desvincular alumno" });
    }
};

module.exports = {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    vincularAlumno,
    desvincularAlumno,
};