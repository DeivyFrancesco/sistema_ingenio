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
const authRoutes = require("./routes/auth.routes");

// MIDDLEWARES
const { notFound, errorHandler } = require("./middlewares/errorHandler");

// JOBS (se ejecutan automáticamente)
require("./jobs/mensualidades.job");

const app = express();

// MIDDLEWARES GLOBALES
app.use(
    cors({
        origin: "*",
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROOT
app.get("/", (req, res) => {
    res.json({
        message: "🎓 Sistema Ingenio - API REST",
        version: "1.0.0",
        status: "activo",
        endpoints: {
            alumnos: "/alumnos",
            cursos: "/cursos",
            matriculas: "/matriculas",
            mensualidades: "/mensualidades",
            pagos: "/pagos",
            apoderados: "/apoderados",
        },
    });
});

// ENDPOINTS
app.use("/alumnos", alumnosRoutes);
app.use("/cursos", cursosRoutes);
app.use("/matriculas", matriculasRoutes);
app.use("/mensualidades", mensualidadesRoutes);
app.use("/pagos", pagosRoutes);
app.use("/apoderados", apoderadosRoutes);
app.use("/reportes", reportesRoutes);
app.use("/auth", authRoutes);

// MANEJO DE ERRORES (debe ir al final)
app.use(notFound);
app.use(errorHandler);

// SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});