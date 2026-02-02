const express = require("express");
const router = express.Router();
const apoderadosController = require("../controllers/apoderados.controller");

// Listar todos los apoderados con sus alumnos
router.get("/", apoderadosController.listar);

// Obtener apoderado por ID
router.get("/:id", apoderadosController.obtenerPorId);

// Crear apoderado y vincular a alumno
router.post("/", apoderadosController.crear);

// Vincular apoderado a otro alumno
router.post("/:id/alumnos", apoderadosController.vincularAlumno);

// Actualizar apoderado
router.put("/:id", apoderadosController.actualizar);

// Eliminar apoderado
router.delete("/:id", apoderadosController.eliminar);

// Desvincular apoderado de un alumno
router.delete(
  "/:id/alumnos/:alumno_id",
  apoderadosController.desvincularAlumno
);

module.exports = router;
