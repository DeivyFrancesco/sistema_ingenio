const express = require("express");
const router = express.Router();
const controller = require("../controllers/mensualidades.controller");

router.get("/", controller.listar);
router.get("/pendientes", controller.pendientes);
router.post("/", controller.crear);
router.delete("/:id", controller.eliminar);

module.exports = router;
