const express = require("express");
const router = express.Router();
const controller = require("../controllers/pagos.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// 🔐 RUTAS PROTEGIDAS
router.get("/", verifyToken, controller.listar);
router.post("/", verifyToken, controller.crear);
router.put("/:id", verifyToken, controller.actualizar);
router.delete("/:id", verifyToken, controller.eliminar);

module.exports = router;