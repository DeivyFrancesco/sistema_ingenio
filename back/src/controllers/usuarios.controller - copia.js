const pool    = require("../db/connection");
const bcrypt  = require("bcryptjs");

/* ── LISTAR todos los usuarios ── */
exports.listar = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, rol, estado, creado_en
       FROM usuarios
       ORDER BY creado_en DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

/* ── CREAR usuario con rol ── */
exports.crear = async (req, res, next) => {
  try {
    const { username, password, rol } = req.body;

    if (!username || !password || !rol)
      return res.status(400).json({ message: "Faltan campos obligatorios" });

    const rolesValidos = ["admin", "secretaria", "profesor"];
    if (!rolesValidos.includes(rol))
      return res.status(400).json({ message: `Rol inválido. Usa: ${rolesValidos.join(", ")}` });

    const existe = await pool.query(
      "SELECT id FROM usuarios WHERE username = $1", [username]
    );
    if (existe.rows.length > 0)
      return res.status(400).json({ message: "El usuario ya existe" });

    const hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO usuarios (username, password, rol)
       VALUES ($1, $2, $3)
       RETURNING id, username, rol, estado, creado_en`,
      [username, hash, rol]
    );

    res.status(201).json({ message: "Usuario creado correctamente", usuario: rows[0] });
  } catch (err) { next(err); }
};

/* ── ACTUALIZAR rol, estado y/o contraseña ── */
exports.actualizar = async (req, res, next) => {
  try {
    const { rol, estado, password } = req.body;
    const { id } = req.params;

    const rolesValidos = ["admin", "secretaria", "profesor"];
    if (rol && !rolesValidos.includes(rol))
      return res.status(400).json({ message: `Rol inválido. Usa: ${rolesValidos.join(", ")}` });

    if (password && password.trim() !== "") {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        "UPDATE usuarios SET rol = $1, estado = $2, password = $3 WHERE id = $4",
        [rol, estado, hash, id]
      );
    } else {
      await pool.query(
        "UPDATE usuarios SET rol = $1, estado = $2 WHERE id = $3",
        [rol, estado, id]
      );
    }

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (err) { next(err); }
};

/* ── ELIMINAR usuario ── */
exports.eliminar = async (req, res, next) => {
  try {
    const payload = req.usuario; // viene del middleware verifyToken
    if (parseInt(req.params.id) === payload.id)
      return res.status(400).json({ message: "No puedes eliminarte a ti mismo" });

    const existe = await pool.query("SELECT id FROM usuarios WHERE id = $1", [req.params.id]);
    if (existe.rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    await pool.query("DELETE FROM usuarios WHERE id = $1", [req.params.id]);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) { next(err); }
};
