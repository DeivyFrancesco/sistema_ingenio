const express = require("express");
const cors = require("cors");
require("dotenv").config();

// RUTAS
const alumnosRoutes = require("./routes/alumnos.routes");
const cursosRoutes = require("./routes/cursos.routes");
const matriculasRoutes = require("./routes/matriculas.routes");
const mensualidadesRoutes = require("./routes/mensualidades.routes");
const pagosRoutes = require("./routes/pagos.routes");
const apoderadosRoutes = require("./routes/apoderados.routes");
const reportesRoutes = require("./routes/reportes.routes");

// MIDDLEWARES
const { notFound, errorHandler } = require("./middlewares/errorHandler");

// JOBS (se ejecutan automáticamente)
require("./jobs/mensualidades.job");

const app = express();

// MIDDLEWARES GLOBALES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROOT
app.get("/", (req, res) => {
    res.json({
        message: "🎓 Sistema Ingenio - API REST",
        version: "1.0.0",
        status: "activo",
        endpoints: {
            alumnos: "/api/alumnos",
            cursos: "/api/cursos",
            matriculas: "/api/matriculas",
            mensualidades: "/api/mensualidades",
            pagos: "/api/pagos",
            apoderados: "/api/apoderados",
            reportes: "/api/reportes",
        },
    });
});

// ENDPOINTS CON PREFIJO /api/
app.use("/api/alumnos", alumnosRoutes);
app.use("/api/cursos", cursosRoutes);
app.use("/api/matriculas", matriculasRoutes);
app.use("/api/mensualidades", mensualidadesRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/apoderados", apoderadosRoutes);
app.use("/api/reportes", reportesRoutes);

// MANEJO DE ERRORES (debe ir al final)
app.use(notFound);
app.use(errorHandler);

// SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║   🎓 SISTEMA INGENIO - BACKEND        ║
║   Servidor corriendo en puerto ${PORT}   ║
║   http://localhost:${PORT}                ║
╚═══════════════════════════════════════╝
  `);
});