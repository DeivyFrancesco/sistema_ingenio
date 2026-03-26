const express = require("express");
const router = express.Router();
const cursosController = require("../controllers/cursos.controller");

// Listar todos los cursos
router.get("/", cursosController.listar);

// Obtener curso por ID
router.get("/:id", cursosController.obtenerPorId);

// Obtener matrículas de un curso
router.get("/:id/matriculas", cursosController.obtenerMatriculas);

// Crear nuevo curso
router.post("/", cursosController.crear);

// Actualizar curso
router.put("/:id", cursosController.actualizar);

// Eliminar curso
router.delete("/:id", cursosController.eliminar);

module.exports = router;