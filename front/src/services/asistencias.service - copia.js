import api from "../api/api";

// Obtener asistencias con filtros
export const getAsistencias = (params = {}) => {
    return api.get("/asistencias", { params });
};

// Obtener asistencias de un alumno específico
export const getAsistenciasByAlumno = (alumnoId) => {
    return api.get(`/asistencias/alumno/${alumnoId}`);
};

// Obtener alumnos de un curso con sus asistencias para una fecha
export const getAlumnosConAsistencia = (cursoId, anio, fecha = null) => {
    let url = `/asistencias/alumnos-curso?curso_id=${cursoId}&anio=${anio}`;
    if (fecha) url += `&fecha=${fecha}`;
    return api.get(url);
};

// Guardar lote de asistencias
export const saveAsistencias = (fecha, asistencias) => {
    return api.post("/asistencias/batch", { fecha, asistencias });
};

// Eliminar asistencia
export const deleteAsistencia = (id) => {
    return api.delete(`/asistencias/${id}`);
};