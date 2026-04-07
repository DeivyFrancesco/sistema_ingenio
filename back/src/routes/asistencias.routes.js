const express = require("express");
const router = express.Router();
const asistenciasController = require("../controllers/asistencias.controller");

// Listar alumnos con estado de asistencia por fecha
// GET /asistencias?fecha=YYYY-MM-DD&buscar=&grado=
router.get("/", asistenciasController.listarPorFecha);

// Reporte por rango de fechas
// GET /asistencias/reporte?desde=&hasta=&grado=&alumno_id=
router.get("/reporte", asistenciasController.reporte);

// Marcar asistencia individual
// POST /asistencias/marcar
router.post("/marcar", asistenciasController.marcarAsistencia);

// Marcar asistencia en lote
// POST /asistencias/marcar-lote
router.post("/marcar-lote", asistenciasController.marcarLote);

module.exports = router;
