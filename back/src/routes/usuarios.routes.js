const express = require("express");
const router  = express.Router();

/* ✅ CORREGIDO EL NOMBRE */
const ctrl = require("../controllers/usuarios.controller");

const { verifyToken, soloAdmin } = require("../middlewares/auth.middleware");

// Todas protegidas: token válido + rol admin
router.get("/",       verifyToken, soloAdmin, ctrl.listar);
router.post("/",      verifyToken, soloAdmin, ctrl.crear);
router.put("/:id",    verifyToken, soloAdmin, ctrl.actualizar);
router.delete("/:id", verifyToken, soloAdmin, ctrl.eliminar);

module.exports = router;