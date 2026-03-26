const express = require("express");
const router = express.Router();
const alumnosController = require("../controllers/alumnos.controller");

// Listar todos los alumnos
router.get("/", alumnosController.listar);

// Obtener alumno por ID
router.get("/:id", alumnosController.obtenerPorId);

// Obtener matrículas de un alumno
router.get("/:id/matriculas", alumnosController.obtenerMatriculas);

// Obtener apoderados de un alumno
router.get("/:id/apoderados", alumnosController.obtenerApoderados);

// Crear nuevo alumno
router.post("/", alumnosController.crear);

// Actualizar alumno
router.put("/:id", alumnosController.actualizar);

// Eliminar alumno
router.delete("/:id", alumnosController.eliminar);

module.exports = router;