const pool = require("../db/connection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// LOGIN
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM usuarios WHERE username = $1 AND estado = true",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const usuario = result.rows[0];

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login correcto",
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    next(error);
  }
};

// REGISTER
exports.register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username y password son obligatorios" });
    }

    const existe = await pool.query(
      "SELECT id FROM usuarios WHERE username = $1",
      [username]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (username, password)
       VALUES ($1, $2)
       RETURNING id, username, rol`,
      [username, passwordHash]
    );

    res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
