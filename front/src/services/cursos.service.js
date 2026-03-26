import api from "../api/api";

// Obtener todos los cursos con búsqueda opcional
export const getCursos = (params = {}) => {
    return api.get("/cursos", { params });
};

// Crear curso
export const createCurso = (data) => {
    return api.post("/cursos", data);
};

// Actualizar curso
export const updateCurso = (id, data) => {
    return api.put(`/cursos/${id}`, data);
};

// Eliminar curso
export const deleteCurso = (id) => {
    return api.delete(`/cursos/${id}`);
};