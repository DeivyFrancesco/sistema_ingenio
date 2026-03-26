const jwt = require("jsonwebtoken");

/* ── Verifica que el token JWT sea válido ── */
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ message: "Token no proporcionado" });

  const token = authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Token mal formado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // { id, username, rol }
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

/* ── Solo administradores ── */
exports.soloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== "admin")
    return res.status(403).json({ message: "Acceso restringido: solo administradores" });
  next();
};

/**
 * Middleware flexible: acepta uno o varios roles permitidos.
 *
 * Uso en rutas:
 *   router.get("/", verifyToken, requireRoles("admin"), ctrl.listar);
 *   router.get("/", verifyToken, requireRoles("admin", "secretaria"), ctrl.listar);
 *
 * Roles del sistema:
 *   admin       => acceso total
 *   secretaria  => acceso a todo EXCEPTO mensualidades y pagos
 *   profesor    => acceso a todo EXCEPTO mensualidades y pagos
 */
exports.requireRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario?.rol))
    return res.status(403).json({
      message: `Acceso restringido. Roles permitidos: ${roles.join(", ")}`,
    });
  next();
};
