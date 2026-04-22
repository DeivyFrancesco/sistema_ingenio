const pool = require("../db/connection");
const nodemailer = require("nodemailer");

/**
 * CREAR CONTACTO DESDE WEB
 */
const crear = async (req, res) => {
    try {
        const { nombre, nivel, celular, correo, mensaje } = req.body;

        if (!nombre || !mensaje) {
            return res.status(400).json({
                error: "Nombre y mensaje son obligatorios"
            });
        }

        // 1. GUARDAR EN DB
        const result = await pool.query(
            `INSERT INTO contactos_web (nombre, nivel, celular, correo, mensaje)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [nombre, nivel, celular, correo, mensaje]
        );

        // 2. ENVIAR CORREO
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Academia Ztrilce" <${process.env.EMAIL_USER}>`,
            to: "ztrilcecajamarca@gmail.com",  // ← correo destino actualizado
            subject: "📩 Nuevo mensaje desde la web",
            html: `
                <h2>Nuevo contacto recibido</h2>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Nivel:</strong> ${nivel || "-"}</p>
                <p><strong>Celular:</strong> ${celular || "-"}</p>
                <p><strong>Correo:</strong> ${correo || "-"}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${mensaje}</p>
                <hr/>
                <small>Fecha: ${new Date().toLocaleString()}</small>
            `,
        });

        res.status(201).json({
            message: "Mensaje enviado correctamente",
            contacto: result.rows[0],
        });

    } catch (error) {
        console.error("Error al crear contacto:", error);
        res.status(500).json({
            error: "Error al enviar mensaje"
        });
    }
};

module.exports = {
    crear,
};
