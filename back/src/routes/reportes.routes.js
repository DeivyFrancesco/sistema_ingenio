const express = require("express");
const router = express.Router();
const {
    alumnosMorosos,
    ingresosPorPeriodo,
    estadisticasGenerales,
} = require("../utils/reportes");

/**
 * OBTENER ALUMNOS MOROSOS
 */
router.get("/morosos", async(req, res) => {
    try {
        const data = await alumnosMorosos();
        res.json(data);
    } catch (error) {
        console.error("Error al obtener alumnos morosos:", error);
        res.status(500).json({ error: "Error al obtener alumnos morosos" });
    }
});

/**
 * OBTENER INGRESOS POR PERIODO
 * Query params: anio (requerido), mes (opcional)
 */
router.get("/ingresos", async(req, res) => {
    try {
        const { anio, mes } = req.query;

        if (!anio) {
            return res.status(400).json({
                error: "El parámetro 'anio' es requerido",
            });
        }

        const data = await ingresosPorPeriodo(
            parseInt(anio),
            mes ? parseInt(mes) : null
        );
        res.json(data);
    } catch (error) {
        console.error("Error al obtener ingresos:", error);
        res.status(500).json({ error: "Error al obtener ingresos" });
    }
});

/**
 * OBTENER ESTADÍSTICAS GENERALES
 */
router.get("/estadisticas", async(req, res) => {
    try {
        const data = await estadisticasGenerales();
        res.json(data);
    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        res.status(500).json({ error: "Error al obtener estadísticas" });
    }
});

module.exports = router;