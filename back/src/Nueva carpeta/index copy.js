const express = require("express");
const cors = require("cors");

// RUTAS
const alumnosRoutes = require("./routes/alumnos.routes");
const cursosRoutes = require("./routes/cursos.routes");
const matriculasRoutes = require("./routes/matriculas.routes");
const mensualidadesRoutes = require("./routes/mensualidades.routes");
const pagosRoutes = require("./routes/pagos.routes");
const apoderadosRoutes = require("./routes/apoderados.routes");

// JOBS
require("./jobs/mensualidades.job");

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// ENDPOINTS
app.use("/alumnos", alumnosRoutes);
app.use("/cursos", cursosRoutes);
app.use("/matriculas", matriculasRoutes);
app.use("/mensualidades", mensualidadesRoutes);
app.use("/pagos", pagosRoutes);
app.use("/apoderados", apoderadosRoutes);

// ROOT
app.get("/", (req, res) => {
  res.send("Sistema Ingenio backend activo");
});

// SERVER
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
