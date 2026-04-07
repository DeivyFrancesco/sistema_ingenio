const express = require("express");
const router = express.Router();
const asistenciasController = require("../controllers/asistencias.controller");

// Listar asistencias (filtros: fecha, curso)
router.get("/", asistenciasController.obtenerAsistencias);

// Asistencias de un alumno específico
router.get("/alumno/:id", asistenciasController.obtenerAsistenciasPorAlumno);

// Obtener alumnos de un curso con sus asistencias (para formulario)
router.get("/alumnos-curso", asistenciasController.obtenerAlumnosConAsistencia);

// Guardar lote de asistencias (crear/actualizar)
router.post("/batch", asistenciasController.guardarAsistencias);

// Eliminar asistencia individual
router.delete("/:id", asistenciasController.eliminarAsistencia);

// Buscar alumnos del sistema (para agregar visitantes)
router.get("/alumnos/buscar", asistenciasController.buscarAlumnos);

module.exports = router;