const pool = require("../db/connection");

/**
 * LISTAR PROSPECTOS CON FILTROS
 */
const listar = async (req, res) => {
    try {
        const { buscar, estado } = req.query;
        let query = "SELECT * FROM prospectos WHERE 1=1";
        const params = [];
        let paramCount = 1;

        if (buscar) {
            query += ` AND (
                nombre_padre ILIKE $${paramCount} OR
                nombre_hijo  ILIKE $${paramCount} OR
                telefono     ILIKE $${paramCount}
            )`;
            params.push(`%${buscar}%`);
            paramCount++;
        }

        if (estado) {
            query += ` AND estado = $${paramCount}`;
            params.push(estado);
            paramCount++;
        }

        query += " ORDER BY fecha_prevista ASC NULLS LAST, id DESC";

        const result = await pool.query(query, params);
        res.json({ total: result.rows.length, prospectos: result.rows });
    } catch (error) {
        console.error("Error al listar prospectos:", error);
        res.status(500).json({ error: "Error al listar prospectos" });
    }
};

/**
 * OBTENER UN PROSPECTO POR ID
 */
const obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM prospectos WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Prospecto no encontrado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al obtener prospecto:", error);
        res.status(500).json({ error: "Error al obtener prospecto" });
    }
};

/**
 * CREAR PROSPECTO
 */
const crear = async (req, res) => {
    try {
        const { nombre_padre, nombre_hijo, telefono, grado_interes, fecha_prevista, estado, notas } = req.body;

        if (!nombre_padre || !nombre_hijo) {
            return res.status(400).json({ error: "Faltan datos requeridos: nombre_padre, nombre_hijo" });
        }

        const result = await pool.query(
            `INSERT INTO prospectos (nombre_padre, nombre_hijo, telefono, grado_interes, fecha_prevista, estado, notas)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                nombre_padre,
                nombre_hijo,
                telefono || null,
                grado_interes || null,
                fecha_prevista || null,
                estado || "pendiente",
                notas || null,
            ]
        );

        res.status(201).json({ message: "Prospecto creado exitosamente", prospecto: result.rows[0] });
    } catch (error) {
        console.error("Error al crear prospecto:", error);
        res.status(500).json({ error: "Error al crear prospecto" });
    }
};

/**
 * ACTUALIZAR PROSPECTO
 */
const actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_padre, nombre_hijo, telefono, grado_interes, fecha_prevista, estado, notas } = req.body;

        const existe = await pool.query("SELECT id FROM prospectos WHERE id = $1", [id]);
        if (existe.rows.length === 0) {
            return res.status(404).json({ error: "Prospecto no encontrado" });
        }

        const result = await pool.query(
            `UPDATE prospectos
             SET nombre_padre=$1, nombre_hijo=$2, telefono=$3, grado_interes=$4,
                 fecha_prevista=$5, estado=$6, notas=$7, updated_at=CURRENT_TIMESTAMP
             WHERE id=$8 RETURNING *`,
            [nombre_padre, nombre_hijo, telefono || null, grado_interes || null,
             fecha_prevista || null, estado || "pendiente", notas || null, id]
        );

        res.json({ message: "Prospecto actualizado exitosamente", prospecto: result.rows[0] });
    } catch (error) {
        console.error("Error al actualizar prospecto:", error);
        res.status(500).json({ error: "Error al actualizar prospecto" });
    }
};

/**
 * ELIMINAR PROSPECTO
 */
const eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM prospectos WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Prospecto no encontrado" });
        }
        res.json({ message: "Prospecto eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar prospecto:", error);
        res.status(500).json({ error: "Error al eliminar prospecto" });
    }
};

/**
 * OBTENER PROSPECTOS PRÓXIMOS (en los siguientes N días)
 */
const proximos = async (req, res) => {
    try {
        const dias = parseInt(req.query.dias) || 7;
        const result = await pool.query(
            `SELECT * FROM prospectos
             WHERE fecha_prevista BETWEEN CURRENT_DATE AND CURRENT_DATE + $1::int
               AND estado NOT IN ('matriculado', 'no_interesado')
             ORDER BY fecha_prevista ASC`,
            [dias]
        );
        res.json({ total: result.rows.length, prospectos: result.rows });
    } catch (error) {
        console.error("Error al obtener próximos prospectos:", error);
        res.status(500).json({ error: "Error al obtener próximos prospectos" });
    }
};

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar, proximos };
