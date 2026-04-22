const express = require("express");
const router  = express.Router();
const contactoCtrl = require("../controllers/contactos.controller");

// PÚBLICO → no requiere autenticación
router.post("/", contactoCtrl.crear);

module.exports = router;
