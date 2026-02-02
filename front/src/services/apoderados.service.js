import api from "../api/api";

// Obtener todos los apoderados con búsqueda opcional
export const getApoderados = (params = {}) => {
    return api.get("/apoderados", { params });
};

// Crear apoderado
export const createApoderado = (data) => {
    return api.post("/apoderados", data);
};

// Actualizar apoderado
export const updateApoderado = (id, data) => {
    return api.put(`/apoderados/${id}`, data);
};

// Eliminar apoderado
export const deleteApoderado = (id) => {
    return api.delete(`/apoderados/${id}`);
};

// Vincular apoderado a alumno
export const vincularAlumno = (apoderado_id, alumno_id) => {
    return api.post(`/apoderados/${apoderado_id}/alumnos`, { alumno_id });
};

// Desvincular apoderado de alumno
export const desvincularAlumno = (apoderado_id, alumno_id) => {
    return api.delete(`/apoderados/${apoderado_id}/alumnos/${alumno_id}`);
};