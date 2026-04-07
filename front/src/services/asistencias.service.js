import api from "../api/api";

// Obtener todos los alumnos con estado de asistencia para una fecha
// params: { fecha, buscar, grado }
export const getAsistenciasPorFecha = (params = {}) =>
  api.get("/asistencias", { params });

// Marcar asistencia individual
// data: { alumno_id, fecha, estado, hora_ingreso?, nota? }
export const marcarAsistencia = (data) =>
  api.post("/asistencias/marcar", data);

// Marcar asistencia en lote (ej: todos presentes)
// data: { fecha, estado, alumno_ids: [] }
export const marcarAsistenciaLote = (data) =>
  api.post("/asistencias/marcar-lote", data);

// Obtener reporte de asistencias
// params: { desde, hasta, grado, alumno_id }
export const getReporteAsistencias = (params = {}) =>
  api.get("/asistencias/reporte", { params });
