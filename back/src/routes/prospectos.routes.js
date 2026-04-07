const express = require("express");
const router = express.Router();
const prospectos = require("../controllers/prospectos.controller");

// Listar todos (con filtros ?buscar=&estado=)
router.get("/", prospectos.listar);

// Próximos a matricularse (?dias=7)
router.get("/proximos", prospectos.proximos);

// Obtener uno por ID
router.get("/:id", prospectos.obtenerPorId);

// Crear
router.post("/", prospectos.crear);

// Actualizar
router.put("/:id", prospectos.actualizar);

// Eliminar
router.delete("/:id", prospectos.eliminar);

module.exports = router;
